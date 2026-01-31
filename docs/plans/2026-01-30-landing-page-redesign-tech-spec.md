# Tech Spec: Landing Page Demo-Centric Redesign

## Overview

This spec breaks down the PRD into granular, sequenced tasks for implementing a demo-centric landing page redesign. The goal is to reduce time-to-value on mobile by making the interactive demo visible above the fold, while maintaining the terminal aesthetic on desktop and applying dark branding to the auth page.

**PRD Reference**: `docs/plans/2026-01-30-landing-page-redesign-prd.md`

---

## Codebase Patterns Applied

| Pattern | Source | Application |
|---------|--------|-------------|
| Rezzy color tokens | `tailwind.config.ts` | Use `rezzy-*` color classes consistently |
| shadcn/ui components | `src/components/ui/*` | Extend existing Input, Button, Label components |
| React hooks pattern | `src/hooks/*` | Use existing `useAuth`, `useToast` hooks |
| Landing component structure | `src/components/landing/*` | Follow existing component organization |
| Responsive breakpoints | Tailwind defaults | `md:` (768px) for mobile/desktop split |

---

## Architecture Decisions

1. **Mobile/Desktop detection**:
   - For **styling-only** changes: Use Tailwind `md:` breakpoint (768px) responsive classes
   - For **conditional component rendering**: Use existing `useIsMobile()` hook from `src/hooks/use-mobile.tsx`
   - Note: `useIsMobile()` returns `false` on initial render (SSR-safe), then updates on mount
2. **Component extraction**: Extract subcomponents from `InteractiveDemo.tsx` to reduce file size and improve testability
3. **Auth page state**: Replace `Tabs` component with simple `useState` toggle for form switching
4. **No new dependencies**: All changes use existing Tailwind classes and React patterns
5. **iOS safe area handling**: Use `env(safe-area-inset-bottom)` for input positioning on mobile to account for iOS home indicator

---

## Dependency Graph

```
TASK-1 (Refactor InteractiveDemo)
    ├── TASK-4 (Mobile Chat UI)
    └── TASK-5 (Desktop Terminal Polish)

TASK-2 (Auth Dark Theme) ─── standalone

TASK-3 (Hero Restructure) ─── standalone
    └── TASK-6 (Header Mobile) [optional P2]

TASK-7 (Integration Testing) ─── depends on all above
```

**Parallel execution possible**: TASK-1, TASK-2, TASK-3 can run in parallel.

---

## Execution Strategy

**PR Approach**: Stacked PRs — each task is one PR, merged in sequence
**Branch Naming**: `feature/landing-redesign-[task-number]-[short-name]`

---

## Acceptance Test Checklist

These are the **mandatory acceptance tests** that must pass before the feature is considered complete. Each test has explicit steps and expected outcomes.

---

### TEST 1: Mobile vs Desktop Layout Differentiation

**Purpose**: Verify that mobile and desktop render distinctly different UI experiences.

#### TEST 1A: Desktop Terminal Experience
```
SETUP: Open Chrome, set viewport to 1280x800 (or any width ≥ 768px)
NAVIGATE: Go to / (landing page)

VERIFY DESKTOP LAYOUT:
[ ] Hero shows two-column layout (headline left, demo right)
[ ] Headline is stacked: "Your" / "unfair" / "advantage." on separate lines
[ ] Subheadline visible: "Evidence-based answers in seconds..."
[ ] Stats row visible: "2 min", "47", "∞"
[ ] Demo has terminal chrome:
    [ ] Traffic lights (red, yellow, green circles) in header
    [ ] "rezzy.terminal" title in header
    [ ] Scanline effect animating across terminal
    [ ] Blinking cursor in input area
[ ] User messages show with "→" prefix
[ ] Rezzy messages show with green "REZZY" label
[ ] Thinking indicator shows rotating phrases ("Consulting references...", etc.)
[ ] Footer shows "Ready" status and "X free questions remaining"
```

#### TEST 1B: Mobile Chat Experience
```
SETUP: Open Chrome DevTools, set viewport to 375x667 (iPhone SE)
NAVIGATE: Go to / (landing page)

VERIFY MOBILE LAYOUT:
[ ] Demo visible without scrolling (within 80% of viewport height from top)
[ ] Headline shows as single line: "Your unfair advantage."
[ ] Subheadline NOT visible in initial view
[ ] Stats row NOT visible in initial view
[ ] Demo has NO terminal chrome:
    [ ] NO traffic lights
    [ ] NO "rezzy.terminal" header
    [ ] NO scanline effect
    [ ] NO blinking cursor
[ ] User messages are right-aligned bubbles with rounded corners
[ ] Rezzy messages are left-aligned bubbles with rounded corners
[ ] Thinking indicator shows ONLY three animated dots (no rotating text)
[ ] Suggestion chips have visible borders, are easily tappable (44px+ height)
[ ] "X free questions remaining" visible
[ ] Input field at bottom of demo component
```

#### TEST 1C: Responsive Transition
```
SETUP: Open page at desktop width (1280px)
ACTION: Slowly drag browser width from 1280px → 375px

VERIFY:
[ ] At 768px breakpoint, layout switches from terminal to chat
[ ] No visual glitches during transition
[ ] No content loss during transition
[ ] If mid-conversation, messages remain visible (state preserved)
```

---

### TEST 2: Demo Query Flow (Email Validation + Response)

**Purpose**: Verify the complete demo interaction from question to AI response.

#### TEST 2A: First Question + Email Capture
```
SETUP: Clear localStorage (DevTools > Application > Clear site data)
NAVIGATE: Go to / (landing page)

STEP 1 - Ask a question:
ACTION: Type "What is the dosing for amoxicillin in a 15kg child?" and press Enter
VERIFY:
[ ] User message appears (bubble on mobile, → prefix on desktop)
[ ] Rezzy responds: "Good question. Drop your email and I'll pull up the answer."
[ ] Input placeholder changes to "Enter your email..."

STEP 2 - Invalid email:
ACTION: Type "notanemail" and press Enter
VERIFY:
[ ] Error message appears: "That email doesn't look right. Try again?"
[ ] User can re-enter email (input not disabled)

STEP 3 - Valid email:
ACTION: Type "test@example.com" and press Enter
VERIFY:
[ ] Email message appears in conversation
[ ] "Checking..." message appears briefly
[ ] Thinking indicator shows (dots on mobile, rotating phrases on desktop)
[ ] Response streams in character by character
[ ] After response complete, shows "2 free questions remaining"
[ ] localStorage now contains rezzy_demo_session with email
```

#### TEST 2B: Subsequent Questions (Email Remembered)
```
SETUP: Continue from TEST 2A (email already captured)

ACTION: Type "What are the red flags for fever in an infant?" and press Enter
VERIFY:
[ ] NO email prompt (email remembered from session)
[ ] Thinking indicator shows immediately
[ ] Response streams
[ ] Shows "1 free question remaining" after response
```

---

### TEST 3: Demo Exhaustion → Auth Redirect

**Purpose**: Verify that after 3 questions, user is redirected to signup.

```
SETUP: Clear localStorage, complete TEST 2A and 2B (2 questions used)

ACTION: Ask a third question: "Differential for pediatric chest pain?"
VERIFY:
[ ] Response streams normally
[ ] After response, shows "You've used your 3 free questions. Ready for unlimited access?"
[ ] After ~2 seconds, automatically redirects to /auth

ON AUTH PAGE:
[ ] URL is /auth?email=test@example.com (email in query param)
[ ] Email field is pre-filled with "test@example.com"
[ ] Context line shows: "You asked 3 questions. Keep going."
[ ] Signup form is displayed (not sign-in)
```

#### TEST 3B: Returning Exhausted User
```
SETUP: localStorage has rezzy_demo_session with remaining=0, email="test@example.com"

NAVIGATE: Go to / (landing page)
VERIFY:
[ ] Demo shows: "Welcome back! You've used your 3 free questions..."
[ ] Input placeholder shows: "Press Enter to sign up..."

ACTION: Press Enter
VERIFY:
[ ] Redirects to /auth?email=test@example.com
```

---

### TEST 4: Auth Page Functionality

**Purpose**: Verify signup and login work correctly with dark theme.

#### TEST 4A: Auth Page Visual Verification
```
NAVIGATE: Go to /auth

VERIFY DARK THEME:
[ ] Background is black (#000000)
[ ] Input fields have dark background with visible borders
[ ] CTA button is bright green (#39FF14) with black text
[ ] REZZY logo visible at top
[ ] Trust badges visible: "✓ No credit card • ✓ Cancel anytime"
```

#### TEST 4B: Signup Flow
```
NAVIGATE: Go to /auth?email=newuser@example.com

VERIFY INITIAL STATE:
[ ] Signup form displayed (not sign-in)
[ ] Email field pre-filled with "newuser@example.com"
[ ] "Already have an account? Sign in" link visible

STEP 1 - Validation errors:
ACTION: Leave First Name empty, click "Create Account"
VERIFY: [ ] Error toast: "First name is required"

ACTION: Fill First Name "Test", Last Name "User", Password "short"
ACTION: Click "Create Account"
VERIFY: [ ] Error toast: "Password must be at least 8 characters"

STEP 2 - Successful signup:
ACTION: Fill all fields correctly:
  - First Name: "Test"
  - Last Name: "User"
  - Email: "newuser@example.com"
  - Password: "SecurePass123"
ACTION: Click "Create Account"
VERIFY:
[ ] Button shows "Creating account..." while loading
[ ] Success toast: "Account created successfully!"
[ ] (If email verification required) Toast mentions checking email
```

#### TEST 4C: Sign In Flow
```
NAVIGATE: Go to /auth

ACTION: Click "Already have an account? Sign in"
VERIFY:
[ ] Form swaps to sign-in view (no page navigation)
[ ] URL remains /auth (no change)
[ ] "Need an account? Sign up" link now visible

STEP 1 - Invalid credentials:
ACTION: Enter wrong email/password, click "Sign In"
VERIFY: [ ] Error toast: "Invalid email or password"

STEP 2 - Successful login:
ACTION: Enter valid credentials for existing user
ACTION: Click "Sign In"
VERIFY:
[ ] Button shows "Signing in..." while loading
[ ] Success toast: "Welcome back!"
[ ] Redirects to /onboarding (or /ai-copilot if onboarding complete)
```

#### TEST 4D: Form Toggle Persistence
```
NAVIGATE: Go to /auth (defaults to sign-in)
ACTION: Click "Need an account? Sign up"
VERIFY: [ ] Signup form shows

ACTION: Click browser back button
ACTION: Click browser forward button
VERIFY: [ ] Form state may reset (acceptable) OR persist (bonus)

NAVIGATE: Go to /auth?email=test@example.com
VERIFY: [ ] Signup form shows (email param forces signup view)
```

#### TEST 4E: Mobile Auth Layout
```
SETUP: Set viewport to 375x667

NAVIGATE: Go to /auth?email=test@example.com

VERIFY MOBILE LAYOUT:
[ ] First name and Last name fields are STACKED (not side-by-side)
[ ] All form fields are full-width
[ ] Content is top-aligned (not vertically centered)
[ ] CTA button is easily tappable
[ ] No horizontal scroll
```

---

### TEST 5: Cross-Browser Verification

**Purpose**: Ensure functionality works across target browsers.

```
BROWSERS TO TEST:
[ ] Chrome (latest) - Desktop
[ ] Firefox (latest) - Desktop
[ ] Safari (latest) - Desktop
[ ] Chrome (latest) - Android (real device or BrowserStack)
[ ] Safari - iOS (real device or BrowserStack)

FOR EACH BROWSER, VERIFY:
[ ] TEST 1A or 1B passes (depending on viewport)
[ ] TEST 2A passes (demo flow works)
[ ] TEST 4B or 4C passes (auth works)
[ ] No console errors
[ ] No visual glitches
```

---

### TEST 6: Performance Verification

**Purpose**: Ensure page meets performance requirements.

```
SETUP: Chrome DevTools > Lighthouse > Mobile

RUN LIGHTHOUSE AUDIT ON:
1. / (landing page)
2. /auth

VERIFY:
[ ] Landing page Performance score > 85
[ ] Landing page Accessibility score > 90
[ ] Auth page Performance score > 85
[ ] Auth page Accessibility score > 90
[ ] No major accessibility violations flagged

NETWORK THROTTLING TEST:
SETUP: DevTools > Network > Slow 3G

NAVIGATE: Go to / (landing page)
VERIFY:
[ ] Page loads and is interactive within 5 seconds
[ ] Demo is functional (can type, submit)
```

---

## UX Test Flows

Below are the narrative user flows (for reference). The Acceptance Test Checklist above provides the detailed verification steps.

### Flow 1: Mobile Happy Path (Demo → Signup)

```
PRECONDITION: Clear localStorage, use mobile viewport (375x667)

1. Navigate to / (landing page)
   VERIFY: Demo component visible without scrolling
   VERIFY: Headline shows "Your unfair advantage." on single line
   VERIFY: No terminal chrome (traffic lights, scanlines)
   VERIFY: Input field at bottom of demo, placeholder "Type a clinical question..."

2. Tap suggestion chip "Amoxicillin dosing 15kg"
   VERIFY: Input field populates with suggestion text
   VERIFY: Chip has visible border (not just text)

3. Submit the question (tap Enter or submit)
   VERIFY: User message appears as right-aligned bubble
   VERIFY: Rezzy asks for email as left-aligned bubble

4. Enter email "test@example.com" and submit
   VERIFY: Email appears as right-aligned bubble
   VERIFY: Typing indicator shows (three dots, no rotating phrases)
   VERIFY: No blinking cursor animation

5. Wait for response to stream
   VERIFY: Response streams in left-aligned bubble
   VERIFY: "2 free questions remaining" visible

6. Ask two more questions to exhaust demo
   VERIFY: After 3rd response, see "Ready for unlimited access?"
   VERIFY: Auto-redirect to /auth after 2 seconds

7. On Auth page
   VERIFY: Dark background (bg-rezzy-black)
   VERIFY: Email pre-filled from demo
   VERIFY: Green CTA button "Create Account"
   VERIFY: Form fields stacked (not side-by-side)
   VERIFY: "Already have an account? Sign in" link visible

8. Click "Sign in" link
   VERIFY: Form swaps to sign-in (no page navigation)
   VERIFY: "Need an account? Sign up" link visible
```

### Flow 2: Desktop Happy Path

```
PRECONDITION: Clear localStorage, use desktop viewport (1280x800)

1. Navigate to / (landing page)
   VERIFY: Demo visible on right side of hero
   VERIFY: Terminal chrome present (traffic lights, scanlines, "rezzy.terminal")
   VERIFY: Blinking cursor visible in input area
   VERIFY: Headline shows stacked layout (preserved for desktop)

2. Type "Fever in infant" and submit
   VERIFY: Terminal-style message rendering (→ prefix, monospace)
   VERIFY: Thinking indicator with rotating phrases ("Consulting references...")
   VERIFY: Blinking cursor during streaming

3. Complete demo flow to auth
   VERIFY: Auth page has dark theme
   VERIFY: First/last name fields can be side-by-side on desktop
```

### Flow 3: Returning User (Exhausted Demo)

```
PRECONDITION: localStorage has rezzy_demo_session with remaining=0

1. Navigate to / (landing page)
   VERIFY: Demo shows "You've used your 3 free questions..."
   VERIFY: Input placeholder shows "Press Enter to sign up..."

2. Press Enter
   VERIFY: Redirects to /auth with email pre-filled
```

### Flow 4: iOS Keyboard Test

```
PRECONDITION: Real iOS device or accurate simulator, mobile viewport

1. Navigate to /, tap input field
   VERIFY: Keyboard opens
   VERIFY: Input field remains visible (not covered by keyboard)
   VERIFY: Can type and submit while keyboard is open
```

---

## Task Breakdown

### Phase 1: Foundation

---

#### TASK-1: Refactor InteractiveDemo into Subcomponents

**Summary**: Extract reusable subcomponents from the 522-line InteractiveDemo.tsx to enable mobile/desktop conditional rendering.

**Dependencies**: None

**Why this matters**: The current file is too large for safe modification. Extracting subcomponents makes the mobile chat UI changes isolated and testable.

**Files to touch**:
- `src/components/landing/InteractiveDemo.tsx` — reduce to orchestration logic only
- `src/components/landing/demo/ChatMessage.tsx` — NEW: handles message rendering
- `src/components/landing/demo/ChatInput.tsx` — NEW: input field + suggestions
- `src/components/landing/demo/ThinkingIndicator.tsx` — NEW: thinking/typing animation
- `src/components/landing/demo/TerminalChrome.tsx` — NEW: header/footer for desktop

**Functional Requirements**:
1. `ChatMessage` must render four message types: `system`, `user`, `assistant`, `error`
2. `ChatMessage` must accept a `variant` prop: `"terminal"` (current style) or `"chat"` (bubble style)
3. `ChatInput` must handle placeholder text based on demo state
4. `ChatInput` must render suggestion chips when in idle state with no user messages
5. `ThinkingIndicator` must accept a `variant` prop: `"terminal"` (rotating phrases) or `"chat"` (dots only)
6. `TerminalChrome` must render header (traffic lights, title) and footer (status, remaining queries)
7. All existing functionality must be preserved — no behavior changes in this task

**Notes for implementer**:
- Keep all state in `InteractiveDemo.tsx` — subcomponents receive props only
- The `Message` interface is defined at line 24-27 of current file
- Suggestion chips are currently rendered at lines 458-475
- Terminal header is lines 340-349, footer is lines 478-499

**Estimated Effort**: 3-4 hours

**Acceptance Criteria**:
- [ ] `InteractiveDemo.tsx` imports and uses all four new subcomponents
- [ ] `InteractiveDemo.tsx` contains only orchestration logic (state, effects, handlers); all rendering delegated to subcomponents
- [ ] Shared interfaces (`Message`, `DemoState`) moved to `src/types/demo.ts`
- [ ] All demo functionality works identically to before (no visual or behavioral changes)
- [ ] Each subcomponent has TypeScript props interface defined and exported
- [ ] Running `npm run build` produces no TypeScript errors
- [ ] `HeroSection.tsx` continues to work with no import changes

**Required Tests**:
- Manual: Complete full demo flow (ask question → email → 3 responses → redirect) — behavior unchanged
- Manual: Verify terminal chrome, thinking indicator, message styles all render correctly
- Manual: Resize browser during demo interaction — no state loss or visual glitches

---

### Phase 2: Core Features (Parallel)

---

#### TASK-2: Auth Page Dark Theme

**Summary**: Restyle the auth page with dark Rezzy branding and replace tabs with inline form switching.

**Dependencies**: None

**Why this matters**: Creates visual continuity from landing page through signup, reducing cognitive friction at the conversion point.

**Files to touch**:
- `src/pages/Auth.tsx` — complete restyling

**Functional Requirements**:
1. Background must use `bg-rezzy-black` (not `bg-bg-primary`)
2. Form inputs must use dark styling: `bg-rezzy-off-black`, `border-rezzy-gray-dark`, `text-rezzy-white`
3. CTA button must use `bg-rezzy-green text-rezzy-black font-semibold`
4. Logo must match landing page: green square with cutout + "REZZY" text
5. When `?email=` query param present, show context line: "You asked 3 questions. Keep going."
6. First/last name fields must stack vertically on mobile (`grid-cols-1`), can be side-by-side on desktop (`md:grid-cols-2`)
7. Content must be top-aligned with padding, not vertically centered
8. Remove `Tabs` component — use `useState` to toggle between signup/signin views
9. Signup view shows "Already have an account? Sign in" link at bottom
10. Signin view shows "Need an account? Sign up" link at bottom
11. Clicking links swaps form in place without navigation
12. Trust badges at bottom: "✓ No credit card • ✓ Cancel anytime"
13. All form validation and submission logic must remain unchanged

**Notes for implementer**:
- Current file uses shadcn `Card`, `Tabs`, `Input`, `Button`, `Label` components
- Keep using `Input`, `Button`, `Label` but remove `Card` and `Tabs`
- The `prefillEmail` variable (line 31) already extracts email from query params
- Zod schemas (lines 12-22) remain unchanged
- `handleSignUp` and `handleSignIn` functions remain unchanged

**Estimated Effort**: 2-3 hours

**Acceptance Criteria**:
- [ ] Page background is `#000000` (rezzy-black)
- [ ] Input fields have dark backgrounds with visible borders
- [ ] CTA button is bright green (`#39FF14`) with black text
- [ ] When navigating to `/auth?email=test@example.com`, email field is pre-filled AND context line appears
- [ ] When navigating to `/auth` (no email), no context line appears, defaults to sign-in view
- [ ] Clicking "Sign in" / "Sign up" links toggles form without page reload
- [ ] Browser back/forward with `?email=` param correctly updates view (test: visit `/auth`, then navigate to `/auth?email=test@example.com`)
- [ ] Form submission works correctly (test with invalid email to verify validation)
- [ ] On mobile (375px width), first/last name fields are stacked
- [ ] On desktop (1280px width), first/last name fields can be side-by-side
- [ ] Trust badges visible at bottom of form
- [ ] Verify in browser: WCAG AA contrast ratio passes for all text

**Required Tests**:
- Manual: Navigate to `/auth?email=demo@test.com` — verify email pre-filled, context line shown
- Manual: Submit sign-up with invalid email — verify error toast appears
- Manual: Toggle between Sign In and Sign Up — verify form swaps, no navigation
- Manual: Test on mobile viewport — verify fields stack

---

#### TASK-3: Hero Section Restructure

**Summary**: Condense the hero section so the demo is visible above the fold on mobile.

**Dependencies**: None

**Why this matters**: Mobile users currently must scroll ~800px to reach the demo. This is the core problem the redesign solves.

**Files to touch**:
- `src/components/landing/HeroSection.tsx` — restructure layout

**Functional Requirements**:
1. On mobile (< 768px):
   - Headline displays as single line: "Your unfair advantage." (not stacked)
   - Headline font size: `text-3xl` or `text-4xl` (reduced from `text-5xl`)
   - Subheadline and stats row are hidden (moved below fold conceptually)
   - Demo component appears directly below headline
   - Padding reduced: `pt-20` instead of `pt-32`
   - Demo must be visible within 600px from top of page
2. On desktop (≥ 768px):
   - Keep current two-column layout (headline left, demo right)
   - Headline can remain stacked ("Your" / "unfair" / "advantage.")
   - Subheadline and stats visible
   - Current padding preserved
3. Eyebrow ("AI-POWERED CLINICAL ASSISTANT") remains visible on both
4. Trust badges remain below demo on both
5. Scroll indicator remains at bottom
6. All entrance animations preserved

**Notes for implementer**:
- Current layout uses `grid lg:grid-cols-2` (line 30)
- Stats row is lines 78-98
- Use Tailwind responsive prefixes: `hidden md:block` to hide on mobile
- The headline currently uses three separate `<span>` blocks (lines 55-63)
- For mobile single-line headline, use a different structure or conditional class

**Estimated Effort**: 2-3 hours

**Acceptance Criteria**:
- [ ] On 375px viewport: headline shows "Your unfair advantage." on one line
- [ ] On 375px viewport: demo top edge is within 80vh (80% of viewport height) from page top
- [ ] On 375px viewport: subheadline and stats are NOT visible in initial view
- [ ] On 1280px viewport: headline shows stacked layout
- [ ] On 1280px viewport: subheadline and stats ARE visible
- [ ] On 1280px viewport: demo is on right side of hero
- [ ] Eyebrow with green dot visible on both viewports
- [ ] Trust badges visible below demo on both viewports
- [ ] Entrance animations still work (elements fade in on load)
- [ ] Verify in browser using DevTools responsive mode

**Required Tests**:
- Manual: Load page at 375px width, measure pixels from top to demo component
- Manual: Load page at 1280px width, verify full layout matches current
- Manual: Resize browser from mobile to desktop, verify smooth transition

---

### Phase 3: Demo UI Variants

---

#### TASK-4: Mobile Chat UI Implementation

**Summary**: Implement chat-bubble style UI for the demo on mobile viewports.

**Dependencies**: TASK-1 (subcomponents must exist)

**Why this matters**: Chat UI is universally familiar to the target demographic (medical residents), reducing cognitive load and time-to-first-interaction.

**Files to touch**:
- `src/components/landing/InteractiveDemo.tsx` — add mobile variant rendering
- `src/components/landing/demo/ChatMessage.tsx` — implement `variant="chat"` styling
- `src/components/landing/demo/ChatInput.tsx` — implement mobile layout
- `src/components/landing/demo/ThinkingIndicator.tsx` — implement `variant="chat"` (dots only)

**Functional Requirements**:
1. On mobile (< 768px), render chat UI variant:
   - No terminal chrome (no traffic lights, no scanlines, no "rezzy.terminal" header)
   - No blinking cursor animation
   - User messages: right-aligned bubbles with `bg-rezzy-green/10` background, rounded corners
   - Assistant/system messages: left-aligned bubbles with `bg-rezzy-off-black` background
   - Error messages: left-aligned with red text
2. Input field anchored at bottom of component
3. Suggestion chips below input with smaller size (`px-2 py-1`) but retain borders
4. Touch targets minimum 44px height
5. Thinking indicator: three animated dots only (no rotating phrases)
6. "X free questions remaining" still visible (in footer area or below input)
7. All state management and API calls unchanged

**Notes for implementer**:
- Use existing `useIsMobile()` hook from `src/hooks/use-mobile.tsx` for conditional component rendering
- Message bubble styling example: `rounded-2xl px-4 py-2 max-w-[80%]`
- The three-dot animation already exists in ThinkingIndicator (lines 393-398)
- For iOS safe area: add `pb-[env(safe-area-inset-bottom)]` or use `pb-safe` if configured

**Estimated Effort**: 3-4 hours

**Acceptance Criteria**:
- [ ] On 375px viewport: no terminal header visible
- [ ] On 375px viewport: no scanline effect visible
- [ ] On 375px viewport: user messages are right-aligned bubbles
- [ ] On 375px viewport: Rezzy messages are left-aligned bubbles
- [ ] On 375px viewport: thinking indicator shows only dots (no "Consulting references...")
- [ ] On 375px viewport: no blinking cursor visible
- [ ] On 375px viewport: suggestion chips have visible borders, min-height 44px
- [ ] On 375px viewport: "X free questions remaining" visible
- [ ] Tapping suggestion chip fills input (existing behavior)
- [ ] Full demo flow works: question → email → responses → redirect
- [ ] No visible layout shift when component mounts (test with DevTools throttling to Slow 3G)
- [ ] Viewport resize during streaming: UI must not lose streamed content or cause layout errors
- [ ] Input container accounts for iOS safe area (home indicator doesn't overlap input)
- [ ] Verify in browser: DevTools mobile mode, test full flow

**Required Tests**:
- Manual: Complete full demo flow on mobile viewport
- Manual: Verify touch targets with DevTools (Rendering > Show tap regions if available)
- Manual: Test iOS keyboard behavior (real device or BrowserStack)

---

#### TASK-5: Desktop Terminal UI Polish

**Summary**: Ensure desktop retains full terminal aesthetic with blinking cursor and all chrome.

**Dependencies**: TASK-1 (subcomponents must exist)

**Why this matters**: Desktop users get the distinctive Rezzy brand experience while mobile users get familiar chat UX.

**Files to touch**:
- `src/components/landing/InteractiveDemo.tsx` — ensure desktop variant renders correctly
- `src/components/landing/demo/ChatMessage.tsx` — implement `variant="terminal"` styling
- `src/components/landing/demo/ThinkingIndicator.tsx` — implement `variant="terminal"` with rotating phrases

**Functional Requirements**:
1. On desktop (≥ 768px), render terminal UI variant:
   - Terminal header with traffic lights (red, yellow, green dots) and "rezzy.terminal" title
   - Scanline effect overlay
   - Blinking cursor in input area and during streaming
   - User messages with `→` prefix
   - Assistant messages with green `REZZY` label and monospace text
   - Thinking indicator with rotating phrases
   - Terminal footer with status and remaining queries
2. All existing terminal styling preserved from current implementation
3. `crt-glow` effect preserved

**Notes for implementer**:
- This task is mostly verification that TASK-1 refactor preserved desktop behavior
- The `variant="terminal"` should be the default/existing styling
- Scanline CSS class is already defined in styles

**Estimated Effort**: 1-2 hours

**Acceptance Criteria**:
- [ ] On 1280px viewport: terminal header with traffic lights visible
- [ ] On 1280px viewport: "rezzy.terminal" title in header
- [ ] On 1280px viewport: scanline effect animating
- [ ] On 1280px viewport: blinking cursor visible when input empty
- [ ] On 1280px viewport: user messages have `→` prefix
- [ ] On 1280px viewport: assistant messages have "REZZY" label
- [ ] On 1280px viewport: thinking shows rotating phrases
- [ ] On 1280px viewport: footer shows status and remaining queries
- [ ] Full demo flow works identically to current production

**Required Tests**:
- Manual: Compare desktop demo side-by-side with production (if available) or screenshots
- Manual: Verify all animations (scanline, cursor blink, thinking phrases)

---

### Phase 4: Polish (Optional)

---

#### TASK-6: Header Mobile Cleanup

**Summary**: Remove navigation links on mobile, keeping only logo and "Get Started" CTA.

**Dependencies**: None (P2, can be done anytime)

**Why this matters**: Simplifies mobile header since the page is linear and users can scroll.

**Files to touch**:
- `src/components/landing/LandingHeader.tsx` — simplify mobile rendering

**Functional Requirements**:
1. On mobile (< 768px):
   - Logo visible (left side)
   - "Get Started" button visible (right side)
   - "Log in" link hidden
   - "Features" and "How it works" links hidden (already hidden via `hidden md:flex`)
2. On desktop (≥ 768px):
   - All navigation elements visible (unchanged)

**Notes for implementer**:
- Current nav already uses `hidden md:flex` (line 41)
- The "Log in" link (lines 58-61) needs `hidden md:inline` added
- Quick change, mostly adding responsive classes

**Estimated Effort**: 30 minutes

**Acceptance Criteria**:
- [ ] On 375px viewport: only logo and "Get Started" button visible in header
- [ ] On 375px viewport: no "Log in" link visible
- [ ] On 1280px viewport: all header elements visible (unchanged)
- [ ] "Get Started" button navigates to `/auth`

**Required Tests**:
- Manual: Verify header at mobile and desktop viewports

---

### Phase 5: Integration Testing

---

#### TASK-7: End-to-End Flow Testing

**Summary**: Comprehensive testing of all user flows on real devices and browsers.

**Dependencies**: TASK-1 through TASK-5 complete

**Why this matters**: Ensures the redesign works correctly across all target platforms before production deployment.

**Files to touch**: None (testing only)

**Functional Requirements**:
1. Execute all UX Test Flows defined above (Flows 1-4)
2. Test on real iOS device (iPhone, iOS Safari)
3. Test on real Android device (Chrome)
4. Test on desktop browsers: Chrome, Firefox, Safari
5. Test keyboard visibility on mobile (Flow 4)
6. Test localStorage persistence (Flow 3)
7. Verify no console errors during flows
8. Verify page load time < 3 seconds on throttled 3G

**Notes for implementer**:
- Use BrowserStack or real devices for mobile testing
- Chrome DevTools can simulate slow 3G for performance testing
- Check Network tab for any failed requests

**Estimated Effort**: 2-3 hours

**Acceptance Criteria**:
- [ ] Flow 1 (Mobile Happy Path) passes on real iOS device (use BrowserStack)
- [ ] Flow 1 (Mobile Happy Path) passes on real Android device (use BrowserStack)
- [ ] Flow 2 (Desktop Happy Path) passes on Chrome, Firefox, Safari
- [ ] Flow 3 (Returning User) passes
- [ ] Flow 4 (iOS Keyboard) passes — input visible with keyboard open
- [ ] No JavaScript console errors during any flow
- [ ] Page load time < 3s on simulated slow 3G
- [ ] All visual elements render correctly (no layout breaks)

**Required Tests**:
- All manual tests defined in UX Test Flows section
- Performance: Lighthouse mobile Performance score > 85, Accessibility score > 90

---

## Glossary

| Term | Definition |
|------|------------|
| Above the fold | Content visible without scrolling on initial page load |
| Terminal chrome | Decorative UI elements that make the demo look like a terminal (traffic lights, scanlines, monospace text) |
| Chat bubble | Message UI pattern where messages appear in rounded containers, user on right, system on left |
| Touch target | Minimum tappable area for mobile (44px recommended by Apple HIG) |
| Demo exhausted | User has used all 3 free questions and must sign up for more |
| Viewport | The visible area of the browser window |
| `md:` breakpoint | Tailwind CSS breakpoint at 768px width (tablet/desktop) |

---

## Out of Scope

- Changes to the demo-chat Edge Function or backend
- Changes to the email capture flow
- A/B testing infrastructure
- Analytics implementation
- Changes to NumbersSection, SolutionSection, or CTASection
- Accessibility audit beyond basic contrast and touch targets
- Internationalization

---

## Open Questions

| Question | Status | Resolution |
|----------|--------|------------|
| Should we use JS media query or Tailwind classes for mobile detection? | RESOLVED | Use Tailwind responsive classes (`md:`) for styling; JS only if conditional component rendering needed |
| How to handle browser resize during demo interaction? | RESOLVED | UI adapts responsively, state preserved |

---

## Appendix: File Structure After Implementation

```
src/
├── components/
│   └── landing/
│       ├── InteractiveDemo.tsx       # Main orchestrator (~150-200 lines)
│       ├── demo/
│       │   ├── ChatMessage.tsx       # Message rendering (terminal/chat variants)
│       │   ├── ChatInput.tsx         # Input + suggestions
│       │   ├── ThinkingIndicator.tsx # Thinking animation (terminal/chat variants)
│       │   └── TerminalChrome.tsx    # Header + footer for desktop
│       ├── HeroSection.tsx           # Restructured for mobile
│       ├── LandingHeader.tsx         # Mobile cleanup (P2)
│       └── ... (other landing components unchanged)
├── pages/
│   ├── Auth.tsx                      # Dark theme, no tabs
│   └── Index.tsx                     # Unchanged
├── types/
│   └── demo.ts                       # Shared interfaces (Message, DemoState)
```

---

## Peer Review Summary

**Review Status**: Approved with revisions (incorporated above)

### Key Changes Made After Review:

1. **Referenced existing `useIsMobile()` hook** — Spec now explicitly uses `src/hooks/use-mobile.tsx` for conditional rendering instead of generic "useMediaQuery"

2. **Added hydration/flash acceptance criterion** — TASK-4 now requires "No visible layout shift when component mounts"

3. **Replaced arbitrary line count target** — TASK-1 now uses qualitative criterion "orchestration logic only" instead of "under 200 lines"

4. **Added viewport resize during streaming test** — TASK-4 acceptance criteria now includes resize behavior

5. **Added browser back/forward navigation test** — TASK-2 now tests email pre-fill with browser navigation

6. **Changed above-fold criterion** — TASK-3 now uses "within 80vh" instead of "600px from top"

7. **Added iOS safe area handling** — TASK-4 now specifies `env(safe-area-inset-bottom)` for input positioning

8. **Increased Lighthouse targets** — TASK-7 now requires Performance > 85, Accessibility > 90

9. **Added shared types file** — TASK-1 now specifies `src/types/demo.ts` for shared interfaces

### Deferred Recommendations (Consider for Future):

- Split TASK-1 into two smaller tasks if implementation proves complex
- Add Playwright e2e automation in follow-up task
- Consider feature flag for mobile chat UI rollback capability
- Add tablet breakpoint (768px-1024px) specification if needed
