import { DemoVariant } from "@/types/demo";

// Thinking phrases that rotate (terminal style only)
const THINKING_PHRASES = [
  "Consulting references",
  "Analyzing question",
  "Searching guidelines",
  "Gathering evidence",
  "Cross-referencing sources",
  "Formulating response",
];

export interface ThinkingIndicatorProps {
  variant: DemoVariant;
  phraseIndex: number;
}

const ThinkingIndicator = ({ variant, phraseIndex }: ThinkingIndicatorProps) => {
  if (variant === "chat") {
    return <ChatThinkingIndicator />;
  }
  return <TerminalThinkingIndicator phraseIndex={phraseIndex} />;
};

// Simple dots for mobile chat
const ChatThinkingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-rezzy-off-black rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-rezzy-green rounded-full" />
          <span className="text-rezzy-green text-xs font-medium">REZZY</span>
        </div>
        <div className="flex gap-1 mt-2">
          <span
            className="w-2 h-2 bg-rezzy-green/60 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 bg-rezzy-green/60 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 bg-rezzy-green/60 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
};

// Rotating phrases for desktop terminal
const TerminalThinkingIndicator = ({ phraseIndex }: { phraseIndex: number }) => {
  return (
    <div className="font-mono text-sm leading-relaxed mt-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-rezzy-green animate-pulse" />
        <span className="text-rezzy-green text-xs tracking-wider">REZZY</span>
      </div>
      <div className="pl-4 flex items-center gap-3">
        {/* Animated dots */}
        <div className="flex gap-1">
          <span
            className="w-1.5 h-1.5 bg-rezzy-green/60 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-rezzy-green/60 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-rezzy-green/60 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        {/* Rotating phrase */}
        <span className="text-rezzy-gray text-xs transition-opacity duration-300">
          {THINKING_PHRASES[phraseIndex % THINKING_PHRASES.length]}...
        </span>
      </div>
    </div>
  );
};

export { THINKING_PHRASES };
export default ThinkingIndicator;
