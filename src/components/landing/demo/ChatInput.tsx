import { forwardRef } from "react";
import { DemoState, DemoVariant } from "@/types/demo";

const SUGGESTIONS = ["Amoxicillin dosing 15kg", "Fever in infant", "Rash with fever"];

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  state: DemoState;
  errorMessage: string;
  variant: DemoVariant;
  cursorVisible: boolean;
  showSuggestions: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      state,
      errorMessage,
      variant,
      cursorVisible,
      showSuggestions,
      onSuggestionClick,
    },
    ref
  ) => {
    const isInputDisabled =
      state === "streaming" || state === "validating" || state === "thinking";

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

    if (variant === "chat") {
      return (
        <ChatInputMobile
          ref={ref}
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={getPlaceholder()}
          isDisabled={isInputDisabled}
          errorMessage={errorMessage}
          state={state}
          showSuggestions={showSuggestions}
          onSuggestionClick={onSuggestionClick}
        />
      );
    }

    return (
      <TerminalInput
        ref={ref}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        placeholder={getPlaceholder()}
        isDisabled={isInputDisabled}
        errorMessage={errorMessage}
        state={state}
        cursorVisible={cursorVisible}
        showSuggestions={showSuggestions}
        onSuggestionClick={onSuggestionClick}
      />
    );
  }
);

ChatInput.displayName = "ChatInput";

// Mobile chat input
interface InputVariantProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder: string;
  isDisabled: boolean;
  errorMessage: string;
  state: DemoState;
  showSuggestions: boolean;
  onSuggestionClick: (suggestion: string) => void;
  cursorVisible?: boolean;
}

const ChatInputMobile = forwardRef<HTMLInputElement, InputVariantProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      placeholder,
      isDisabled,
      errorMessage,
      state,
      showSuggestions,
      onSuggestionClick,
    },
    ref
  ) => {
    return (
      <div className="space-y-3">
        <form onSubmit={onSubmit}>
          <div className="flex items-center gap-2 bg-rezzy-cream rounded-full px-4 py-2">
            <input
              ref={ref}
              type={state === "awaiting_email" ? "email" : "text"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={isDisabled}
              className="flex-1 bg-transparent text-rezzy-ink text-sm
                       focus:outline-none placeholder:text-rezzy-ink-light
                       disabled:opacity-50 caret-rezzy-sage min-h-[44px]"
              autoComplete={state === "awaiting_email" ? "email" : "off"}
            />
            <button
              type="submit"
              disabled={isDisabled}
              className="w-10 h-10 bg-rezzy-sage text-white rounded-full flex items-center justify-center
                       hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:hover:scale-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          {errorMessage && (
            <p className="text-rezzy-coral text-xs mt-2 px-1">{errorMessage}</p>
          )}
        </form>

        {/* Suggestion chips - smaller but with borders for tap affordance */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
                className="text-rezzy-ink-muted hover:text-rezzy-sage text-xs
                         bg-white border border-rezzy-cream-deep hover:border-rezzy-sage
                         px-3 py-1.5 rounded-full transition-all duration-200
                         hover:bg-rezzy-sage-pale min-h-[44px] flex items-center"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

ChatInputMobile.displayName = "ChatInputMobile";

// Desktop terminal input
const TerminalInput = forwardRef<HTMLInputElement, InputVariantProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      placeholder,
      isDisabled,
      errorMessage,
      state,
      cursorVisible,
      showSuggestions,
      onSuggestionClick,
    },
    ref
  ) => {
    return (
      <>
        <form onSubmit={onSubmit} className="mt-4">
          <div className="flex items-center gap-2 bg-rezzy-cream rounded-full px-4 py-2">
            <span className="text-rezzy-sage font-mono text-sm">→</span>
            <input
              ref={ref}
              type={state === "awaiting_email" ? "email" : "text"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={isDisabled}
              className="flex-1 bg-transparent text-rezzy-ink font-mono text-sm
                       focus:outline-none placeholder:text-rezzy-ink-light
                       disabled:opacity-50 caret-rezzy-sage"
              autoComplete={state === "awaiting_email" ? "email" : "off"}
            />
            {!isDisabled && value.length === 0 && (
              <span
                className={`w-2 h-4 bg-rezzy-sage rounded transition-opacity duration-100 ${
                  cursorVisible ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
            <button
              type="submit"
              disabled={isDisabled}
              className="w-8 h-8 bg-rezzy-sage text-white rounded-full flex items-center justify-center
                       hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:hover:scale-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          {errorMessage && (
            <p className="text-rezzy-coral text-xs font-mono mt-2 pl-4">
              {errorMessage}
            </p>
          )}
        </form>

        {/* Suggestion chips */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 mt-4">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
                className="text-rezzy-ink-muted hover:text-rezzy-sage font-mono text-xs
                         bg-white border border-rezzy-cream-deep hover:border-rezzy-sage
                         px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-rezzy-sage-pale"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </>
    );
  }
);

TerminalInput.displayName = "TerminalInput";

export default ChatInput;
