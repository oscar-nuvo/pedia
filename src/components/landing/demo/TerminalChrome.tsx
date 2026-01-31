import { DemoState } from "@/types/demo";

export interface TerminalHeaderProps {
  // No props needed for now, but interface for extensibility
}

export const TerminalHeader = (_props: TerminalHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-rezzy-sage-pale border-b border-rezzy-cream-deep">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-rezzy-sage rounded-full animate-pulse" />
        <span className="text-rezzy-ink-muted text-xs font-mono">rezzy.ai</span>
      </div>
      <div className="w-16" />
    </div>
  );
};

export interface TerminalFooterProps {
  state: DemoState;
  remaining: number | null;
}

export const TerminalFooter = ({ state, remaining }: TerminalFooterProps) => {
  const getStatusText = () => {
    switch (state) {
      case "thinking":
        return "Thinking...";
      case "streaming":
      case "validating":
        return "Processing...";
      case "exhausted":
        return "Demo complete";
      default:
        return "Ready";
    }
  };

  return (
    <div className="px-4 py-2 bg-rezzy-cream border-t border-rezzy-cream-deep flex justify-between items-center">
      <span className="text-rezzy-ink-muted text-xs font-mono">{getStatusText()}</span>
      {remaining !== null && remaining > 0 && (
        <span className="text-rezzy-sage text-xs font-mono font-medium">
          {remaining} free {remaining === 1 ? "question" : "questions"} remaining
        </span>
      )}
      {remaining === 0 && (
        <span className="text-rezzy-ink-light text-xs font-mono">
          Sign up for unlimited
        </span>
      )}
    </div>
  );
};

export interface TerminalWrapperProps {
  children: React.ReactNode;
  state: DemoState;
  remaining: number | null;
}

// Full terminal wrapper with header, content area, and footer
const TerminalChrome = ({ children, state, remaining }: TerminalWrapperProps) => {
  return (
    <div className="relative bg-white border border-rezzy-cream-deep rounded-3xl shadow-lg overflow-hidden">
      {/* Terminal header */}
      <TerminalHeader />

      {/* Content */}
      {children}

      {/* Terminal footer */}
      <TerminalFooter state={state} remaining={remaining} />
    </div>
  );
};

export default TerminalChrome;
