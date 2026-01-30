# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PediatricAI** is an AI-powered medical decision support copilot for pediatric healthcare professionals. It combines a React frontend with Supabase Edge Functions and OpenAI's Responses API for streaming AI chat.

- **Frontend**: React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth, Storage)
- **AI**: OpenAI Responses API with streaming and function calling
- **Hosting**: Vercel (frontend), Supabase Cloud (backend)

## Development Commands

```bash
# Frontend
npm run dev              # Start dev server (localhost:8080)
npm run build            # Production build
npm run lint             # ESLint check

# Supabase Edge Functions
supabase functions serve                    # Local testing
supabase functions deploy <function-name>   # Deploy single function

# Database
supabase db push                            # Apply migrations
supabase gen types typescript > src/integrations/supabase/types.ts  # Regenerate types
```

## Environment Setup

Frontend `.env`:
```
VITE_SUPABASE_PROJECT_ID=pgypyipdmrhrutegapsx
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_URL=https://pgypyipdmrhrutegapsx.supabase.co
```

Edge Function secrets (configured in Supabase Dashboard → Settings → Secrets):
- `PediaAIKey` - OpenAI API key

## Architecture

### Request Flow (Chat)

```
User Input → AdvancedChatInterface → useAdvancedAIChat hook
    ↓
POST /functions/v1/pediatric-ai-chat (with JWT)
    ↓
Edge Function:
  1. Validate JWT
  2. Save user message to DB
  3. Trigger title generation (first message only)
  4. Fetch conversation history
  5. Call OpenAI Responses API (streaming)
  6. Re-stream SSE events to client
  7. Persist assistant message
    ↓
Client receives SSE stream:
  - text_delta → accumulate in streamingMessage
  - reasoning_delta → show thinking steps
  - function_result → display tool output
  - response_complete → invalidate React Query cache
```

### Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useAdvancedAIChat.ts` | Core chat logic: queries, mutations, streaming state, realtime subscriptions |
| `src/hooks/useAuth.tsx` | Auth context provider with Supabase session management |
| `src/components/chat/AdvancedChatInterface.tsx` | Main chat UI with sidebar, messages, input |
| `supabase/functions/pediatric-ai-chat/index.ts` | Main Edge Function: auth, OpenAI streaming, message persistence |
| `supabase/functions/generate-conversation-title/index.ts` | Auto-generates 4-word titles for new conversations |

### State Management

- **Server state**: React Query for conversations/messages with auto-refetch
- **Auth state**: React Context via `useAuth()`
- **UI state**: Local `useState` for streaming progress, input, etc.
- **Realtime**: Supabase subscriptions on `messages` table for live updates

### Database Schema

Core tables with RLS policies:
- `conversations` - user_id scoped, CASCADE delete to messages/files
- `messages` - role (user/assistant/system), content, response_id for idempotency
- `conversation_files` - openai_file_id, linked to conversations
- `profiles` - user metadata, created via trigger on auth.users
- `user_roles` - RBAC with roles: super_admin, admin, doctor, nurse, receptionist

### Edge Functions

| Function | JWT | Purpose |
|----------|-----|---------|
| `pediatric-ai-chat` | Required | Main chat handler with streaming |
| `generate-conversation-title` | No | Called internally for title generation |
| `upload-file-to-openai` | Required | File upload to OpenAI Files API |
| `delete-conversation-file` | Required | Delete files from OpenAI + DB |

### Function Calling (Tools)

The chat supports two medical tools:
- `calculate_pediatric_dosage` - Weight/age-based medication dosing with safety limits
- `analyze_growth_chart` - Pediatric growth percentile analysis

Tools are defined in `pediatric-ai-chat/index.ts` and executed server-side.

## Deployment

**Frontend** (auto-deploys on push):
- Production: `https://pedia-app.vercel.app`
- Staging: `https://staging.pedia-app.vercel.app`

**Edge Functions**:
```bash
supabase functions deploy pediatric-ai-chat
supabase functions deploy generate-conversation-title
supabase functions deploy upload-file-to-openai
supabase functions deploy delete-conversation-file
```

**CORS**: Update allowed origins in Edge Functions when adding new domains:
```typescript
const allowedOrigins = [
  'https://pedia-app.vercel.app',
  'https://staging.pedia-app.vercel.app',
  'http://localhost:8080',
];
```

## Message Persistence Pattern

Three-tier fallback ensures messages are always saved:
1. Edge Function saves during streaming (primary)
2. Client-side fallback after 3s timeout if no `response_saved` event
3. Secondary fallback on stream end if content exists but wasn't saved

Uses `response_id` field for idempotency to prevent duplicates.

## Routes

| Route | Component | Auth |
|-------|-----------|------|
| `/` | Index (landing) | Public |
| `/auth` | Auth (sign in/up) | Public |
| `/ai-copilot` | AdvancedChatInterface | Protected |
| `/overview` | Overview dashboard | Protected |
| `/scheduling` | Scheduling | Protected |
| `/documentation` | Documentation | Protected |
| `/analytics` | Analytics | Protected |
| `/admin-agents` | AdminAgents | Protected |

Protected routes use `ProtectedRoute` component which redirects to `/auth` if no session.
