# PRD: Landing Page Demo-Centric Redesign

**Document Version**: 1.0
**Date**: 2026-01-30
**Author**: Product Team
**Status**: Draft - Pending Review

---

## 1. Executive Summary

### Problem Statement
Mobile users cannot see the interactive demo without significant scrolling, and the current terminal-style UI creates friction that delays the "aha moment" — when users ask their own clinical question and receive a correct answer.

### Proposed Solution
Redesign the landing page to make the interactive demo the centerpiece, adopting a familiar chat-based UI (similar to WhatsApp) that reduces cognitive load and puts the input field front and center. Apply consistent dark branding to the auth page to maintain visual continuity through signup.

### Business Impact
- **Faster time to value**: Users can interact with demo immediately on mobile
- **Higher signup conversion**: Familiar chat UX reduces friction; branded auth page maintains momentum
- **Better mobile experience**: 60%+ of B2C traffic is mobile; current design penalizes these users

### Timeline Estimate
**Medium (M)** — 1-2 weeks of engineering effort

### Key Risks
1. Chat UI may feel less "premium" than terminal aesthetic to some users
2. Restructuring hero may impact SEO (headline changes)
3. No baseline conversion data to measure improvement against

---

## 2. Problem Definition

### 2.1 Problem Statement
Medical residents visiting Rezzy on mobile devices must scroll significantly before reaching the interactive demo — the core value proposition. The terminal-style demo UI, while visually distinctive, creates unfamiliar interaction patterns that delay the moment when users experience Rezzy's value firsthand.

**Who**: Prospective users (medical residents age 25-32) visiting on mobile devices
**What**: Demo is below the fold; terminal UI is unfamiliar
**Why**: Delays time-to-value, reduces signup conversion

### 2.2 Evidence & Insights

**Quantitative Data**
- No conversion funnel data currently available (noted as gap)
- Mobile traffic typically 60%+ for B2C products in this demographic
- Current mobile hero requires ~800px scroll to reach demo

**Qualitative Insights**
- Chat interfaces (WhatsApp, iMessage) are universally familiar to target demographic
- Terminal aesthetic may signal "developer tool" rather than "clinical assistant"
- Email capture flow is working well (user confirmed — not changing)

**Competitive Analysis**
- ChatGPT, Claude, and other AI products use chat-based interfaces
- Medical professionals are time-constrained; familiar UX reduces learning curve

### 2.3 Cost of Inaction
- Mobile users continue to have degraded experience
- Potential users bounce before experiencing value
- Brand disconnect between landing page and auth page creates friction at conversion point

---

## 3. Solution Framework

### 3.1 High-Level Approach
Restructure the landing page hero to prioritize the interactive demo, adopting a chat-based UI that feels familiar to mobile users. Compress supporting content (headline, stats) to ensure demo visibility above the fold on mobile. Extend dark branding to the auth page to maintain visual continuity and reinforce premium feel through signup completion.

**Technical approach**: Modification of existing React components
**User-facing changes**: Hero layout, demo UI, auth page styling
**Backend changes**: None required

### 3.2 User Narratives

**Narrative 1: Happy Path (Mobile User)**
```
Persona: PGY-2 pediatric resident, using phone during shift break
Current State: Lands on page, sees headline, must scroll to find demo, terminal UI feels unfamiliar
Future State: Sees headline + demo immediately, recognizes chat interface, types question within 5 seconds
Value Delivered: Experiences Rezzy's value before deciding whether to scroll further
```

**Narrative 2: Desktop Power User**
```
Persona: Chief resident researching tools for the team
Current State: Demo visible but terminal aesthetic may seem niche
Future State: Clean chat UI feels professional; subtle terminal styling on desktop maintains brand differentiation
Value Delivered: Takes Rezzy seriously as a clinical tool, not a developer toy
```

**Narrative 3: Demo → Signup Flow**
```
Persona: Any user who completes 3 demo queries
Current State: Redirected to light-themed generic auth page; visual jarring
Future State: Dark-themed auth page matches landing; sees "You asked 3 questions. Keep going."
Value Delivered: Seamless transition maintains momentum; feels like continuing, not starting over
```

**Narrative 4: First-Time Mobile User (Edge Case)**
```
Persona: Resident who receives link from colleague, opens on phone
Current State: May not understand what Rezzy does without reading (headline is above demo)
Future State: Eyebrow + headline provide context; demo is immediately actionable
Value Delivered: Can try before committing to understanding
```

**Narrative 5: Error/Slow Connection**
```
Persona: User on hospital WiFi with spotty connection
Current State: Terminal UI may show loading states awkwardly
Future State: Chat UI has familiar "typing..." indicator; graceful loading states
Value Delivered: Understands system is working even if slow
```

---

## 4. Success Definition

### 4.1 Goals (Prioritized)

1. **Primary Goal**: Reduce time from page load to first demo interaction on mobile
2. **Secondary Goals**:
   - Increase demo-to-signup conversion rate
   - Maintain or improve desktop experience
3. **User Experience Goals**: Users should feel like they're messaging a knowledgeable colleague, not operating a complex tool

### 4.2 Non-Goals

| Excluded Item | Rationale |
|---------------|-----------|
| Changing email capture flow | User confirmed current flow works well |
| Adding mobile navigation | Page is linear; nav adds no value |
| Redesigning features section | Focus on hero + auth; features section is secondary |
| A/B testing framework | No baseline data; will measure before/after instead |
| Backend/API changes | Frontend-only optimization |

### 4.3 Success Metrics

**North Star Metric**
- **Metric**: Demo interaction rate (% of visitors who submit at least one question)
- **Current Baseline**: Unknown (to be measured before launch)
- **Target**: +20% relative improvement
- **Measurement Method**: Track `demo_question_submitted` event in analytics

**Secondary Metrics**
| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Demo → Signup conversion | Unknown | +15% relative | Track users from demo exhausted → account created |
| Mobile bounce rate | Unknown | -10% relative | Analytics |
| Time to first interaction | Unknown | <10 seconds | Track time from page load to first input focus |

**Guardrail Metrics**
| Metric | Acceptable Range | Alert Threshold | Action if Breached |
|--------|-----------------|-----------------|-------------------|
| Desktop conversion | No decrease | >5% decrease | Investigate desktop-specific issues |
| Page load time | <3s | >4s | Optimize assets |

### 4.4 Impact Sizing Model
```
Calculation Framework:
- Monthly landing page visitors: [To be measured]
- Current demo interaction rate: [To be measured]
- Expected improvement: 20% relative
- Current demo→signup rate: [To be measured]
- Expected improvement: 15% relative

Confidence Level: Medium (no baseline data)
Key Assumption: Mobile users are not interacting due to UX friction, not lack of interest
```

---

## 5. Solution Details

### 5.1 Feature Specifications

**Feature Priority Matrix**
| Priority | Feature | User Value | Eng Effort | Dependencies |
|----------|---------|------------|------------|--------------|
| P0 | Hero restructure (demo-centric) | High | M | None |
| P0 | Demo chat UI (mobile) | High | L | None |
| P0 | Auth page dark theme | Medium | S | None |
| P1 | Demo chat UI (desktop with subtle terminal) | Medium | M | Mobile chat UI |
| P1 | Below-fold content merge | Low | S | Hero restructure |
| P2 | Header mobile cleanup | Low | XS | None |

---

**Feature: Hero Restructure**

**User Story**: As a mobile user, I want to see the demo immediately so that I can try Rezzy without scrolling.

**Acceptance Criteria**:
- [ ] Headline displays as single line: "Your unfair advantage."
- [ ] Demo component is visible within 600px of page top on mobile (375px width)
- [ ] Eyebrow ("AI-POWERED CLINICAL ASSISTANT") remains above headline
- [ ] Subheadline and stats row are moved below the fold
- [ ] Desktop layout maintains visual balance (demo takes 60%+ of hero)
- [ ] Trust badges appear below demo component

**Technical Considerations**:
- Adjust Tailwind responsive classes in HeroSection.tsx
- May need to reduce headline font size on mobile (`text-2xl` vs `text-5xl`)
- Test on iPhone SE (smallest common viewport)

---

**Feature: Demo Chat UI**

**User Story**: As a user, I want the demo to feel like a familiar chat app so that I know how to use it immediately.

**Acceptance Criteria**:
- [ ] Input field anchored at bottom of demo component
- [ ] User messages display right-aligned in bubble style
- [ ] Rezzy messages display left-aligned in bubble style
- [ ] Suggestion chips appear below input — smaller size (`px-2 py-1`) but retain borders for tap affordance
- [ ] Typing indicator shows three animated dots when Rezzy is "thinking"
- [ ] Mobile: No terminal chrome (traffic lights, scanlines, "rezzy.terminal" header)
- [ ] Mobile: No blinking cursor animation (chat apps don't have this)
- [ ] Desktop: Full terminal aesthetic preserved (traffic lights, scanlines, blinking cursor)
- [ ] Touch targets meet 44px minimum height on mobile
- [ ] **iOS/Android keyboard test**: Input remains visible and usable when keyboard is open

**Technical Considerations**:
- **Pre-work**: Refactor InteractiveDemo.tsx into subcomponents before UI changes:
  - Extract `ChatMessage.tsx` (handles user/assistant/system/error rendering)
  - Extract `ChatInput.tsx` (input field + suggestion chips)
  - Extract `ThinkingIndicator.tsx`
- Responsive conditional rendering (mobile chat vs desktop terminal)
- Preserve all existing state management and API integration
- Test keyboard behavior on real iOS and Android devices (not just emulators)

---

**Feature: Auth Page Dark Theme**

**User Story**: As a user completing signup, I want visual continuity with the landing page so that the experience feels seamless.

**Acceptance Criteria**:
- [ ] Background uses `bg-rezzy-black`
- [ ] Form inputs use dark styling (`bg-rezzy-off-black`, `border-rezzy-gray-dark`, white text)
- [ ] CTA button uses `bg-rezzy-green text-rezzy-black`
- [ ] "REZZY" logo matches landing page styling
- [ ] Context line displays: "You asked 3 questions. Keep going." (when coming from demo)
- [ ] First/last name fields stack vertically on mobile (no side-by-side)
- [ ] Content is top-aligned, not vertically centered
- [ ] Tabs replaced with default signup view + "Already have an account? Sign in" link
- [ ] Clicking "Sign in" swaps to sign-in form in place (no page navigation)
- [ ] Sign-in form shows "Need an account? Sign up" link to swap back
- [ ] Trust badges at bottom: "No credit card • Cancel anytime"
- [ ] Works on both mobile and desktop

**Technical Considerations**:
- Refactor Auth.tsx styling
- Replace Tabs component with conditional rendering based on local state
- Ensure form remains accessible (contrast ratios)

---

### 5.2 User Flows

**Main User Flow: Mobile Demo Interaction**
```
1. Entry Point: User lands on rezzy.com on mobile device
2. Flow:
   - Screen: Hero with condensed headline + demo
   - User Action: Taps input field
   - System Response: Keyboard opens, suggestion chips visible
   - User Action: Types or taps suggestion chip
   - System Response: Shows user message bubble, asks for email
   - User Action: Enters email
   - System Response: Validates, shows typing indicator, streams response
   - User Action: Reads response, asks follow-up questions
   - System Response: After 3 queries, shows "Ready for unlimited?"
   - User Action: Taps to continue
   - System Response: Redirects to dark-themed auth page with email pre-filled
3. Success State: User creates account
4. Alternative Paths:
   - User scrolls before interacting → sees subheadline/stats, then features
   - User on desktop → sees chat UI with subtle terminal styling
```

### 5.3 Business Logic & Rules

**Core Business Rules**
```yaml
Demo Query Limit:
  Condition: User submits question
  Action: Decrement remaining queries (stored in localStorage)
  Exception: If email already has account, redirect to login

Chat UI Rendering:
  Condition: Viewport width < 768px (md breakpoint)
  Action: Render pure chat UI (no terminal chrome)
  Exception: None

Auth Page Context:
  Condition: URL contains ?email= parameter
  Action: Show signup form with pre-filled email and context line
  Exception: If user is already logged in, redirect to /ai-copilot
```

**Edge Cases**
| Scenario | Expected Behavior | Error Handling |
|----------|------------------|----------------|
| User resizes browser mid-interaction | UI adapts responsively | No data loss |
| User clears localStorage | Demo resets to 3 queries | Fresh start, no error |
| Very long AI response | Chat bubbles wrap and scroll | Auto-scroll to bottom |
| Network timeout during demo | Show error in chat bubble | "Something went wrong. Try again?" |
| User submits empty input | Ignore, no action | No error message needed |

---

## 6. Technical Considerations

### 6.1 Constraints & Requirements

**Performance Requirements**
- Page load time: <3 seconds on 3G
- Demo must be interactive within 2 seconds of page load
- Chat UI animations: 60fps

**Platform Requirements**
- Mobile: iOS Safari, Chrome; Android Chrome
- Desktop: Chrome, Firefox, Safari, Edge
- Minimum viewport: 320px width (iPhone SE)

**Accessibility Requirements**
- Touch targets: 44px minimum
- Color contrast: WCAG AA compliance
- Keyboard navigation: Full support
- Screen reader: Input labels and ARIA attributes

### 6.2 Dependencies & Integrations

| System/Team | Integration Type | Critical Path | Risk Level |
|------------|------------------|---------------|------------|
| Supabase Edge Functions | API (unchanged) | No | Low |
| OpenAI API | API (unchanged) | No | Low |
| Tailwind CSS | Styling | Yes | Low |
| React Router | Navigation | Yes | Low |

### 6.3 Data Requirements

- **No new data collection** — existing demo_leads table sufficient
- **localStorage usage** — unchanged (demo session persistence)
- **Analytics events** — may need to add tracking (future consideration)

---

## 7. Launch Strategy

### 7.1 Release Phases

| Phase | Scope | Duration | Success Criteria | Rollback Plan |
|-------|-------|----------|-----------------|---------------|
| Dev | Internal testing | 3-5 days | All acceptance criteria pass | N/A |
| Staging | Team review | 1-2 days | No critical bugs | N/A |
| Production | Full rollout | Immediate | No errors in logs | Git revert |

### 7.2 Experimentation Plan
- **No A/B test** — insufficient baseline data
- **Before/After measurement**: Capture 1 week of metrics before launch, compare to 2 weeks after
- **Decision framework**: If demo interaction rate increases without desktop regression, success

### 7.3 Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy | Owner |
|------|------------|--------|-------------------|-------|
| Chat UI feels less premium | Medium | Medium | Keep subtle terminal styling on desktop | Design |
| Mobile keyboard covers input | Low | High | Top-align auth content; test thoroughly | Engineering |
| No baseline metrics | High | Medium | Measure before launch; accept directional data | Product |
| Increased page complexity | Low | Low | Component-level testing | Engineering |

---

## 8. Timeline & Milestones

### 8.1 Key Milestones

| Milestone | Target Date | Definition of Done | Dependencies |
|-----------|------------|-------------------|--------------|
| Baseline metrics captured | Before dev starts | 1 week of analytics data | Analytics setup |
| InteractiveDemo refactor | Day 1 | Subcomponents extracted (ChatMessage, ChatInput, ThinkingIndicator) | None |
| Auth page dark theme | Day 1-2 | Acceptance criteria pass | None |
| Hero restructure | Day 2-3 | Demo visible above fold on mobile | None |
| Demo chat UI (mobile) | Day 3-5 | Mobile chat UI criteria pass | InteractiveDemo refactor |
| Demo terminal UI (desktop) | Day 5-6 | Desktop terminal criteria pass | InteractiveDemo refactor |
| Real device testing | Day 6-7 | Tested on iOS Safari, Android Chrome | Demo UI complete |
| Integration testing | Day 7-8 | Full flow works on mobile + desktop | All features |
| Production deploy | Day 9-10 | Live on rezzy.com | Testing complete |

### 8.2 Critical Path Items
- **Demo chat UI**: Largest engineering effort, highest user impact
- **Mobile testing**: Must verify on real devices, not just browser emulation

---

## 9. Appendices

### 9.1 Open Questions

| Question | Owner | Needed By | Status |
|----------|-------|-----------|--------|
| Do we have analytics set up to measure baseline? | Engineering | Before dev starts | **OPEN** - Cannot measure success if unresolved |
| Should desktop keep full terminal aesthetic or adopt chat UI? | Product | Day 1 | **RESOLVED** - Desktop keeps terminal, mobile gets chat UI |
| Do we want to track scroll depth? | Product | Post-launch | **DEFERRED** - Revisit post-launch if conversion doesn't improve |

### 9.2 References
- Design document: `docs/plans/2026-01-30-landing-page-redesign.md`
- Current landing page: `src/pages/Index.tsx`
- Demo component: `src/components/landing/InteractiveDemo.tsx`
- Auth page: `src/pages/Auth.tsx`

### 9.3 Approval & Sign-offs

| Stakeholder | Role | Date | Comments |
|------------|------|------|----------|
| [Pending] | Product | | |
| [Pending] | Engineering | | |
| [Pending] | Design | | |

---

## Appendix A: Visual Reference

### Hero Layout (Mobile)
```
┌─────────────────────────────────┐
│ Logo            [Get Started]  │  ← Header (60px)
├─────────────────────────────────┤
│ AI-POWERED CLINICAL ASSISTANT  │  ← Eyebrow
│                                │
│ Your unfair advantage.         │  ← Headline (single line)
│                                │
│ ┌─────────────────────────────┐│
│ │     CHAT DEMO               ││  ← Demo (60%+ of viewport)
│ │                             ││
│ │  [Rezzy bubble]             ││
│ │                             ││
│ │           [User bubble]     ││
│ │                             ││
│ │ ┌─────────────────────────┐ ││
│ │ │ Type a question...      │ ││  ← Input at bottom
│ │ └─────────────────────────┘ ││
│ │ try: dosing • fever • rash  ││  ← Muted suggestions
│ └─────────────────────────────┘│
│                                │
│ Evidence-based • HIPAA         │  ← Trust badges
└─────────────────────────────────┘
```

### Auth Page (Dark Theme)
```
┌─────────────────────────────────┐
│                                │  bg-rezzy-black
│  🟩 REZZY                      │
│                                │
│  Unlock unlimited access       │
│  You asked 3 questions.        │
│  Keep going.                   │
│                                │
│  ┌─────────────────────────┐   │
│  │ First name              │   │  ← Stacked on mobile
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Last name               │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ email@example.com       │   │  ← Pre-filled
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Password                │   │
│  └─────────────────────────┘   │
│                                │
│  [    CREATE ACCOUNT    ]      │  ← Green button
│                                │
│  Already have an account?      │
│  Sign in                       │
│                                │
│  ✓ No credit card              │
│  ✓ Cancel anytime              │
└─────────────────────────────────┘
```
