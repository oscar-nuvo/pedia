# Thinking Indicator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an animated thinking indicator with floating Rezzy logo and typewriter phrases while waiting for AI responses.

**Architecture:** Create a self-contained `ThinkingIndicator` component that renders an animated logo + cycling phrases. Integrate into `AdvancedChatInterface` with visibility controlled by streaming/upload state. Add custom Tailwind animations for float and antenna pulse.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, CSS animations

---

## Task 1: Add Custom Tailwind Animations

**Files:**
- Modify: `tailwind.config.ts:151-289` (keyframes and animation sections)

**Step 1: Add thinking-float keyframe**

Add after line 244 (after `bounce-gentle` keyframe):

```typescript
'thinking-float': {
  '0%, 100%': { transform: 'translateY(0px)' },
  '50%': { transform: 'translateY(-4px)' }
},
'antenna-pulse': {
  '0%, 100%': {
    opacity: '1',
    transform: 'scale(1)'
  },
  '50%': {
    opacity: '0.6',
    transform: 'scale(1.3)'
  }
},
'cursor-blink': {
  '0%, 50%': { opacity: '1' },
  '51%, 100%': { opacity: '0' }
},
```

**Step 2: Add animation utilities**

Add after line 288 (after `wiggle` animation):

```typescript
'thinking-float': 'thinking-float 2s ease-in-out infinite',
'antenna-pulse': 'antenna-pulse 1.5s ease-in-out infinite',
'cursor-blink': 'cursor-blink 0.8s step-end infinite',
```

**Step 3: Verify config is valid**

Run: `npm run build`
Expected: Build succeeds without Tailwind errors

**Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: add thinking indicator animations to Tailwind config"
```

---

## Task 2: Create ThinkingIndicator Component

**Files:**
- Create: `src/components/chat/ThinkingIndicator.tsx`

**Step 1: Create the component file**

```typescript
import { useState, useEffect, useCallback, memo } from 'react';
import RezzyLogo from '@/components/RezzyLogo';

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

// Shuffle array using Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface ThinkingIndicatorProps {
  visible: boolean;
}

const ThinkingIndicator = memo(function ThinkingIndicator({ visible }: ThinkingIndicatorProps) {
  const [phrases] = useState(() => shuffleArray(THINKING_PHRASES));
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentPhrase = phrases[phraseIndex];

  // Typewriter effect
  useEffect(() => {
    if (!visible) {
      setDisplayText('');
      setPhraseIndex(0);
      setIsTyping(true);
      return;
    }

    if (isTyping) {
      if (displayText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, 40); // 40ms per character
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, hold for 2000ms
        setIsTyping(false);
        const timeout = setTimeout(() => {
          setDisplayText('');
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          setIsTyping(true);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [visible, displayText, currentPhrase, isTyping, phrases.length]);

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
          <RezzyLogo size={28} className="[&_.antenna-glow]:motion-safe:animate-antenna-pulse" />
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
```

**Step 2: Verify component compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/chat/ThinkingIndicator.tsx
git commit -m "feat: create ThinkingIndicator component with typewriter effect"
```

---

## Task 3: Update RezzyLogo for Antenna Animation

**Files:**
- Modify: `src/components/RezzyLogo.tsx:50-51`

**Step 1: Add className to antenna circle**

Change line 51 from:
```tsx
<circle cx="50" cy="0" r="4" fill={c.antenna}/>
```

To:
```tsx
<circle className="antenna-glow" cx="50" cy="0" r="4" fill={c.antenna} style={{ transformOrigin: '50px 0px' }}/>
```

**Step 2: Verify component compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/RezzyLogo.tsx
git commit -m "feat: add antenna-glow class to RezzyLogo for animation support"
```

---

## Task 4: Integrate ThinkingIndicator into Chat Interface

**Files:**
- Modify: `src/components/chat/AdvancedChatInterface.tsx`

**Step 1: Add import**

After line 7 (after RezzyLogo import), add:

```typescript
import ThinkingIndicator from "./ThinkingIndicator";
```

**Step 2: Add isUploadingFiles state**

After line 32 (after sidebarOpen state), add:

```typescript
const [isUploadingFiles, setIsUploadingFiles] = useState(false);
```

**Step 3: Track file upload state**

Replace lines 66-72 (the file upload section in handleSendMessage):

FROM:
```typescript
    let fileIds: string[] = [];
    let uploadConversationId: string | null = null;
    if (selectedFiles.length > 0) {
      const uploadResult = await uploadFiles(selectedFiles);
      fileIds = uploadResult.fileIds;
      uploadConversationId = uploadResult.conversationId;
      setSelectedFiles([]);
    }
```

TO:
```typescript
    let fileIds: string[] = [];
    let uploadConversationId: string | null = null;
    if (selectedFiles.length > 0) {
      setIsUploadingFiles(true);
      try {
        const uploadResult = await uploadFiles(selectedFiles);
        fileIds = uploadResult.fileIds;
        uploadConversationId = uploadResult.conversationId;
      } finally {
        setIsUploadingFiles(false);
      }
      setSelectedFiles([]);
    }
```

**Step 4: Calculate visibility and add ThinkingIndicator**

Replace lines 279-329 (the streaming message section):

FROM:
```tsx
            {/* Streaming message */}
            {streamingState.streamingMessage && (
              <div className="px-4 py-6">
                ...
              </div>
            )}
```

TO:
```tsx
            {/* Thinking indicator - shows before response text arrives */}
            <ThinkingIndicator
              visible={
                (isUploadingFiles || isSendingMessage || streamingState.isStreaming) &&
                !streamingState.streamingMessage &&
                !streamingState.currentFunction
              }
            />

            {/* Streaming message */}
            {streamingState.streamingMessage && (
              <div className="px-4 py-6">
                <div className="flex gap-3">
                  <div className="w-7 h-7 flex-shrink-0">
                    <RezzyLogo size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Reasoning */}
                    {streamingState.reasoningText && streamingState.showReasoning && (
                      <div className="mb-3 text-sm text-rezzy-ink-muted italic border-l-2 border-rezzy-sage-lighter pl-3">
                        {streamingState.reasoningText}
                      </div>
                    )}

                    {/* Response */}
                    <p className="text-rezzy-ink leading-relaxed whitespace-pre-wrap">
                      {streamingState.streamingMessage}
                      <span className="inline-block w-0.5 h-4 bg-rezzy-sage ml-0.5 animate-pulse" />
                    </p>

                    {/* Function calls */}
                    {streamingState.functionCalls.map(call => (
                      <FunctionCallDisplay key={call.id} functionCall={call} />
                    ))}

                    {/* Current function being executed */}
                    {streamingState.currentFunction && (
                      <p className="mt-2 text-sm text-rezzy-ink-muted">
                        <span className="inline-block w-1.5 h-1.5 bg-rezzy-sage rounded-full mr-2 animate-pulse" />
                        Running {streamingState.currentFunction.name}...
                      </p>
                    )}

                    {/* Streaming images */}
                    {streamingState.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {streamingState.images.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt="Generated"
                            className="rounded-lg max-w-xs"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
```

**Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/components/chat/AdvancedChatInterface.tsx
git commit -m "feat: integrate ThinkingIndicator into chat interface"
```

---

## Task 5: Manual Testing

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test scenarios**

Open http://localhost:8080 and test:

| Test | Expected |
|------|----------|
| Send message (no files) | Indicator shows immediately, typewriter cycles, hides when text arrives |
| Send message with file | Indicator shows during upload AND during AI processing |
| Click Stop while thinking | Indicator hides immediately |
| Reasoning mode enabled | Indicator shows until text (not reasoning) arrives |
| Function call triggered | Indicator hides, function UI shows |

**Step 3: Test accessibility**

- Enable VoiceOver (Cmd+F5 on Mac)
- Send a message
- Expected: Screen reader announces "AI is processing your question"

**Step 4: Test reduced motion**

- System Preferences > Accessibility > Display > Reduce motion
- Send a message
- Expected: Logo does not animate (static), typewriter still works

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete thinking indicator implementation

- Add animated Rezzy logo with float and antenna pulse
- Add typewriter effect cycling through 40 medical phrases
- Integrate with chat interface for file uploads and streaming
- Add accessibility support (ARIA, reduced motion)"
```

---

## Success Criteria Checklist

- [ ] Indicator shows within 100ms of Send click
- [ ] Indicator hides within 100ms of first text_delta
- [ ] No flicker or layout shift during transition
- [ ] Animation runs smoothly (60fps desktop)
- [ ] Screen reader announces thinking state
- [ ] Reduced motion preference respected
- [ ] File upload state tracked correctly
- [ ] Function call hides indicator
