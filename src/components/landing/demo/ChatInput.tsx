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
          <div className="flex items-center gap-2 bg-rezzy-off-black border border-rezzy-gray-dark rounded-xl px-4 py-3">
            <input
              ref={ref}
              type={state === "awaiting_email" ? "email" : "text"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={isDisabled}
              className="flex-1 bg-transparent text-rezzy-white text-sm
                       focus:outline-none placeholder:text-rezzy-gray-dark
                       disabled:opacity-50 caret-rezzy-green min-h-[44px]"
              autoComplete={state === "awaiting_email" ? "email" : "off"}
            />
          </div>
          {errorMessage && (
            <p className="text-red-400 text-xs mt-2 px-1">{errorMessage}</p>
          )}
        </form>

        {/* Suggestion chips - smaller but with borders for tap affordance */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
                className="text-rezzy-gray hover:text-rezzy-green text-xs
                         border border-rezzy-gray-dark hover:border-rezzy-green/50
                         px-2 py-1 rounded-lg transition-all duration-200
                         hover:bg-rezzy-green/5 min-h-[44px] flex items-center"
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
          <div className="flex items-center gap-2">
            <span className="text-rezzy-green font-mono text-sm">→</span>
            <input
              ref={ref}
              type={state === "awaiting_email" ? "email" : "text"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={isDisabled}
              className="flex-1 bg-transparent text-rezzy-white font-mono text-sm
                       focus:outline-none placeholder:text-rezzy-gray-dark
                       disabled:opacity-50 caret-rezzy-green"
              autoComplete={state === "awaiting_email" ? "email" : "off"}
            />
            {!isDisabled && value.length === 0 && (
              <span
                className={`w-2 h-4 bg-rezzy-green transition-opacity duration-100 ${
                  cursorVisible ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </div>
          {errorMessage && (
            <p className="text-red-400 text-xs font-mono mt-2 pl-4">
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
                className="text-rezzy-gray hover:text-rezzy-green font-mono text-xs
                         border border-rezzy-gray-dark hover:border-rezzy-green/50
                         px-3 py-1.5 transition-all duration-200 hover:bg-rezzy-green/5"
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
