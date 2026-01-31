import { DemoState } from "@/types/demo";

export interface TerminalHeaderProps {
  // No props needed for now, but interface for extensibility
}

export const TerminalHeader = (_props: TerminalHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-rezzy-dark border-b border-rezzy-gray-dark">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
      </div>
      <span className="text-rezzy-gray text-xs font-mono">rezzy.terminal</span>
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
    <div className="px-4 py-2 bg-rezzy-dark border-t border-rezzy-gray-dark flex justify-between items-center">
      <span className="text-rezzy-gray text-xs font-mono">{getStatusText()}</span>
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
    <div className="relative bg-rezzy-off-black border border-rezzy-gray-dark overflow-hidden crt-glow">
      {/* Scanline effect */}
      <div className="scanline" />

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
