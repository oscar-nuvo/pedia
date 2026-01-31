import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { DemoState, Message, DemoVariant } from "@/types/demo";
import {
  ChatMessage,
  ChatInput,
  ThinkingIndicator,
  TerminalChrome,
  THINKING_PHRASES,
} from "./demo";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Warn at module load if env var is missing (helps with debugging)
if (!SUPABASE_URL) {
  console.error("CRITICAL: VITE_SUPABASE_URL environment variable is not configured");
}

const InteractiveDemo = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const variant: DemoVariant = isMobile ? "chat" : "terminal";

  // Core state
  const [state, setState] = useState<DemoState>("idle");
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { type: "system", content: "Welcome to Rezzy.\nAsk any clinical question to get started." },
  ]);
  const [streamingContent, setStreamingContent] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [thinkingPhrase, setThinkingPhrase] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Blinking cursor (terminal only)
  useEffect(() => {
    if (variant === "terminal") {
      const interval = setInterval(() => setCursorVisible((v) => !v), 530);
      return () => clearInterval(interval);
    }
  }, [variant]);

  // Rotate thinking phrases (terminal only)
  useEffect(() => {
    if (state === "thinking" && variant === "terminal") {
      const interval = setInterval(() => {
        setThinkingPhrase((p) => (p + 1) % THINKING_PHRASES.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [state, variant]);

  // Auto-scroll content
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
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
              {
                type: "system",
                content: "Welcome back!\nYou've used your 3 free questions. Ready for unlimited access?",
              },
            ]);
          }
        }
      } catch (e) {
        console.error("Failed to restore demo session from localStorage:", e);
        localStorage.removeItem("rezzy_demo_session");
      }
    }
  }, []);

  const saveSession = (email: string, remaining: number) => {
    localStorage.setItem("rezzy_demo_session", JSON.stringify({ email, remaining }));
  };

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
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
          content: "Good question. Drop your email and I'll pull up the answer.",
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
        body: JSON.stringify({ email: userEmail, question: userQuestion }),
      });

      // Handle non-streaming errors
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Server returned non-JSON error response:", {
            status: response.status,
            statusText: response.statusText,
          });
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        if (errorData.error === "queries_exhausted") {
          setRemaining(0);
          saveSession(userEmail, 0);
          setState("exhausted");
          setMessages((prev) => {
            const filtered = prev.filter((m) => m.content !== "Checking...");
            return [
              ...filtered,
              {
                type: "assistant",
                content: "You've used your 3 free questions. Ready for unlimited access?",
              },
            ];
          });
          setTimeout(() => {
            navigate(`/auth?email=${encodeURIComponent(userEmail)}`);
          }, 2000);
          return;
        }

        if (errorData.error === "invalid_email" || errorData.error === "invalid_email_domain") {
          setState("awaiting_email");
          setMessages((prev) => prev.filter((m) => m.content !== "Checking..."));
          setErrorMessage(errorData.message || "That email doesn't look right. Try again?");
          return;
        }

        if (errorData.error === "invalid_question") {
          setState("idle");
          setMessages((prev) => prev.filter((m) => m.content !== "Checking..."));
          addMessage({ type: "assistant", content: errorData.message });
          return;
        }

        throw new Error(errorData.message || "Something went wrong");
      }

      // Remove "Checking..." message
      setMessages((prev) => prev.filter((m) => m.content !== "Checking..."));

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
              if (parseError instanceof Error && parseError.message && !parseError.message.includes("JSON")) {
                throw parseError;
              }
              console.warn("Failed to parse streaming response line:", {
                line: line.substring(0, 100),
                error: parseError instanceof Error ? parseError.message : "Unknown error",
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
        content: error instanceof Error ? error.message : "Something went wrong. Try again?",
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const showSuggestions = state === "idle" && messages.length === 1;

  // Render streaming content with cursor (terminal only)
  const renderStreamingContent = () => {
    if (state !== "streaming" || !streamingContent) return null;

    if (variant === "chat") {
      return (
        <div className="flex justify-start">
          <div className="bg-rezzy-off-black rounded-2xl px-4 py-3 max-w-[85%]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-rezzy-green rounded-full animate-pulse" />
              <span className="text-rezzy-green text-xs font-medium">REZZY</span>
            </div>
            <p className="text-rezzy-gray-light text-sm whitespace-pre-wrap">
              {streamingContent}
            </p>
          </div>
        </div>
      );
    }

    return (
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
    );
  };

  // Content area (messages + streaming + input)
  const renderContent = () => (
    <div
      ref={contentRef}
      className={`overflow-y-auto space-y-4 ${
        variant === "chat"
          ? "p-4 min-h-[280px] max-h-[400px]"
          : "p-5 min-h-[320px] max-h-[480px]"
      }`}
    >
      {/* Messages */}
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg} variant={variant} />
      ))}

      {/* Thinking indicator */}
      {state === "thinking" && (
        <ThinkingIndicator variant={variant} phraseIndex={thinkingPhrase} />
      )}

      {/* Streaming content */}
      {renderStreamingContent()}

      {/* Input */}
      <ChatInput
        ref={inputRef}
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        state={state}
        errorMessage={errorMessage}
        variant={variant}
        cursorVisible={cursorVisible}
        showSuggestions={showSuggestions}
        onSuggestionClick={handleSuggestionClick}
      />
    </div>
  );

  // Mobile chat UI
  if (variant === "chat") {
    return (
      <div className="relative">
        <div className="bg-rezzy-off-black border border-rezzy-gray-dark rounded-xl overflow-hidden">
          {renderContent()}

          {/* Footer with remaining queries */}
          <div className="px-4 py-2 bg-rezzy-dark/50 border-t border-rezzy-gray-dark flex justify-between items-center">
            <span className="text-rezzy-gray text-xs">
              {state === "thinking"
                ? "Thinking..."
                : state === "streaming"
                ? "Responding..."
                : "Ready"}
            </span>
            {remaining !== null && remaining > 0 && (
              <span className="text-rezzy-green text-xs">
                {remaining} free {remaining === 1 ? "question" : "questions"} left
              </span>
            )}
            {remaining === 0 && (
              <span className="text-rezzy-gray-dark text-xs">Sign up for unlimited</span>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-4 flex items-center justify-center gap-4 text-rezzy-gray text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-rezzy-green rounded-full" />
            Evidence-based
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-rezzy-green rounded-full" />
            HIPAA compliant
          </span>
        </div>
      </div>
    );
  }

  // Desktop terminal UI
  return (
    <div className="relative">
      <TerminalChrome state={state} remaining={remaining}>
        {renderContent()}
      </TerminalChrome>

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
