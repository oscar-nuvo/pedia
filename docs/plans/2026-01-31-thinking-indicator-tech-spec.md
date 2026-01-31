# Tech Spec: Chat Thinking Indicator

## Overview

Add an animated thinking indicator to the AI copilot chat interface (`/ai-copilot`) that shows a floating Rezzy logo with typewriter-style rotating medical phrases while waiting for AI responses. This improves perceived responsiveness and provides visual feedback during the wait time between sending a message and receiving the first response token.

## Design Reference

- **Playground prototype**: `/private/tmp/claude-503/.../scratchpad/rezzy-thinking-playground.html`
- **Design document**: `docs/plans/2026-01-31-thinking-indicator-design.md`

## Codebase Patterns Applied

| Pattern | Source | Application |
|---------|--------|-------------|
| Component structure | `src/components/landing/demo/ThinkingIndicator.tsx` | Follow variant pattern, props interface export |
| React hooks pattern | `src/hooks/*` | Use existing hook patterns for state management |
| Tailwind animations | `tailwind.config.ts:151-289` | Extend existing keyframes/animation utilities |
| Chat component structure | `src/components/chat/*` | Place new component in chat folder |
| shadcn/ui patterns | `src/components/ui/*` | Follow existing component conventions |

## Architecture Decisions

1. **New component in `/chat` folder** — Not reusing landing demo's `ThinkingIndicator` because chat version has different requirements (typewriter effect, animated logo, 40 phrases vs 6)
2. **No modification to `RezzyLogo.tsx`** — Keep logo component simple; add CSS class to antenna element for animation hook only
3. **Visibility controlled by parent** — `AdvancedChatInterface` calculates visibility, passes boolean prop to indicator
4. **Memory-safe animations** — All intervals/timeouts cleaned up in `useEffect` returns

## Dependency Graph

```
TASK-1: Tailwind Animations
    ↓
TASK-2: ThinkingIndicator Component ←── TASK-3: RezzyLogo Antenna Class
    ↓
TASK-4: Chat Interface Integration
    ↓
TASK-5: Manual Testing & Polish
```

## Execution Strategy

**PR Approach**: Single PR with atomic commits per task

**Task Order Rationale**: Tailwind config must exist before component can use animations. Component must exist before integration. RezzyLogo change is independent but needed before integration testing.

**Branch Naming**: `feat/thinking-indicator`

---

## Task Breakdown

### Phase 1: Foundation

#### TASK-1: Add Tailwind Animation Keyframes

**Summary**: Add custom keyframes and animation utilities for thinking indicator animations.

**Dependencies**: None

**Why this matters**: The typewriter cursor blink and logo float/pulse animations need custom timing that doesn't exist in the current Tailwind config. These must be defined before the component can use them.

**Files to touch**:
- `tailwind.config.ts:244-289` — Add keyframes and animation utilities

**Functional Requirements**:
1. The system must define a `thinking-float` keyframe that translates Y by -4px over 2s
2. The system must define an `antenna-pulse` keyframe that scales from 1 to 1.3 and opacity from 1 to 0.6 over 1.5s
3. The system must define a `cursor-blink` keyframe that toggles opacity discretely (instant on/off) between 1 and 0 at 0.8s intervals
4. `thinking-float` and `antenna-pulse` must use `ease-in-out` timing function; `cursor-blink` must use `step-end` for instant toggle
5. All animations must loop infinitely

**Notes for implementer**:
- Add keyframes in the `keyframes` object (around line 244)
- Add corresponding animation utilities in the `animation` object (around line 288)
- Follow existing naming convention: lowercase with hyphens

**Estimated Effort**: 30 minutes

**Acceptance Criteria**:
- [ ] `tailwind.config.ts` contains `thinking-float` keyframe with `translateY(-4px)` at 50%
- [ ] `tailwind.config.ts` contains `antenna-pulse` keyframe with `scale(1.3)` and `opacity: 0.6` at 50%
- [ ] `tailwind.config.ts` contains `cursor-blink` keyframe with `opacity: 0` from 51-100%
- [ ] `animation` object contains `thinking-float: 'thinking-float 2s ease-in-out infinite'`
- [ ] `animation` object contains `antenna-pulse: 'antenna-pulse 1.5s ease-in-out infinite'`
- [ ] `animation` object contains `cursor-blink: 'cursor-blink 0.8s step-end infinite'`
- [ ] `npm run build` succeeds without Tailwind errors

**Required Tests**:
- Manual: Run `npm run build` and verify no compilation errors
- Manual: Inspect compiled CSS contains the new animation classes

---

### Phase 2: Core Components

#### TASK-2: Create ThinkingIndicator Component

**Summary**: Create a self-contained component that renders an animated Rezzy logo with typewriter-style rotating phrases.

**Dependencies**: TASK-1 (Tailwind animations must exist)

**Why this matters**: This is the core UI component that provides visual feedback to users during the AI response wait time. It must handle its own animation state and clean up properly to prevent memory leaks.

**Files to touch**:
- `src/components/chat/ThinkingIndicator.tsx` — CREATE new component

**Functional Requirements**:
1. The component must accept a single `visible` boolean prop
2. When `visible` is `false`, the component must return `null` and reset internal state
3. When `visible` is `true`, the component must render:
   - A `RezzyLogo` component (size 28) with float animation
   - A typewriter text display with blinking cursor
4. The typewriter effect must:
   - Display characters one at a time at 40ms intervals
   - Hold the complete phrase for 2000ms before clearing
   - Cycle through 40 phrases in random order (shuffled on mount)
5. The component must clean up all `setTimeout` calls when unmounting or when `visible` becomes `false`
6. The component must include ARIA attributes: `role="status"`, `aria-live="polite"`, `aria-label="AI is processing your question"`
7. Animations must respect `prefers-reduced-motion` via `motion-safe:` Tailwind prefix

**Phrase categories** (40 total):
- Clinical/Professional: 14 phrases (e.g., "Reviewing clinical guidelines...")
- Friendly/Approachable: 12 phrases (e.g., "Thinking about this...")
- Playful/Pediatric: 14 phrases (e.g., "Consulting the tiny patient handbook...")

**Notes for implementer**:
- Use `memo()` to prevent unnecessary re-renders
- Cycle through phrases in order (no shuffle needed — simpler like landing demo)
- Store phrase index and display text in separate state variables
- Define constants at top of file: `const TYPING_SPEED_MS = 40;` and `const PHRASE_HOLD_MS = 2000;`
- **IMPORTANT**: Wrap the logo in a div for animation: `<div className="motion-safe:animate-thinking-float"><RezzyLogo size={28} /></div>`
- Do NOT use CSS selector syntax like `[&_.antenna-glow]` — Tailwind doesn't support this
- The cursor class is `animate-cursor-blink`
- Export the props interface: `export interface ThinkingIndicatorProps { visible: boolean; }`
- See `src/components/landing/demo/ThinkingIndicator.tsx` for reference pattern (but don't copy — different implementation)

**Estimated Effort**: 2 hours

**Acceptance Criteria**:
- [ ] File exists at `src/components/chat/ThinkingIndicator.tsx`
- [ ] Component exports a default function named `ThinkingIndicator`
- [ ] Component accepts `{ visible: boolean }` props with TypeScript interface
- [ ] When `visible={false}`, component returns `null`
- [ ] When `visible={true}`, component renders RezzyLogo with `animate-thinking-float` class
- [ ] Typewriter displays characters at 40ms intervals (verify by observing in browser)
- [ ] Phrase holds for 2000ms after completion before clearing
- [ ] Phrases cycle in sequential order (consistent, predictable UX)
- [ ] Props interface `ThinkingIndicatorProps` is exported
- [ ] Container has `role="status"` attribute
- [ ] Container has `aria-live="polite"` attribute
- [ ] Container has `aria-label="AI is processing your question"` attribute
- [ ] Cursor element has `aria-hidden="true"` attribute
- [ ] `npm run build` succeeds
- [ ] No console errors when component mounts/unmounts rapidly (test by toggling visible 10 times)

**Required Tests**:
- Manual: Toggle `visible` prop rapidly 10 times, verify no memory leak warnings in console
- Manual: Enable "Reduce motion" in OS accessibility settings, verify logo does not animate
- Manual: Use VoiceOver/screen reader, verify it announces "AI is processing your question"

---

#### TASK-3: Add Antenna Animation Class to RezzyLogo

**Summary**: Add a CSS class hook to the RezzyLogo antenna circle element to enable animation from parent components.

**Dependencies**: None (can run parallel to TASK-2)

**Why this matters**: The antenna pulse animation needs to target the specific SVG element. Adding a class allows the parent component to apply animation via Tailwind without modifying the logo component's internals.

**Files to touch**:
- `src/components/RezzyLogo.tsx:51` — Add class and style to antenna circle

**Functional Requirements**:
1. The antenna circle element (line 51) must have `className="antenna-glow"`
2. The antenna circle element must have `style={{ transformOrigin: '50px 0px' }}` to ensure animation scales from center
3. No other changes to the component

**Notes for implementer**:
- The antenna circle is at line 51: `<circle cx="50" cy="0" r="4" fill={c.antenna}/>`
- The `transformOrigin` is needed because SVG elements don't inherit transform origin from CSS by default
- The `antenna-glow` class is just a hook — no styles should be applied to it in RezzyLogo.tsx. The parent component (ThinkingIndicator) will apply the `motion-safe:animate-antenna-pulse` class to it
- This is a minimal, surgical change — do not refactor other parts of the component

**Estimated Effort**: 15 minutes

**Acceptance Criteria**:
- [ ] Line 51 of `RezzyLogo.tsx` contains `className="antenna-glow"`
- [ ] Line 51 of `RezzyLogo.tsx` contains `style={{ transformOrigin: '50px 0px' }}`
- [ ] Antenna-glow class has no inline styles or CSS rules in RezzyLogo, only used as animation target
- [ ] No other lines in the file are modified
- [ ] `npm run build` succeeds
- [ ] RezzyLogo renders correctly in existing locations (header, welcome state, message bubbles)
- [ ] All existing RezzyLogo usages still render correctly after change

**Required Tests**:
- Manual: Navigate to `/ai-copilot`, verify logo appears correctly in header
- Manual: Start a new conversation, verify logo appears in welcome state
- Manual: Send a message, verify logo appears in assistant message bubble

---

### Phase 3: Integration

#### TASK-4: Integrate ThinkingIndicator into Chat Interface

**Summary**: Add the ThinkingIndicator component to AdvancedChatInterface with proper visibility logic including file upload state tracking.

**Dependencies**: TASK-2, TASK-3

**Why this matters**: This connects the indicator to the actual chat flow. The visibility logic must handle multiple states (file uploads, message sending, streaming) to provide seamless feedback throughout the entire request lifecycle.

**Files to touch**:
- `src/components/chat/AdvancedChatInterface.tsx:7` — Add import
- `src/components/chat/AdvancedChatInterface.tsx:32` — Add state
- `src/components/chat/AdvancedChatInterface.tsx:66-72` — Wrap file upload
- `src/components/chat/AdvancedChatInterface.tsx:279` — Insert component

**Functional Requirements**:
1. Import `ThinkingIndicator` from `"./ThinkingIndicator"`
2. Add `isUploadingFiles` state variable initialized to `false`
3. Set `isUploadingFiles` to `true` before calling `uploadFiles()`
4. Set `isUploadingFiles` to `false` after `uploadFiles()` completes (in `finally` block)
5. Calculate `showThinkingIndicator` as:
   ```typescript
   (isUploadingFiles || isSendingMessage || streamingState.isStreaming) &&
   !streamingState.streamingMessage &&
   !streamingState.currentFunction
   ```
6. Render `<ThinkingIndicator visible={showThinkingIndicator} />` before the streaming message block
7. The indicator must appear in the same visual position as the streaming message (same `px-4 py-6` wrapper, same layout)

**Notes for implementer**:
- The file upload happens at lines 66-72 in `handleSendMessage`
- Use try/finally to ensure `isUploadingFiles` is reset even if upload fails
- The streaming message block starts at line 279
- Insert the ThinkingIndicator BEFORE the streaming message conditional
- Both components render in the same position — only one is visible at a time
- **IMPORTANT**: The `isSendingMessage` mutation state stays `true` during the entire request including upload, so the gap between upload and message send is covered
- **Reasoning behavior**: The indicator shows until `streamingMessage` has content (not reasoning). Reasoning alone does NOT hide the indicator — this is intentional UX
- Add `showThinkingIndicator` to scroll dependencies (line 57) so indicator triggers auto-scroll

**Estimated Effort**: 1 hour

**Acceptance Criteria**:
- [ ] `ThinkingIndicator` is imported from `"./ThinkingIndicator"`
- [ ] `isUploadingFiles` state exists with initial value `false`
- [ ] `setIsUploadingFiles(true)` is called before `uploadFiles()`
- [ ] `setIsUploadingFiles(false)` is called in `finally` block after `uploadFiles()`
- [ ] `showThinkingIndicator` variable calculates visibility using all three conditions
- [ ] `<ThinkingIndicator visible={showThinkingIndicator} />` is rendered before streaming message block
- [ ] Scroll `useEffect` dependency array includes `showThinkingIndicator`
- [ ] `npm run build` succeeds
- [ ] Indicator shows immediately when Send is clicked (within 100ms)
- [ ] Indicator hides when first response text appears (within 100ms of text_delta)
- [ ] Indicator shows during file upload phase
- [ ] Indicator hides when function call indicator appears
- [ ] No layout shift when transitioning from indicator to streaming message
- [ ] Indicator appearance triggers auto-scroll to bottom
- [ ] No other components break due to state changes

**Required Tests**:
- Manual: Send a text-only message, verify indicator shows then hides when response starts
- Manual: Attach a file and send, verify indicator shows during upload AND during AI processing
- Manual: Enable reasoning mode, verify indicator shows until text (not reasoning) arrives
- Manual: Trigger a function call (e.g., dosage calculation), verify indicator hides when function UI appears
- Manual: Click Stop while indicator is showing, verify indicator hides immediately
- Manual: With long conversation, send message and verify chat auto-scrolls to show indicator

**Ripple Effect Checks**:

1. **Streaming message dependencies**:
   - Search: `grep -n "streamingState.streamingMessage" src/components/chat/AdvancedChatInterface.tsx`
   - Fix: Verify indicator/streaming message never render simultaneously (mutually exclusive conditions)
   - Criterion: `[ ] Indicator and streaming message never appear at same time`

2. **Scroll behavior**:
   - Search: `grep -n "scrollToBottom" src/components/chat/AdvancedChatInterface.tsx`
   - Fix: Add `showThinkingIndicator` to useEffect dependency array on line 57
   - Criterion: `[ ] Indicator appearance triggers scroll to bottom`

3. **Welcome state**:
   - Search: `grep -n "messages.length === 0" src/components/chat/AdvancedChatInterface.tsx`
   - Fix: Verify welcome state hides when indicator shows (add `!showThinkingIndicator` to condition)
   - Criterion: `[ ] Welcome state hides when indicator is visible`

---

### Phase 4: Polish

#### TASK-5: Manual Testing and Edge Case Verification

**Summary**: Comprehensive manual testing of all edge cases and user flows.

**Dependencies**: TASK-4

**Why this matters**: Edge cases like network errors, rapid message sending, and accessibility features need manual verification to ensure a polished user experience.

**Files to touch**: None (testing only)

**Functional Requirements**:
1. All user flows must work correctly
2. No memory leaks after extended use
3. Accessibility requirements must be met
4. Performance must be acceptable on mobile devices

**Test Matrix**:

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Basic send | Type message, click Send | Indicator shows, then response streams |
| 2 | File upload | Attach PDF, type message, Send | Indicator shows during upload + AI processing |
| 3 | Stop streaming | Send message, click Stop | Indicator hides immediately |
| 4 | Network error | Disable network, send message | Indicator shows, then error toast, indicator hides |
| 5 | Rapid send | Send 5 messages in quick succession | Each message triggers its own indicator cycle |
| 6 | Reasoning mode | Enable reasoning, send message | Indicator shows until text (not reasoning) starts |
| 7 | Function call | Ask dosage question | Indicator hides when "Running function..." appears |
| 8 | Reduced motion | Enable OS reduced motion setting | Logo static, typewriter still works |
| 9 | Screen reader | Enable VoiceOver, send message | Announces "AI is processing your question" |
| 10 | Mobile performance | Test on iPhone Safari | Smooth 30fps+ animation |
| 11 | Memory leak | Send 20 messages, check DevTools Memory tab | Heap should not grow by more than 50MB |
| 12 | Upload cancel | Attach file, click Send, cancel upload | Indicator shows during upload, hides when cancelled |
| 13 | Message spam | Send 10 messages in 1 second | Each gets own indicator cycle, no crashes |
| 14 | Long function | Ask complex dosage question | Indicator shows → function UI → response |
| 15 | Auto-scroll | Long conversation, send message | Chat auto-scrolls to show indicator |

**Notes for implementer**:
- Use Chrome DevTools Performance tab to verify 60fps on desktop
- Use Safari Web Inspector on real iPhone for mobile testing
- Check React DevTools Profiler for unnecessary re-renders
- Memory test: take heap snapshot before, send 20 messages, take snapshot after, compare

**Estimated Effort**: 1 hour

**Acceptance Criteria**:
- [ ] All 15 test matrix scenarios pass
- [ ] No console errors during any test scenario
- [ ] React DevTools Profiler shows no unnecessary re-renders of ThinkingIndicator
- [ ] Chrome DevTools Performance shows 60fps animation on desktop (record 10s, check for dropped frames)
- [ ] Safari shows 30fps+ animation on iPhone
- [ ] Memory heap grows by less than 50MB after 20 messages (take heap snapshot before/after)
- [ ] VoiceOver announces the status correctly

**Required Tests**:
- All tests are manual as defined in the test matrix above

---

## Glossary

| Term | Definition |
|------|------------|
| `isSendingMessage` | Boolean from React Query mutation indicating the message send is in progress (includes entire streaming duration) |
| `streamingState.isStreaming` | Boolean indicating the SSE stream is active |
| `streamingState.streamingMessage` | Accumulated response text from `text_delta` events |
| `streamingState.currentFunction` | Object present when a function (tool) is being executed |
| Fisher-Yates shuffle | Algorithm to randomly reorder an array in O(n) time |
| SSE | Server-Sent Events — the streaming protocol used for AI responses |
| `text_delta` | SSE event type containing a chunk of response text |

## Out of Scope

- Changes to the landing page demo's `ThinkingIndicator` (separate component)
- New test files (manual testing only for this feature)
- Changes to the streaming logic in `useAdvancedAIChat.ts`
- Analytics or telemetry for indicator display duration
- Customizable phrases or animation settings

## Open Questions

None — all design decisions have been made.

---

## Peer Review Results

**Status**: Needs Revision → **Revised**

**Reviewer**: Staff Engineer Sub-Agent

### Critical Issues (All Addressed)

| Issue | Resolution |
|-------|------------|
| Animation timing contradiction (FR#4 vs acceptance criteria) | Fixed: FR#4 now specifies `step-end` for cursor-blink |
| Motion-safe CSS selector syntax invalid | Fixed: Notes now specify wrapper div approach |
| Fisher-Yates shuffle unnecessary complexity | Fixed: Changed to sequential cycling like landing demo |
| Missing scroll trigger for indicator | Fixed: Added to acceptance criteria and notes |
| Incomplete ripple effect analysis | Fixed: Added 3 specific ripple checks with search commands |
| Missing test cases | Fixed: Expanded test matrix from 11 to 15 scenarios |
| Vague memory leak criterion | Fixed: Specified "less than 50MB growth" |

### Pattern Compliance (Verified)

| Pattern | Status | Notes |
|---------|--------|-------|
| Component memoization | ✅ | Uses `memo()` |
| useEffect cleanup | ✅ | Returns cleanup functions |
| Tailwind animation extensions | ✅ | Follows existing keyframe structure |
| ARIA attributes | ✅ | Uses `role`, `aria-live`, `aria-label` |
| Motion-safe prefixes | ✅ | Fixed to use wrapper div approach |
| Props interface export | ✅ | Added to requirements |

### Recommendations Incorporated

**Must Fix (All Done)**:
1. ✅ Fixed animation timing contradiction
2. ✅ Fixed motion-safe syntax
3. ✅ Clarified reasoning visibility logic
4. ✅ Added scroll trigger requirement
5. ✅ Removed Fisher-Yates shuffle

**Should Fix (All Done)**:
1. ✅ Completed ripple effect analysis
2. ✅ Added missing test cases
3. ✅ Added props interface export requirement
4. ✅ Added memory leak baseline numbers

---

## Pre-Completion Checklist

- [x] /docs folder was searched for relevant patterns
- [x] Codebase patterns are documented and applied
- [x] Every task has numbered functional requirements
- [x] Every acceptance criterion is specific and verifiable
- [x] Every task includes required tests (manual for this feature)
- [x] All UI tasks include browser verification criteria
- [x] Dependencies form a valid DAG (no cycles)
- [x] Technical jargon is explained in Glossary
- [x] No task requires implicit codebase knowledge without pointers
- [x] Peer review sub-agent was run and feedback incorporated
