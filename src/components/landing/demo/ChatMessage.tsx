import { Message, DemoVariant } from "@/types/demo";

export interface ChatMessageProps {
  message: Message;
  variant: DemoVariant;
}

const ChatMessage = ({ message, variant }: ChatMessageProps) => {
  if (variant === "chat") {
    return <ChatBubbleMessage message={message} />;
  }
  return <TerminalMessage message={message} />;
};

// Chat bubble style for mobile
const ChatBubbleMessage = ({ message }: { message: Message }) => {
  if (message.type === "system") {
    return (
      <div className="flex justify-start">
        <div className="bg-rezzy-cream rounded-2xl px-4 py-3 max-w-[85%]">
          <p className="text-rezzy-ink-muted text-sm whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-rezzy-ink rounded-2xl px-4 py-3 max-w-[85%]">
          <p className="text-rezzy-cream text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.type === "assistant") {
    return (
      <div className="flex justify-start">
        <div className="bg-rezzy-sage-pale rounded-2xl px-4 py-3 max-w-[85%]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-rezzy-sage rounded-full" />
            <span className="text-rezzy-sage text-xs font-medium">REZZY</span>
          </div>
          <p className="text-rezzy-ink text-sm whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  if (message.type === "error") {
    return (
      <div className="flex justify-start">
        <div className="bg-rezzy-coral-pale border border-rezzy-coral/20 rounded-2xl px-4 py-3 max-w-[85%]">
          <p className="text-rezzy-coral text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  return null;
};

// Terminal style for desktop
const TerminalMessage = ({ message }: { message: Message }) => {
  if (message.type === "system") {
    return (
      <p className="text-rezzy-ink-muted whitespace-pre-wrap font-mono text-sm leading-relaxed">
        {message.content}
      </p>
    );
  }

  if (message.type === "user") {
    return (
      <div className="flex items-start gap-2 font-mono text-sm leading-relaxed">
        <span className="text-rezzy-sage">→</span>
        <span className="text-rezzy-ink">{message.content}</span>
      </div>
    );
  }

  if (message.type === "assistant") {
    return (
      <div className="mt-2 font-mono text-sm leading-relaxed">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-rezzy-sage rounded-full" />
          <span className="text-rezzy-sage text-xs tracking-wider">REZZY</span>
        </div>
        <pre className="text-rezzy-ink whitespace-pre-wrap pl-4">
          {message.content}
        </pre>
      </div>
    );
  }

  if (message.type === "error") {
    return (
      <p className="text-rezzy-coral pl-4 font-mono text-sm leading-relaxed">
        {message.content}
      </p>
    );
  }

  return null;
};

export default ChatMessage;
