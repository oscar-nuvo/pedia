# Landing Page Redesign: Demo-Centric Conversion Optimization

**Date:** 2026-01-30
**Goals:** Improve signup conversion, reduce time to value, mobile optimization

---

## Overview

Redesign the Rezzy landing page to make the interactive demo the centerpiece of the experience. Shift from "marketing page with demo" to "demo experience with supporting content."

### Key Metrics to Improve
- Signup conversion (demo users → accounts)
- Time to value (seconds until user asks first question)

---

## 1. Hero Section Restructure

### Current State
- Large stacked headline ("Your / unfair / advantage")
- Subheadline and stats in hero
- Demo appears alongside headline (desktop) or below (mobile)
- On mobile, demo is far below the fold

### New Design

```
┌─────────────────────────────────────────┐
│  Header: Logo ............. Get Started │
├─────────────────────────────────────────┤
│  AI-POWERED CLINICAL ASSISTANT          │  (eyebrow)
│                                         │
│  Your unfair advantage.                 │  (single line headline)
│                                         │
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │      INTERACTIVE DEMO               ││  (60%+ of viewport)
│  │      (chat interface)               ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  Evidence-based • HIPAA • Instant       │  (trust badges)
│                                         │
│  ↓ SCROLL                               │
└─────────────────────────────────────────┘
```

### Changes
- **Headline:** Single line "Your unfair advantage." (remove stacked layout)
- **Subheadline:** Moved below the fold
- **Stats row:** Moved below the fold
- **Demo:** Takes 60%+ of hero viewport
- **Mobile:** Headline shrinks to `text-2xl`/`text-3xl`, demo visible above fold

### Files to Modify
- `src/components/landing/HeroSection.tsx`

---

## 2. Demo Terminal → Chat UI

### Current State
- Terminal aesthetic with traffic lights, scanlines, monospace
- Fixed `min-h-[320px]`
- Suggestion chips below terminal
- Input inline within terminal content

### New Design: Chat-First Experience

```
┌──────────────────────────────────────────────┐
│  ┌────────────────────────────────────────┐  │
│  │  🟢 REZZY                              │  │
│  │  Ask me any clinical question.         │  │
│  └────────────────────────────────────────┘  │
│                                              │
│              (conversation bubbles)          │
│                                              │
│      ┌──────────────────────────────────┐   │
│      │ User message (right-aligned)     │   │
│      └──────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ Rezzy response (left-aligned)        │   │
│  └──────────────────────────────────────┘   │
│                                              │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  ↑  │
│  │ Ask a clinical question...         │     │
│  └────────────────────────────────────┘     │
├──────────────────────────────────────────────┤
│  try: amoxicillin dosing • fever workup     │  (muted, de-emphasized)
└──────────────────────────────────────────────┘
```

### Changes
- **Input anchored at bottom** (like iMessage/WhatsApp)
- **Messages as bubbles** (user right, Rezzy left)
- **Suggestion chips de-emphasized** — small muted text below input, tappable
- **Desktop:** Keep subtle terminal border/styling for brand differentiation
- **Mobile:** Pure chat UI — no traffic lights, no scanlines, no terminal chrome
- **Typing indicator:** Three dots animation when Rezzy is thinking
- **Dynamic height:** Remove fixed `min-h`, let content determine height

### Files to Modify
- `src/components/landing/InteractiveDemo.tsx`

---

## 3. Header Mobile Optimization

### Current State
- Nav links ("Features", "How it works") hidden on mobile via `hidden md:flex`
- No hamburger menu
- Only "Log in" and "Get Started" visible

### New Design
- **Mobile:** Logo + "Get Started" only (remove nav links entirely)
- **Desktop:** Unchanged
- **Rationale:** Page is linear, users can scroll. Nav adds no value on mobile.

### Files to Modify
- `src/components/landing/LandingHeader.tsx`

---

## 4. Below-the-Fold Content

### Current State
1. Numbers Section ("THE REALITY" — 47, 80, 2)
2. Solution Section (feature tabs)
3. CTA Section ("Stop drowning. Start thriving.")

### New Design

```
┌─────────────────────────────────────────────────┐
│  HERO (demo-centric)                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  "Evidence-based answers in seconds.            │
│   Learn while you work.                         │
│   Never miss a critical detail."                │
│                                                 │
│   2 min          47            80               │
│   avg decision   patients      hours/week       │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  FEATURES (3 tabs, simplified on mobile)        │
│  - Instant Answers                              │
│  - Learn While You Work                         │
│  - Never Miss Anything                          │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  "Ready to try it?"                             │
│  [GET STARTED FREE]                             │
│                                                 │
│  ✓ No credit card  ✓ 30 sec setup              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Changes
- **Merge Numbers + Subheadline** into a "breather" section after hero
- **Remove standalone Numbers section** — stats now inline with subheadline
- **CTA copy simplified** — "Ready to try it?" instead of "Stop drowning. Start thriving."
- **Mobile features:** Consider accordion or simplified layout

### Files to Modify
- `src/components/landing/NumbersSection.tsx` (remove or merge)
- `src/components/landing/SolutionSection.tsx` (simplify mobile)
- `src/components/landing/CTASection.tsx` (update copy)
- `src/pages/Index.tsx` (restructure sections)

---

## 5. Auth Page Redesign

### Current State
- Light background (`bg-bg-primary`)
- Centered card with tabs (Sign In / Sign Up)
- First/last name side-by-side on signup
- No visual continuity with landing page

### New Design: Dark Theme (Mobile + Desktop)

```
┌─────────────────────────────────────────┐
│                                         │  bg-rezzy-black
│  🟩 REZZY                               │
│                                         │
│  Unlock unlimited access                │  (heading, white text)
│  You asked 3 questions. Keep going.     │  (context, gray text)
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ First name                          ││  (dark input, white text)
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ Last name                           ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ email@example.com (pre-filled)      ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ Password                            ││
│  └─────────────────────────────────────┘│
│                                         │
│  [       CREATE ACCOUNT       ]         │  (bg-rezzy-green, black text)
│                                         │
│  Already have an account? Sign in       │  (link, gray text)
│                                         │
├─────────────────────────────────────────┤
│  ✓ No credit card  ✓ Cancel anytime    │  (trust badges)
└─────────────────────────────────────────┘
```

### Changes
- **Dark theme:** `bg-rezzy-black` background, matches landing page
- **Stack all fields:** Full-width inputs on mobile (no side-by-side)
- **Top-aligned:** Content starts from top, not vertically centered (avoids keyboard issues)
- **Context line:** "You asked 3 questions. Keep going." (from demo session)
- **Remove tabs:** Default to signup when coming from demo, show "Sign in" as link
- **Green CTA button:** `bg-rezzy-green text-rezzy-black`
- **Trust badges:** Footer with "No credit card", "Cancel anytime"
- **Input styling:** Dark inputs (`bg-rezzy-off-black border-rezzy-gray-dark`)

### Files to Modify
- `src/pages/Auth.tsx`

---

## Implementation Order

1. **Auth page dark theme** — Quick win, improves brand consistency
2. **Hero restructure** — Move subheadline/stats, single-line headline
3. **Demo chat UI** — Biggest change, highest impact
4. **Header mobile cleanup** — Simple change
5. **Below-fold content merge** — Cleanup and simplification

---

## Design Tokens Reference

```css
/* Colors */
rezzy-green: #39FF14
rezzy-black: #000000
rezzy-off-black: #0A0A0A
rezzy-dark: #111111
rezzy-white: #FFFFFF
rezzy-gray: #71717A
rezzy-gray-dark: #3F3F46
rezzy-gray-light: #A1A1AA

/* Typography */
Headlines: Space Grotesk Bold
Body: Space Grotesk Regular
Mono: JetBrains Mono
```

---

## Success Criteria

- [ ] Demo visible above fold on mobile (within 600px scroll)
- [ ] Time to first interaction reduced (track via analytics)
- [ ] Auth page matches landing page branding
- [ ] All form fields usable on mobile with keyboard open
- [ ] Signup conversion rate improves (measure after 2 weeks)
