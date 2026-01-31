# Rezzy Branding Refresh Plan

## Overview

This plan covers all updates needed to transform Rezzy from the current "hacker/neon" aesthetic to the new **Meadow** brand direction: playful, joyful, serene with rounded edges and wellness vibes.

**Key Brand Attributes:**
- Playful but professional
- Warm and nurturing
- Rounded, soft edges
- Sage green + coral accents
- Gabarito (display) + Lexend (body) typography

---

## Phase 1: Design Foundation

### 1.1 Tailwind Configuration (`tailwind.config.ts`)

**Changes:**
- [ ] Replace `rezzy` color palette with new Meadow colors
- [ ] Update font families to Gabarito + Lexend
- [ ] Add new animation keyframes (blobMorph, bounceDot, drawSquiggle)
- [ ] Update border-radius default to 24px
- [ ] Add spring-based easing functions

**New Color Palette:**
```
sage:        #4A9B8C (primary)
sage-light:  #6DB3A5
sage-lighter: #A8D4CA
sage-pale:   #E8F5F1

cream:       #FDF8F3 (background)
cream-warm:  #F5EBE0
cream-deep:  #E8DED3

coral:       #E8927C (accent)
coral-light: #F4B4A4
coral-pale:  #FDE8E4

ink:         #1A3A34 (text)
ink-soft:    #2D524A
ink-muted:   #5A7A72
ink-light:   #8CA39C
```

### 1.2 Global Styles (`src/index.css`)

**Changes:**
- [ ] Update CSS custom properties (`:root` and `.dark`)
- [ ] Replace gradient definitions with new warm gradients
- [ ] Update shadow utilities (softer, warmer tones)
- [ ] Update button classes with new colors + rounded corners
- [ ] Update input classes with new focus states
- [ ] Add new blob/organic shape utilities
- [ ] Update scrollbar styling
- [ ] Update selection colors

---

## Phase 2: Landing Page Components

### 2.1 LandingHeader (`src/components/landing/LandingHeader.tsx`)

**Visual Changes:**
- [ ] Replace square logo mark with animated blob logo
- [ ] Update nav link hover states (dot indicator instead of underline)
- [ ] Update button styles (rounded, new colors)
- [ ] Update scroll-state background (cream with blur)

**Copy Changes Required:** See Section 5.1

### 2.2 HeroSection (`src/components/landing/HeroSection.tsx`)

**Visual Changes:**
- [ ] Replace dark background with cream + floating blobs
- [ ] Update headline typography (Gabarito, larger)
- [ ] Add squiggly underline on highlighted word
- [ ] Update stats display styling
- [ ] Add social proof section with avatar stack
- [ ] Update demo card styling (rounded, shadows, glow effect)

**Copy Changes Required:** See Section 5.2

### 2.3 NumbersSection (`src/components/landing/NumbersSection.tsx`)

**Visual Changes:**
- [ ] Update background to dark (ink) with sage glow
- [ ] Update stat number typography (Gabarito, larger)
- [ ] Add count-up animation on scroll

**Copy Changes Required:** See Section 5.3

### 2.4 SolutionSection (`src/components/landing/SolutionSection.tsx`)

**Visual Changes:**
- [ ] Update to horizontal scrolling card layout
- [ ] Update feature cards (cream background, rounded, hover tilt)
- [ ] Add large feature numbers (01, 02, 03, 04)
- [ ] Update icon containers (white background, rounded)
- [ ] Remove demo preview panel (simplified layout)

**Copy Changes Required:** See Section 5.4

### 2.5 CTASection (`src/components/landing/CTASection.tsx`)

**Visual Changes:**
- [ ] Update background to cream with floating decorative blobs
- [ ] Update headline typography
- [ ] Update button styling
- [ ] Simplify footer (cleaner layout)

**Copy Changes Required:** See Section 5.5

### 2.6 InteractiveDemo (`src/components/landing/InteractiveDemo.tsx`)

**Visual Changes:**
- [ ] Update terminal chrome to rounded card style
- [ ] Replace terminal aesthetic with friendly chat UI
- [ ] Update message bubble styling (rounded, softer colors)
- [ ] Update input styling (pill-shaped, sage accent)
- [ ] Update typing indicator (bouncing dots)
- [ ] Update suggestion chips (rounded, hover states)

**Copy Changes Required:** See Section 5.6

### 2.7 Demo Sub-components

**Files:**
- [ ] `demo/ChatMessage.tsx` - Update message styling
- [ ] `demo/ChatInput.tsx` - Update input styling
- [ ] `demo/TerminalChrome.tsx` - Replace with card chrome
- [ ] `demo/ThinkingIndicator.tsx` - Update to bouncing dots

---

## Phase 3: Authentication & Onboarding

### 3.1 Auth Page (`src/pages/Auth.tsx`)

**Visual Changes:**
- [ ] Update background from dark to cream
- [ ] Update card styling (white, rounded, soft shadow)
- [ ] Update form input styling
- [ ] Update button colors (sage primary)
- [ ] Update link colors
- [ ] Add decorative blob elements

**Copy Changes Required:** See Section 5.7

### 3.2 Onboarding Page (`src/pages/Onboarding.tsx`)

**Visual Changes:**
- [ ] Update background and card styling
- [ ] Update step indicators
- [ ] Update form styling
- [ ] Update progress indicators

**Copy Changes Required:** See Section 5.8

---

## Phase 4: Main Application

### 4.1 Chat Interface (`src/components/chat/AdvancedChatInterface.tsx`)

**Visual Changes:**
- [ ] Update sidebar background (cream-warm)
- [ ] Update conversation list styling
- [ ] Update message bubbles (user: ink, assistant: sage-pale)
- [ ] Update input area styling
- [ ] Update header/toolbar styling
- [ ] Ensure dark mode still works with new palette

### 4.2 File Upload (`src/components/chat/FileUploadPanel.tsx`)

**Visual Changes:**
- [ ] Update button colors
- [ ] Update progress indicators
- [ ] Update file type badges

---

## Phase 5: Copy Changes (Requires Approval)

### 5.1 Header Navigation

**Current:** `REZZY` (logo text)
**Options:**
1. `Rezzy` (title case, friendlier)
2. `rezzy` (lowercase, casual)
3. `REZZY` (keep as-is, bold)

**Recommendation:** Option 1

---

### 5.2 Hero Section

#### Main Headline

**Current:** "Your unfair advantage in residency."

**Options:**
1. "The calm in your residency storm" (emotional, supportive)
2. "Your caring companion through residency" (warm, nurturing)
3. "Where great residents get even better" (aspirational, confident)

**Recommendation:** Option 1

#### Subheadline

**Current:** "Evidence-based answers in seconds. Learn while you work. Never miss a critical detail."

**Options:**
1. "Evidence-based answers that help you learn, not just look up. Because great doctors aren't born—they're supported."
2. "Clinical guidance in seconds. Learn the 'why' behind every answer. Feel confident, not overwhelmed."
3. "Instant answers. Lasting knowledge. The support you deserve during the hardest years of training."

**Recommendation:** Option 1

#### Eyebrow Badge

**Current:** "AI-POWERED CLINICAL ASSISTANT"

**Options:**
1. "AI Clinical Companion" (softer, friendlier)
2. "Your Clinical Copilot" (partnership feel)
3. "Smart Support for Residents" (benefit-focused)

**Recommendation:** Option 1

#### CTA Button

**Current:** "Get Started"

**Options:**
1. "Start for free" (low commitment)
2. "Try Rezzy free" (branded)
3. "Get started — it's free" (explicit)

**Recommendation:** Option 1

---

### 5.3 Stats Section

**Current Stats:**
- "2 min" / "avg. decision time"
- "47" / "patients / shift"
- "∞" / "knowledge access"

**Options:**
1. Keep current stats, update labels:
   - "2m" / "Average decision time"
   - "47" / "Patients per shift supported"
   - "24/7" / "Always there for you"

2. New stats focus:
   - "500+" / "Residents learning smarter"
   - "2 min" / "From question to confidence"
   - "24/7" / "Support that never sleeps"

3. Benefit-focused:
   - "10x" / "Faster than searching alone"
   - "100%" / "Evidence-based answers"
   - "24/7" / "Available every shift"

**Recommendation:** Option 1

---

### 5.4 Features Section

#### Section Header

**Current:** "CAPABILITIES" / "Built for the trenches."

**Options:**
1. "Why Rezzy" / "Built for the way you actually work"
2. "Features" / "Everything you need to feel confident"
3. "How it helps" / "Support designed for real shifts"

**Recommendation:** Option 1

#### Feature 1

**Current:** "Instant Answers" / "Evidence-based clinical guidance in seconds. No more hunting through UpToDate while your patient waits."

**Options:**
1. "Instant clarity" / "Evidence-based answers in seconds. No more hunting through UpToDate while your patient waits."
2. "Quick answers" / "Get the clinical guidance you need without the endless searching."
3. "Answers, fast" / "Evidence-based guidance when you need it, not after your patient leaves."

**Recommendation:** Option 1

#### Feature 2

**Current:** "Learn While You Work" / "Every answer comes with the 'why'. Turn clinical encounters into learning opportunities."

**Options:**
1. "Learn as you go" / "Every answer comes with the 'why'. Turn clinical encounters into lasting knowledge."
2. "Understand, don't just memorize" / "We explain the reasoning so you learn, not just look up."
3. "Knowledge that sticks" / "Every answer teaches you something. Build expertise with every patient."

**Recommendation:** Option 1

#### Feature 3

**Current:** "Never Miss Anything" / "Drug interactions, contraindications, red flags—Rezzy catches what you might overlook at 3am."

**Options:**
1. "Your safety net" / "Drug interactions, red flags, contraindications—Rezzy catches what you might miss at 3am."
2. "Nothing slips through" / "Drug interactions, contraindications, and red flags—caught before they become problems."
3. "Always watching out" / "We flag the things that matter when you're too tired to catch them yourself."

**Recommendation:** Option 1

#### Feature 4 (New)

**Current:** N/A

**Options:**
1. "Always available" / "24/7 access to clinical guidance. No judgment, no wait time, just answers when you need them."
2. "There when you need it" / "Middle of the night? Weekend shift? Rezzy's always ready to help."
3. "Round-the-clock support" / "Clinical guidance available every hour of every shift."

**Recommendation:** Option 1

---

### 5.5 CTA Section

#### Headline

**Current:** "Stop drowning. Start thriving."

**Options:**
1. "Ready to feel supported?" (warm, inviting)
2. "Start your calmer residency" (benefit-focused)
3. "Join residents who feel confident" (social proof)

**Recommendation:** Option 1

#### Subtext

**Current:** "Join residents who refuse to let information overload win."

**Options:**
1. "Join hundreds of residents who've found their calm in the chaos."
2. "Thousands of residents already feel more confident. You're next."
3. "The support you wish you had from day one. Start free today."

**Recommendation:** Option 1

---

### 5.6 Demo Component

#### Welcome Message

**Current:** "Welcome to Rezzy. Ask any clinical question to get started."

**Options:**
1. "Hi there! How can I help?" / "Try asking a clinical question"
2. "What can I look up for you?" / "Ask any clinical question"
3. "Ready when you are." / "Type a question to get started"

**Recommendation:** Option 1

#### Input Placeholder

**Current:** (varies by state)

**Options:**
1. "Ask any clinical question..."
2. "What do you need to know?"
3. "Type your question here..."

**Recommendation:** Option 1

---

### 5.7 Auth Page

#### Sign Up Heading

**Current:** "Unlock unlimited access"

**Options:**
1. "Create your account" (simple, clear)
2. "Join Rezzy" (branded)
3. "Get started for free" (benefit-focused)

**Recommendation:** Option 1

#### Sign In Heading

**Current:** "Welcome back"

**Options:**
1. "Welcome back" (keep as-is)
2. "Sign in to Rezzy" (clear)
3. "Good to see you again" (warm)

**Recommendation:** Option 1 (keep)

---

### 5.8 Onboarding Page

#### Main Heading

**Current:** "Welcome to Rezzy"

**Options:**
1. "Welcome to Rezzy" (keep as-is)
2. "Let's get you set up" (action-oriented)
3. "Welcome! Let's personalize your experience" (warm + clear)

**Recommendation:** Option 3

---

## Phase 6: Animation & Motion

### 6.1 New Animations to Add

- [ ] Blob morphing animation (logo, background shapes)
- [ ] Scroll-triggered fade-up reveals (Framer Motion)
- [ ] Staggered children animations for lists
- [ ] Count-up animation for stats
- [ ] Squiggly underline draw animation
- [ ] Spring-based hover effects (cards, buttons)
- [ ] Typing indicator bounce
- [ ] Demo card 3D tilt on hover

### 6.2 Animation Library

**Recommendation:** Add Framer Motion for:
- Scroll-triggered animations
- Page transitions
- Complex orchestrated sequences
- Spring physics

---

## Phase 7: Technical Setup

### 7.1 Font Installation

- [ ] Add Google Fonts link for Gabarito + Lexend to `index.html`
- [ ] Update Tailwind font-family configuration
- [ ] Add font-display: swap for performance

### 7.2 Dependencies

- [ ] Install `framer-motion` for advanced animations
- [ ] Consider `@react-spring/web` as alternative

### 7.3 Dark Mode

- [ ] Update dark mode color tokens
- [ ] Test all components in dark mode
- [ ] Ensure sufficient contrast ratios

---

## Implementation Order

1. **Foundation** (Phase 1) — Design tokens, no visual change yet
2. **Landing Page** (Phase 2) — Most visible, highest impact
3. **Auth/Onboarding** (Phase 3) — User first impressions
4. **Main App** (Phase 4) — Core experience
5. **Animations** (Phase 6) — Polish and delight
6. **Testing** — Cross-browser, responsive, dark mode

---

## Files Changed Summary

| Category | Files | Priority |
|----------|-------|----------|
| Config | 2 | P1 |
| Landing | 10 | P1 |
| Auth/Onboarding | 2 | P2 |
| Chat | 2 | P2 |
| Shared UI | ~10 (via tokens) | P3 |

**Total estimated files:** ~25-30

---

## Approved Decisions

### Copy (Approved)

| Section | Final Copy |
|---------|------------|
| **Logo Text** | "Rezzy" |
| **Eyebrow Badge** | "AI Clinical Companion" |
| **Hero Headline** | "Your residency superpower, always on call" |
| **Hero Subheadline** | "Clinical guidance in seconds. Learn the 'why' behind every answer. Feel confident, not overwhelmed." |
| **Features Header** | "Features" / "Everything you need to feel confident" |
| **CTA Headline** | "Ready to feel unstoppable?" |

### Technical (Approved)

- [x] Color palette: Meadow (sage/coral/cream/ink)
- [x] Typography: Gabarito (display) + Lexend (body)
- [x] Animation approach: Framer Motion
- [x] Implementation order: Tokens → Landing → Auth → App

---

## Next Steps

1. ~~Implement Phase 1 (design tokens)~~ ✅ DONE
2. Transform landing page components
3. Get feedback before continuing to auth/app

---

## Phase 2: Full App Implementation Plan

### Overview

With design tokens in place, this plan covers systematic implementation across all pages and components to ensure visual consistency.

### Implementation Order

```
1. Landing Page (highest visibility)
   ↓
2. Auth Pages (first user touchpoint)
   ↓
3. Onboarding (new user experience)
   ↓
4. Main Chat Interface (core product)
   ↓
5. Shared Components (polish)
```

---

### Step 1: Landing Page Components

**Files to update:**
| File | Changes | Priority |
|------|---------|----------|
| `LandingHeader.tsx` | Logo, nav colors, button styles, scroll bg | P1 |
| `HeroSection.tsx` | Background blobs, typography, copy, demo card | P1 |
| `InteractiveDemo.tsx` | Card styling, message bubbles, input | P1 |
| `demo/ChatMessage.tsx` | Bubble colors, typography | P1 |
| `demo/ChatInput.tsx` | Input styling, send button | P1 |
| `demo/TerminalChrome.tsx` | Replace terminal with card chrome | P1 |
| `demo/ThinkingIndicator.tsx` | Bouncing dots animation | P1 |
| `NumbersSection.tsx` | Dark section with sage glow, stat typography | P2 |
| `SolutionSection.tsx` | Horizontal scroll cards, feature styling | P2 |
| `CTASection.tsx` | CTA button, background, footer | P2 |

**Pattern to follow:**
- Replace `bg-rezzy-black` → `bg-rezzy-cream`
- Replace `text-rezzy-green` → `text-rezzy-sage`
- Replace `text-rezzy-white` → `text-rezzy-ink`
- Replace `border-rezzy-gray-dark` → `border-rezzy-cream-deep`
- Add `rounded-3xl` to cards (24px radius)
- Use `font-display` for headlines (Gabarito)
- Add floating blob backgrounds where appropriate

---

### Step 2: Authentication Pages

**File:** `src/pages/Auth.tsx`

**Changes:**
| Element | Before | After |
|---------|--------|-------|
| Page background | `bg-rezzy-black` | `bg-rezzy-cream` |
| Card | Dark with gray border | White with soft shadow, rounded-3xl |
| Form inputs | Dark bg, gray border | Cream bg, sage focus ring |
| Primary button | Green | Sage with coral hover glow |
| Links | Green text | Sage text |
| Error states | Red | Coral |
| Logo | Current | New robot logo (TBD) |

**Copy updates (approved):**
- Sign up heading: "Create your account"
- Sign in heading: "Welcome back" (keep)

---

### Step 3: Onboarding Page

**File:** `src/pages/Onboarding.tsx`

**Changes:**
| Element | Before | After |
|---------|--------|-------|
| Page background | Dark | Cream with subtle blobs |
| Progress indicator | Green dots | Sage dots with coral active |
| Cards | Dark | White with soft shadow |
| Form styling | Match Auth updates | Match Auth updates |
| Buttons | Green | Sage primary |

**Copy updates (approved):**
- Main heading: "Welcome! Let's personalize your experience"

---

### Step 4: Main Chat Interface

**File:** `src/components/chat/AdvancedChatInterface.tsx`

**Changes:**
| Element | Before | After |
|---------|--------|-------|
| Sidebar bg | Dark | `cream-warm` |
| Sidebar text | Gray/white | `ink`/`ink-muted` |
| Active conversation | Green highlight | Sage highlight |
| Chat area bg | Dark | `cream` |
| User message | Gray bubble | `ink` bubble (dark) |
| Assistant message | Dark bubble | `sage-pale` bubble |
| Input area | Dark | White with sage focus |
| Send button | Green | Sage |
| File upload | Green accents | Sage/coral accents |

**Additional polish:**
- Add subtle shadow to message bubbles
- Rounded-2xl on bubbles
- Typing indicator with bouncing sage dots
- Streaming text cursor in sage

---

### Step 5: Shared UI Components

Most shadcn/ui components auto-update via CSS variables, but verify:

| Component | Check |
|-----------|-------|
| `button.tsx` | Verify sage primary, coral hover |
| `input.tsx` | Verify sage focus ring |
| `card.tsx` | Verify rounded-3xl, soft shadow |
| `badge.tsx` | Verify success=sage, warning=coral |
| `toast.tsx` | Verify colors match |
| `dialog.tsx` | Verify overlay and card styling |
| `dropdown-menu.tsx` | Verify hover states |

---

### Step 6: Animation Implementation

**Add Framer Motion for:**
| Animation | Location | Type |
|-----------|----------|------|
| Scroll reveal | All sections | `useInView` + fade up |
| Staggered children | Feature cards, stats | Delay cascade |
| Hero entrance | Hero content | Orchestrated sequence |
| Demo card | Hero | Rotate in from angle |
| Floating blobs | Backgrounds | Parallax on scroll |
| Button hover | All buttons | Scale + shadow spring |
| Page transitions | Route changes | Fade + slide |

**Install:**
```bash
npm install framer-motion
```

---

### Step 7: Dark Mode Verification

After all changes, verify dark mode:
- [ ] Landing page readable
- [ ] Auth pages contrast OK
- [ ] Chat interface usable
- [ ] All text meets WCAG AA (4.5:1)

---

### Step 8: Responsive Testing

Test all pages at:
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1280px)
- [ ] Large (1440px+)

---

### Implementation Checklist

**Landing Page:**
- [ ] LandingHeader.tsx
- [ ] HeroSection.tsx
- [ ] InteractiveDemo.tsx
- [ ] demo/ChatMessage.tsx
- [ ] demo/ChatInput.tsx
- [ ] demo/TerminalChrome.tsx
- [ ] demo/ThinkingIndicator.tsx
- [ ] NumbersSection.tsx
- [ ] SolutionSection.tsx
- [ ] CTASection.tsx

**Auth & Onboarding:**
- [ ] Auth.tsx
- [ ] Onboarding.tsx

**Main App:**
- [ ] AdvancedChatInterface.tsx
- [ ] FileUploadPanel.tsx

**Polish:**
- [ ] Add Framer Motion
- [ ] Implement scroll animations
- [ ] Dark mode verification
- [ ] Responsive testing

---

### Estimated Scope

| Phase | Files | Complexity |
|-------|-------|------------|
| Landing | 10 | Medium |
| Auth/Onboarding | 2 | Low |
| Chat | 2 | Medium |
| Animations | 5-6 | Medium |
| **Total** | **~20** | **~4-6 hours** |

---

### Quality Gates

Before marking complete:
1. [ ] All pages use new color palette (no old green/black)
2. [ ] Typography is consistent (Gabarito headings, Lexend body)
3. [ ] Border radius is consistent (24px cards, 12px buttons)
4. [ ] Animations feel cohesive (spring easing throughout)
5. [ ] Dark mode works
6. [ ] Mobile responsive
7. [ ] No console errors
8. [ ] Approved copy implemented
