# Rezzy Landing Page Design

**Date:** 2025-01-29
**Status:** Approved for implementation

## Overview

Complete redesign of the landing page for "Rezzy" — an AI co-pilot for medical residents (age 25-32). The design prioritizes bold visual identity, interactive product demonstration, and stark contrast.

## Brand Identity

### Name
**Rezzy** (renamed from PediatricAI)

### Color Palette

| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Rezzy Green | `#39FF14` | `--rezzy-green` | Primary accent, CTAs, highlights |
| Pure Black | `#000000` | `--black` | Primary background |
| Pure White | `#FFFFFF` | `--white` | Text on dark, section backgrounds |
| Off-Black | `#0A0A0A` | `--off-black` | Cards, subtle depth |
| Gray | `#71717A` | `--gray` | Secondary text, borders |

### Typography

| Use | Font | Weight | Notes |
|-----|------|--------|-------|
| Headlines | Space Grotesk | Bold (700) | Geometric, technical, confident |
| Body | Space Grotesk | Regular (400) | Clean, readable |
| Mono | JetBrains Mono | Regular | Medical terms, code, precision |

### Visual Style

- **Zero border-radius** on primary elements (sharp, precise)
- **2px borders** in Rezzy Green for interactive elements
- **High contrast only** — no subtle grays, no soft shadows
- **No gradients** — flat, confident color blocking
- **No glassmorphism** — dated, avoid

## Page Structure

### Section 1: Header
- **Background:** Black
- **Content:**
  - Left: "REZZY" wordmark in white, bold
  - Right: "Log in" link (white, neon green on hover)
- **Style:** Minimal, no nav clutter

### Section 2: Hero (Interactive)
- **Background:** Black
- **Content:**
  - Headline: "Your unfair advantage in residency." (massive, white)
  - Interactive input field with 2px neon green border
  - Placeholder: "Ask Rezzy anything..."
  - Suggestion text below: "Try: Amoxicillin dosing for 15kg child"
- **Behavior:**
  - User types a question, presses enter
  - Rezzy streams a response (uses existing AI chat backend)
  - After ONE response, overlay appears: "That was free. Sign up for unlimited access."
  - Overlay has signup/login buttons
- **Technical:** Calls existing `pediatric-ai-chat` edge function, limited to 1 query per session (localStorage flag)

### Section 3: The Numbers
- **Background:** Black
- **Content:**
  - Three massive stats in neon green (8xl font):
    - "47 patients" / "per shift"
    - "80 hour" / "weeks"
    - "2 minutes" / "to decide"
  - Punchline: "Rezzy helps you make the right decision in those 2 mins."
- **Style:** Numbers dominate, labels small, centered layout

### Section 4: Solution (Features)
- **Background:** White (contrast break)
- **Content:**
  - 3 tabs: "INSTANT ANSWERS" | "LEARN AS YOU WORK" | "NEVER MISS ANYTHING"
  - Each tab shows a mock UI interaction:
    - **Instant Answers:** Complex medical question → structured differential
    - **Learn As You Work:** Response with explanations + citations
    - **Never Miss:** Drug interaction caught, warning displayed
- **Style:** Sharp borders, monospace for medical terms, tab has neon green active state

### Section 5: CTA
- **Background:** Black
- **Content:**
  - Headline: "Stop drowning." (line 1) "Start thriving." (line 2)
  - Button: "GET STARTED FREE →" (neon green bg, black text, sharp edges)
  - Subtext: "No credit card. No bullshit."
- **Style:** Generous spacing, let it breathe

### Section 6: Social Proof (HIDDEN FOR NOW)
- Will add later when real testimonials available
- Placeholder structure: One large quote + row of mini-testimonials

## Files to Create/Modify

### New Files
- `src/components/landing/LandingHeader.tsx`
- `src/components/landing/HeroSection.tsx` (replace existing)
- `src/components/landing/NumbersSection.tsx`
- `src/components/landing/SolutionSection.tsx`
- `src/components/landing/CTASection.tsx` (replace existing)
- `src/components/landing/InteractiveDemo.tsx` (hero input + response)

### Modified Files
- `src/pages/Index.tsx` — new structure
- `src/index.css` — add Rezzy color variables
- `tailwind.config.ts` — add Rezzy colors, Space Grotesk font
- `src/components/Header.tsx` — rename to LandingHeader, simplify
- `index.html` — add Space Grotesk + JetBrains Mono font imports

### Deleted Files
- `src/components/HeroSection.tsx` (replaced)
- `src/components/CTASection.tsx` (replaced)

## Interactive Demo Logic

```typescript
// Pseudocode for hero interaction
const [hasUsedFreeQuery, setHasUsedFreeQuery] = useState(
  localStorage.getItem('rezzy_free_query_used') === 'true'
);

const handleSubmit = async (question: string) => {
  if (hasUsedFreeQuery) {
    showSignupOverlay();
    return;
  }

  // Stream response from AI
  const response = await streamFromAI(question);

  // Mark as used
  localStorage.setItem('rezzy_free_query_used', 'true');
  setHasUsedFreeQuery(true);

  // Show signup prompt after response completes
  setTimeout(() => showSignupOverlay(), 2000);
};
```

## Responsive Behavior

- **Desktop:** Full layout as designed
- **Tablet:** Stack hero content, reduce stat font sizes
- **Mobile:**
  - Single column throughout
  - Stats stack vertically
  - Feature tabs become accordion
  - Input field full-width

## Success Metrics

- Time to first interaction (should be <3 seconds)
- Free query usage rate
- Signup conversion from landing page
- Scroll depth through sections

## Implementation Order

1. Update tailwind config + CSS variables (colors, fonts)
2. Build LandingHeader
3. Build InteractiveDemo component
4. Build HeroSection with InteractiveDemo
5. Build NumbersSection
6. Build SolutionSection with tabs
7. Build CTASection
8. Assemble in Index.tsx
9. Test responsive behavior
10. Test interactive demo with real AI backend
