# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PediatricAI** is an AI-powered medical decision support copilot for pediatric healthcare professionals. It combines a React frontend with Supabase Edge Functions and OpenAI's Responses API for streaming AI chat.

- **Frontend**: React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **AI**: OpenAI Responses API with streaming and function calling
- **Hosting**: Lovable/Vercel (frontend), Supabase Cloud (backend)

## Quick Reference

| Environment | Frontend URL | Supabase |
|-------------|--------------|----------|
| **Production** | https://pedia.lovable.app | https://pgypyipdmrhrutegapsx.supabase.co |
| **Local** | http://localhost:8080 | http://127.0.0.1:54321 |

| Dashboard | URL |
|-----------|-----|
| Lovable Project | https://lovable.dev/projects/5bf57cae-3c73-4f4f-8263-66c12171b4b0 |
| Supabase Dashboard | https://supabase.com/dashboard/project/pgypyipdmrhrutegapsx |
| GitHub Repo | https://github.com/oscar-nuvo/pedia |

---

## Local Development Setup

### Prerequisites

- Node.js 18+ (install via `nvm`)
- Docker Desktop (for local Supabase)
- Supabase CLI (`brew install supabase/tap/supabase`)

### Step 1: Start Docker

Ensure Docker Desktop is running before starting local Supabase.

### Step 2: Start Local Supabase

```bash
# Start local Supabase (PostgreSQL, Auth, Edge Functions runtime)
supabase start

# This outputs local URLs and keys:
# API URL: http://127.0.0.1:54321
# anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Step 3: Configure Environment

Create/verify `.env.local` for local development (overrides `.env`):

```bash
# .env.local - Local Supabase configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

The production `.env` file contains cloud Supabase credentials:
```bash
# .env - Production Supabase configuration
VITE_SUPABASE_PROJECT_ID=pgypyipdmrhrutegapsx
VITE_SUPABASE_PUBLISHABLE_KEY=<production-anon-key>
VITE_SUPABASE_URL=https://pgypyipdmrhrutegapsx.supabase.co
```

### Step 4: Configure Edge Function Secrets

Create `supabase/.env.local` with your OpenAI API key:

```bash
# supabase/.env.local - Edge Function secrets for local development
PediaAIKey=sk-proj-your-openai-api-key-here
```

### Step 5: Start Edge Functions

```bash
# In a separate terminal
supabase functions serve
```

This serves all Edge Functions locally at `http://127.0.0.1:54321/functions/v1/`

### Step 6: Create a Test User

```bash
# Create a test user via Supabase Auth API
curl -X POST 'http://127.0.0.1:54321/auth/v1/signup' \
  -H 'Content-Type: application/json' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  -d '{"email":"test@example.com","password":"testpassword123"}'
```

### Step 7: Start Frontend

```bash
npm install
npm run dev
```

Frontend runs at http://localhost:8080

### Local Testing Checklist

1. ✅ Docker running
2. ✅ `supabase start` completed
3. ✅ `.env.local` points to local Supabase (127.0.0.1:54321)
4. ✅ `supabase/.env.local` has `PediaAIKey`
5. ✅ `supabase functions serve` running
6. ✅ Test user created
7. ✅ `npm run dev` running

### Test Flows

1. **Login**: Sign in with test@example.com / testpassword123
2. **Text message**: Send a message without attachments → AI should respond
3. **Image upload**: Attach a PNG/JPG → AI should analyze it
4. **PDF upload**: Attach a PDF → AI should extract and analyze content

---

## Development Commands

```bash
# Frontend
npm run dev              # Start dev server (localhost:8080)
npm run build            # Production build
npm run lint             # ESLint check
npm run test:run         # Run tests once
npm run test             # Run tests in watch mode

# Supabase (Local)
supabase start           # Start local Supabase (requires Docker)
supabase stop            # Stop local Supabase
supabase functions serve # Serve Edge Functions locally
supabase db reset        # Reset local database

# Supabase (Production) - requires `supabase login` first
supabase link --project-ref pgypyipdmrhrutegapsx
supabase functions deploy <function-name>
supabase db push         # Apply migrations to production
```

---

## Production Deployment

### Frontend Deployment (via Lovable)

The frontend is deployed automatically when changes are pushed to GitHub, but requires manual publish:

1. Push changes to `main` branch on GitHub
2. Go to https://lovable.dev/projects/5bf57cae-3c73-4f4f-8263-66c12171b4b0
3. Click **Share → Publish** to deploy

### Edge Functions Deployment (via Supabase CLI)

```bash
# 1. Login to Supabase (one-time, use oscar.oliva@nuvocargo.com account)
supabase login

# 2. Link to production project
supabase link --project-ref pgypyipdmrhrutegapsx

# 3. Deploy Edge Functions
supabase functions deploy pediatric-ai-chat
supabase functions deploy generate-conversation-title
supabase functions deploy upload-file-to-openai
supabase functions deploy delete-conversation-file
```

### Deployment Checklist

- [ ] Code committed and pushed to GitHub (`git push origin main`)
- [ ] Edge Functions deployed (`supabase functions deploy <name>`)
- [ ] Lovable publish triggered (Share → Publish)
- [ ] Test on https://pedia.lovable.app

### CORS Configuration

When adding new frontend domains, update the `allowedOrigins` array in ALL Edge Functions:

```typescript
const allowedOrigins = [
  'https://pedia.lovable.app',      // Production (Lovable)
  'https://pedia-app.vercel.app',   // Production (Vercel)
  'https://staging.pedia-app.vercel.app', // Staging
  'http://localhost:3000',          // Local dev
  'http://localhost:5173',          // Vite dev server
  'http://localhost:8080',          // Vite dev server (configured port)
];
```

Files to update:
- `supabase/functions/pediatric-ai-chat/index.ts`
- `supabase/functions/upload-file-to-openai/index.ts`
- `supabase/functions/delete-conversation-file/index.ts`

---

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

### File Upload Flow

```
User selects file → Client validates type/size
    ↓
POST /functions/v1/upload-file-to-openai (with JWT + FormData)
    ↓
Edge Function:
  1. Validate JWT & file ownership
  2. Server-side file validation
  3. Upload to OpenAI Files API
  4. Save metadata to conversation_files table
  5. Return OpenAI file_id
    ↓
Client stores file_id → Sends with next message
    ↓
Chat Edge Function includes file in OpenAI request:
  - Images: input_image content block
  - PDFs: input_file content block
```

### Supported File Types

| Type | Extensions | OpenAI Content Type |
|------|------------|---------------------|
| Images | .jpg, .jpeg, .png, .gif, .webp | `input_image` |
| Documents | .pdf | `input_file` |

**Not supported**: .doc, .docx, .txt, .csv (OpenAI limitation)

### Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useAdvancedAIChat.ts` | Core chat logic: queries, mutations, streaming, file upload |
| `src/hooks/useAuth.tsx` | Auth context provider with Supabase session management |
| `src/components/chat/AdvancedChatInterface.tsx` | Main chat UI with sidebar, messages, input |
| `src/utils/fileUpload.ts` | File validation and upload utilities |
| `supabase/functions/pediatric-ai-chat/index.ts` | Main Edge Function: auth, OpenAI streaming, message persistence |
| `supabase/functions/upload-file-to-openai/index.ts` | File upload to OpenAI Files API |
| `supabase/functions/delete-conversation-file/index.ts` | Delete files from OpenAI + DB |
| `supabase/functions/generate-conversation-title/index.ts` | Auto-generates titles for new conversations |

### State Management

- **Server state**: React Query for conversations/messages with auto-refetch
- **Auth state**: React Context via `useAuth()`
- **UI state**: Local `useState` for streaming progress, input, etc.
- **Realtime**: Supabase subscriptions on `messages` table for live updates

### Database Schema

Core tables with RLS policies:
- `conversations` - user_id scoped, CASCADE delete to messages/files
- `messages` - role (user/assistant/system), content, response_id for idempotency
- `conversation_files` - openai_file_id, filename, content_type, linked to conversations
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

---

## Environment Variables

### Frontend (.env / .env.local)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID (optional) |

### Edge Functions (Supabase Secrets)

Configure in Supabase Dashboard → Settings → Secrets:

| Secret | Description |
|--------|-------------|
| `PediaAIKey` | OpenAI API key |
| `SUPABASE_URL` | Auto-configured |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-configured |
| `SUPABASE_ANON_KEY` | Auto-configured |

For local development, create `supabase/.env.local`:
```
PediaAIKey=sk-proj-your-key-here
```

---

## Message Persistence Pattern

Three-tier fallback ensures messages are always saved:
1. Edge Function saves during streaming (primary)
2. Client-side fallback after 3s timeout if no `response_saved` event
3. Secondary fallback on stream end if content exists but wasn't saved

Uses `response_id` field for idempotency to prevent duplicates.

---

## Routes

| Route | Component | Auth |
|-------|-----------|------|
| `/` | Index (landing) | Public |
| `/auth` | Auth (sign in/up) | Public |
| `/onboarding` | Onboarding | Public (pre-auth) |
| `/ai-copilot` | AdvancedChatInterface | Protected |

Protected routes use `ProtectedRoute` component which redirects to `/auth` if no session.

After successful login/onboarding, users are redirected to `/ai-copilot`.

---

## Troubleshooting

### CORS Errors
- Check that the frontend origin is in the `allowedOrigins` array in ALL Edge Functions
- Redeploy Edge Functions after updating CORS

### File Upload Fails
- Check file type (only PDF and images supported)
- Check file size (max 20MB)
- Verify `PediaAIKey` is set in Supabase Secrets
- Check Edge Function logs: https://supabase.com/dashboard/project/pgypyipdmrhrutegapsx/logs/edge-logs

### Local Supabase Issues
- Ensure Docker is running
- Run `supabase stop` then `supabase start` to reset
- Check `supabase/.env.local` has valid OpenAI key

### Auth Issues
- Clear browser localStorage
- Check Supabase Auth logs in dashboard
- Verify `.env.local` points to correct Supabase instance
