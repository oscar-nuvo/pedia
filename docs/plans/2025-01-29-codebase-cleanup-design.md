# Pedia Codebase Cleanup Plan

**Date:** 2025-01-29
**Goal:** Remove unnecessary complexity while preserving core functionality

## Overview

Strip the Pedia app down to its MVP: authentication, organizations, and AI chatbot. Remove scheduling, documentation, analytics, and other premature features.

## What We're Keeping

### Core Pages
- `/src/pages/Index.tsx` - Simplified landing (Header + Hero + CTA only)
- `/src/pages/Auth.tsx` - Sign in/sign up
- `/src/pages/Onboarding.tsx` - User & org setup (unchanged)
- `/src/pages/NotFound.tsx` - 404 page

### AI Copilot (Main Feature)
- `/src/hooks/useAdvancedAIChat.ts` - Chat logic with streaming
- `/src/components/chat/AdvancedChatInterface.tsx` - Chat UI
- `/src/components/chat/FileUploadPanel.tsx` - File uploads

### Auth & Infrastructure
- `/src/hooks/useAuth.tsx` - Authentication context
- `/src/components/ProtectedRoute.tsx` - Route protection
- `/src/components/ui/*` - All shadcn/ui components
- `/src/utils/*` - File upload utilities
- `/src/integrations/supabase/*` - Supabase client & types

### Landing Page Components (Keep)
- `Header.tsx`
- `HeroSection.tsx`
- `CTASection.tsx`

### Supabase (All Unchanged)
- All Edge Functions (4 functions)
- All database migrations
- All RLS policies

## What We're Removing

### Pages to Delete (6 files)
1. `/src/pages/Scheduling.tsx`
2. `/src/pages/Documentation.tsx`
3. `/src/pages/Analytics.tsx`
4. `/src/pages/AdminAgents.tsx`
5. `/src/pages/ParentPortal.tsx`
6. `/src/pages/Overview.tsx`

### Landing Page Components to Delete (11 files)
1. `StatsSection.tsx`
2. `ProblemSolutionSection.tsx`
3. `BenefitsSection.tsx`
4. `InteractiveDemoSection.tsx`
5. `FeatureShowcase.tsx`
6. `TestimonialsSection.tsx`
7. `ComparisonSection.tsx`
8. `ROICalculatorSection.tsx`
9. `TrustSecuritySection.tsx`
10. `FAQSection.tsx`
11. `Footer.tsx`

## Routing Changes

### Routes to Remove
- `/overview`
- `/scheduling`
- `/documentation`
- `/analytics`
- `/admin-agents`
- `/parent-portal`

### Routes to Keep
- `/` → Landing page (simplified)
- `/auth` → Sign in/sign up
- `/onboarding` → User setup
- `/ai-copilot` → Main chat interface
- `*` → 404

### Post-Login Redirect
- **Before:** Redirects to `/overview`
- **After:** Redirects to `/ai-copilot`

## Execution Steps

### Step 1: Update App.tsx Routing
- Remove route definitions for deleted pages
- Change post-login redirect from `/overview` to `/ai-copilot`
- Remove imports for deleted page components

### Step 2: Simplify Index.tsx (Landing Page)
- Remove imports for deleted landing sections
- Update JSX to only render: Header, HeroSection, CTASection
- Clean up any feature references in Hero/CTA copy if needed

### Step 3: Delete Page Files
Delete these 6 files:
- `src/pages/Scheduling.tsx`
- `src/pages/Documentation.tsx`
- `src/pages/Analytics.tsx`
- `src/pages/AdminAgents.tsx`
- `src/pages/ParentPortal.tsx`
- `src/pages/Overview.tsx`

### Step 4: Delete Landing Component Files
Delete these 11 files from `src/components/`:
- `StatsSection.tsx`
- `ProblemSolutionSection.tsx`
- `BenefitsSection.tsx`
- `InteractiveDemoSection.tsx`
- `FeatureShowcase.tsx`
- `TestimonialsSection.tsx`
- `ComparisonSection.tsx`
- `ROICalculatorSection.tsx`
- `TrustSecuritySection.tsx`
- `FAQSection.tsx`
- `Footer.tsx`

### Step 5: Clean Up Navigation
- Find and update any sidebar/nav components
- Remove links to deleted pages
- Ensure navigation only shows valid routes

### Step 6: Verification
- Run TypeScript compilation to catch missing imports
- Run the dev server and test:
  - Landing page loads
  - Auth flow works (sign up, sign in)
  - Onboarding flow works
  - Post-login redirects to AI Copilot
  - AI Copilot chat works
  - No console errors

## Success Criteria

1. App compiles without TypeScript errors
2. Landing page shows only Header, Hero, CTA
3. Auth flow completes and redirects to `/ai-copilot`
4. AI Copilot is fully functional (chat, file upload, conversations)
5. No broken links or 404s on valid routes
6. No console errors in browser

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Shared components used by deleted pages | Check imports before deleting |
| Navigation hardcoded in multiple places | Search codebase for route strings |
| Auth redirect in multiple locations | Search for `/overview` references |

## Out of Scope

- Database schema changes (tables remain, just unused)
- Edge Function changes (all preserved)
- UI component library changes (all shadcn/ui kept)
- Onboarding flow changes (kept as-is)
