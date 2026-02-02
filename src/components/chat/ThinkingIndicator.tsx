import { useState, useEffect, useRef, memo } from 'react';
import RezzyLogo from '@/components/RezzyLogo';

// Animation timing constants
const TYPING_SPEED_MS = 40;
const PHRASE_HOLD_MS = 2000;

// 40 medical-themed phrases (14 clinical, 12 friendly, 14 pediatric)
const THINKING_PHRASES = [
  // Clinical/Professional (14)
  "Reviewing clinical guidelines...",
  "Checking drug interactions...",
  "Analyzing differential diagnosis...",
  "Consulting pediatric protocols...",
  "Cross-referencing dosing tables...",
  "Reviewing safety parameters...",
  "Checking contraindications...",
  "Analyzing symptom patterns...",
  "Consulting evidence-based resources...",
  "Reviewing pharmacokinetics...",
  "Checking age-appropriate dosing...",
  "Reviewing treatment algorithms...",
  "Analyzing vital sign ranges...",
  "Consulting clinical references...",
  // Friendly/Approachable (12)
  "Thinking about this...",
  "Looking into it...",
  "Checking my notes...",
  "Let me find that for you...",
  "Working on it...",
  "Gathering information...",
  "Processing your question...",
  "On it...",
  "Pulling up the details...",
  "Almost ready...",
  "Connecting the dots...",
  "Piecing this together...",
  // Playful/Pediatric (14)
  "Consulting the tiny patient handbook...",
  "Calculating kid-sized doses...",
  "Thinking in pediatric mode...",
  "Checking the small human database...",
  "Calibrating for little ones...",
  "Scanning the pediatric archives...",
  "Accessing growth chart data...",
  "Checking the children's formulary...",
  "Reviewing mini-patient parameters...",
  "Tuning into tiny vitals...",
  "Dusting off the baby books...",
  "Crunching the kiddo numbers...",
  "Reviewing pint-sized protocols...",
  "Consulting my stethoscope memories...",
];

export interface ThinkingIndicatorProps {
  visible: boolean;
}

const ThinkingIndicator = memo(function ThinkingIndicator({ visible }: ThinkingIndicatorProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentPhrase = THINKING_PHRASES[phraseIndex];

  // Clear any pending timeout
  const clearPendingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Reset when hidden
  useEffect(() => {
    if (!visible) {
      clearPendingTimeout();
      setDisplayText('');
      setPhraseIndex(0);
    }
    return clearPendingTimeout;
  }, [visible]);

  // Typewriter effect
  useEffect(() => {
    if (!visible) return;

    clearPendingTimeout();

    if (displayText.length < currentPhrase.length) {
      // Type next character
      timeoutRef.current = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
      }, TYPING_SPEED_MS);
    } else {
      // Finished typing, hold then move to next phrase
      timeoutRef.current = setTimeout(() => {
        setDisplayText('');
        setPhraseIndex((prev) => (prev + 1) % THINKING_PHRASES.length);
      }, PHRASE_HOLD_MS);
    }

    return clearPendingTimeout;
  }, [visible, displayText, currentPhrase]);

  if (!visible) return null;

  return (
    <div
      className="px-4 py-6"
      role="status"
      aria-live="polite"
      aria-label="AI is processing your question"
    >
      <div className="flex gap-3">
        {/* Animated Logo */}
        <div className="w-7 h-7 flex-shrink-0 motion-safe:animate-thinking-float">
          <RezzyLogo size={28} />
        </div>

        {/* Typewriter Text */}
        <div className="flex-1 min-w-0 pt-1">
          <p className="text-sm text-rezzy-ink-muted font-mono">
            {displayText}
            <span
              className="inline-block w-0.5 h-4 bg-rezzy-sage ml-0.5 align-middle animate-cursor-blink"
              aria-hidden="true"
            />
          </p>
        </div>
      </div>
    </div>
  );
});

export default ThinkingIndicator;
