import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Demo states
type DemoState =
  | "idle"           // Waiting for question
  | "awaiting_email" // Question submitted, asking for email
  | "validating"     // Validating email
  | "thinking"       // Waiting for AI to start responding
  | "streaming"      // AI response streaming
  | "complete"       // Response done
  | "exhausted";     // 3 queries used

// Thinking phrases that rotate (Claude Code style)
const THINKING_PHRASES = [
  "Consulting references",
  "Analyzing question",
  "Searching guidelines",
  "Gathering evidence",
  "Cross-referencing sources",
  "Formulating response",
];

interface Message {
  type: "system" | "user" | "assistant" | "error";
  content: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Warn at module load if env var is missing (helps with debugging)
if (!SUPABASE_URL) {
  console.error("CRITICAL: VITE_SUPABASE_URL environment variable is not configured");
}

const InteractiveDemo = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<DemoState>("idle");
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { type: "system", content: "Welcome to Rezzy.\nAsk any clinical question to get started." }
  ]);
  const [streamingContent, setStreamingContent] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [thinkingPhrase, setThinkingPhrase] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // Rotate thinking phrases
  useEffect(() => {
    if (state === "thinking") {
      const interval = setInterval(() => {
        setThinkingPhrase(p => (p + 1) % THINKING_PHRASES.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [state]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Focus input when state changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [state]);

  // Check localStorage for existing session
  useEffect(() => {
    const stored = localStorage.getItem("rezzy_demo_session");
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.email) {
          setEmail(session.email);
        }
        if (session.remaining !== undefined) {
          setRemaining(session.remaining);
          if (session.remaining <= 0) {
            setState("exhausted");
            setMessages([
              { type: "system", content: "Welcome back!\nYou've used your 3 free questions. Ready for unlimited access?" }
            ]);
          }
        }
      } catch (e) {
        // Clear corrupted localStorage data to prevent repeated failures
        console.error("Failed to restore demo session from localStorage:", e);
        localStorage.removeItem("rezzy_demo_session");
      }
    }
  }, []);

  const saveSession = (email: string, remaining: number) => {
    localStorage.setItem("rezzy_demo_session", JSON.stringify({ email, remaining }));
  };

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    // In exhausted state, allow empty submit to navigate to auth
    if (state === "exhausted") {
      navigate(`/auth?email=${encodeURIComponent(email)}`);
      return;
    }

    if (!trimmedInput) return;

    setErrorMessage("");

    // Handle based on current state
    if (state === "idle" || state === "complete") {
      // User submitted a question
      if (trimmedInput.length > 500) {
        setErrorMessage("Question must be 500 characters or less.");
        return;
      }

      setQuestion(trimmedInput);
      addMessage({ type: "user", content: trimmedInput });
      setInput("");

      // If we already have email, go straight to streaming
      if (email) {
        setState("streaming");
        await streamResponse(email, trimmedInput);
      } else {
        // Ask for email
        setState("awaiting_email");
        addMessage({
          type: "assistant",
          content: "Good question. Drop your email and I'll pull up the answer."
        });
      }
    } else if (state === "awaiting_email") {
      // User submitted email
      const emailInput = trimmedInput.toLowerCase();

      // Basic format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput)) {
        setErrorMessage("That email doesn't look right. Try again?");
        return;
      }

      addMessage({ type: "user", content: emailInput });
      setInput("");
      setEmail(emailInput);
      setState("validating");

      // Add thinking message
      addMessage({ type: "assistant", content: "Checking..." });

      // Stream the response (will validate email server-side)
      await streamResponse(emailInput, question);
    }
  };

  const streamResponse = async (userEmail: string, userQuestion: string) => {
    setState("thinking");
    setThinkingPhrase(0);
    setStreamingContent("");

    try {
      if (!SUPABASE_URL) {
        throw new Error("Application is misconfigured. Please contact support.");
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/demo-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, question: userQuestion })
      });

      // Handle non-streaming errors
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Server returned non-JSON error response:", {
            status: response.status,
            statusText: response.statusText
          });
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        if (errorData.error === "queries_exhausted") {
          setRemaining(0);
          saveSession(userEmail, 0);
          setState("exhausted");
          // Remove "Checking..." message and add exhausted message
          setMessages(prev => {
            const filtered = prev.filter(m => m.content !== "Checking...");
            return [...filtered, {
              type: "assistant",
              content: "You've used your 3 free questions. Ready for unlimited access?"
            }];
          });
          // Auto-redirect after a moment
          setTimeout(() => {
            navigate(`/auth?email=${encodeURIComponent(userEmail)}`);
          }, 2000);
          return;
        }

        if (errorData.error === "invalid_email" || errorData.error === "invalid_email_domain") {
          setState("awaiting_email");
          setMessages(prev => prev.filter(m => m.content !== "Checking..."));
          setErrorMessage(errorData.message || "That email doesn't look right. Try again?");
          return;
        }

        if (errorData.error === "invalid_question") {
          setState("idle");
          setMessages(prev => prev.filter(m => m.content !== "Checking..."));
          addMessage({ type: "assistant", content: errorData.message });
          return;
        }

        throw new Error(errorData.message || "Something went wrong");
      }

      // Remove "Checking..." message
      setMessages(prev => prev.filter(m => m.content !== "Checking..."));

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let fullContent = "";
      let lineBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lineBuffer += new TextDecoder().decode(value);
        const lines = lineBuffer.split("\n");
        lineBuffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "started" && parsed.remaining !== undefined) {
                setRemaining(parsed.remaining);
              } else if (parsed.type === "text_delta") {
                // Switch from thinking to streaming on first content
                setState("streaming");
                fullContent += parsed.delta;
                setStreamingContent(fullContent);
              } else if (parsed.type === "complete") {
                if (parsed.remaining !== undefined) {
                  setRemaining(parsed.remaining);
                  saveSession(userEmail, parsed.remaining);
                }
              } else if (parsed.type === "error") {
                throw new Error(parsed.message);
              }
            } catch (parseError) {
              // Re-throw errors from the error event handler
              if (parseError instanceof Error && parseError.message && !parseError.message.includes("JSON")) {
                throw parseError;
              }
              // Log JSON parse errors for debugging but continue processing
              console.warn("Failed to parse streaming response line:", {
                line: line.substring(0, 100),
                error: parseError instanceof Error ? parseError.message : "Unknown error"
              });
            }
          }
        }
      }

      // Finalize
      if (fullContent) {
        addMessage({ type: "assistant", content: fullContent });
        setStreamingContent("");
      }

      setState("complete");

    } catch (error) {
      console.error("Demo chat error:", error);
      setState(email ? "complete" : "idle");
      addMessage({
        type: "error",
        content: error instanceof Error ? error.message : "Something went wrong. Try again?"
      });
    }
  };

  const getPlaceholder = () => {
    switch (state) {
      case "idle":
      case "complete":
        return "Type a clinical question...";
      case "awaiting_email":
        return "Enter your email...";
      case "exhausted":
        return "Press Enter to sign up...";
      default:
        return "";
    }
  };

  const isInputDisabled = state === "streaming" || state === "validating" || state === "thinking";

  return (
    <div className="relative">
      {/* Terminal window */}
      <div className="relative bg-rezzy-off-black border border-rezzy-gray-dark overflow-hidden crt-glow">
        {/* Scanline effect */}
        <div className="scanline" />

        {/* Terminal header */}
        <div className="flex items-center justify-between px-4 py-3 bg-rezzy-dark border-b border-rezzy-gray-dark">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-rezzy-gray text-xs font-mono">rezzy.terminal</span>
          <div className="w-16" />
        </div>

        {/* Terminal content */}
        <div
          ref={terminalRef}
          className="p-5 min-h-[320px] max-h-[480px] overflow-y-auto space-y-4"
        >
          {/* Messages */}
          {messages.map((msg, idx) => (
            <div key={idx} className="font-mono text-sm leading-relaxed">
              {msg.type === "system" && (
                <p className="text-rezzy-gray-light whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.type === "user" && (
                <div className="flex items-start gap-2">
                  <span className="text-rezzy-green">→</span>
                  <span className="text-rezzy-white">{msg.content}</span>
                </div>
              )}
              {msg.type === "assistant" && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-rezzy-green" />
                    <span className="text-rezzy-green text-xs tracking-wider">REZZY</span>
                  </div>
                  <pre className="text-rezzy-gray-light whitespace-pre-wrap pl-4">
                    {msg.content}
                  </pre>
                </div>
              )}
              {msg.type === "error" && (
                <p className="text-red-400 pl-4">{msg.content}</p>
              )}
            </div>
          ))}

          {/* Thinking indicator (Claude Code style) */}
          {state === "thinking" && (
            <div className="font-mono text-sm leading-relaxed mt-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-rezzy-green animate-pulse" />
                <span className="text-rezzy-green text-xs tracking-wider">REZZY</span>
              </div>
              <div className="pl-4 flex items-center gap-3">
                {/* Animated dots */}
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-rezzy-green/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-rezzy-green/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-rezzy-green/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                {/* Rotating phrase */}
                <span className="text-rezzy-gray text-xs transition-opacity duration-300">
                  {THINKING_PHRASES[thinkingPhrase]}...
                </span>
              </div>
            </div>
          )}

          {/* Streaming content */}
          {state === "streaming" && streamingContent && (
            <div className="font-mono text-sm leading-relaxed mt-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-rezzy-green animate-pulse" />
                <span className="text-rezzy-green text-xs tracking-wider">REZZY</span>
                <span className="text-rezzy-gray text-xs">processing...</span>
              </div>
              <pre className="text-rezzy-gray-light whitespace-pre-wrap pl-4">
                {streamingContent}
                <span
                  className={`inline-block w-2 h-4 bg-rezzy-green ml-0.5 align-middle transition-opacity duration-100 ${
                    cursorVisible ? "opacity-100" : "opacity-0"
                  }`}
                />
              </pre>
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex items-center gap-2">
              <span className="text-rezzy-green font-mono text-sm">→</span>
              <input
                ref={inputRef}
                type={state === "awaiting_email" ? "email" : "text"}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setErrorMessage("");
                }}
                placeholder={getPlaceholder()}
                disabled={isInputDisabled}
                className="flex-1 bg-transparent text-rezzy-white font-mono text-sm
                         focus:outline-none placeholder:text-rezzy-gray-dark
                         disabled:opacity-50 caret-rezzy-green"
                autoComplete={state === "awaiting_email" ? "email" : "off"}
              />
              {!isInputDisabled && input.length === 0 && (
                <span
                  className={`w-2 h-4 bg-rezzy-green transition-opacity duration-100 ${
                    cursorVisible ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}
            </div>
            {errorMessage && (
              <p className="text-red-400 text-xs font-mono mt-2 pl-4">{errorMessage}</p>
            )}
          </form>

          {/* Suggestion chips (only in idle state with no messages from user) */}
          {state === "idle" && messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {["Amoxicillin dosing 15kg", "Fever in infant", "Rash with fever"].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-rezzy-gray hover:text-rezzy-green font-mono text-xs
                             border border-rezzy-gray-dark hover:border-rezzy-green/50
                             px-3 py-1.5 transition-all duration-200 hover:bg-rezzy-green/5"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Terminal footer */}
        <div className="px-4 py-2 bg-rezzy-dark border-t border-rezzy-gray-dark flex justify-between items-center">
          <span className="text-rezzy-gray text-xs font-mono">
            {state === "thinking"
              ? "Thinking..."
              : state === "streaming" || state === "validating"
              ? "Processing..."
              : state === "exhausted"
              ? "Demo complete"
              : "Ready"}
          </span>
          {remaining !== null && remaining > 0 && (
            <span className="text-rezzy-green text-xs font-mono">
              {remaining} free {remaining === 1 ? "question" : "questions"} remaining
            </span>
          )}
          {remaining === 0 && (
            <span className="text-rezzy-gray-dark text-xs font-mono">
              Sign up for unlimited
            </span>
          )}
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-4 flex items-center justify-center gap-4 text-rezzy-gray text-xs font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-rezzy-green" />
          Evidence-based
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-rezzy-green" />
          HIPAA compliant
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-rezzy-green" />
          Instant answers
        </span>
      </div>
    </div>
  );
};

export default InteractiveDemo;
