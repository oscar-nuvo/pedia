# PediatricAI Documentation Files

This directory contains comprehensive documentation for the PediatricAI codebase to help Claude Code instances (and developers) understand the project quickly.

## Files Created

### 1. **CLAUDE.md** (34 KB, 1,027 lines)
**The primary resource for understanding PediatricAI**

A comprehensive guide covering:

- **Project Overview** - What PediatricAI is and the tech stack
- **Development Commands** - How to run, build, test, and deploy
- **Project Structure** - File organization and purpose of each directory
- **High-Level Architecture** - Diagrams and descriptions of:
  - Frontend architecture (React + Vite)
  - Backend architecture (Supabase + Edge Functions)
  - Data flow for chat messages
  
- **Key Architectural Patterns** (6 patterns explained in detail):
  1. Authentication & Authorization (Supabase Auth + JWT)
  2. State Management (React Query + Context + Local State)
  3. Streaming & Real-Time Updates (SSE + Event Processing)
  4. Function Calling (Tool Use with Medical Tools)
  5. Database Schema & RLS (Row-Level Security)
  6. Error Handling & Resilience (Three-tier Fallback)

- **Critical Workflows** (4 workflows detailed):
  1. User Authentication Flow
  2. Chat Message Streaming (full lifecycle)
  3. Conversation Title Generation (fire-and-forget)
  4. Conversation Deletion

- **Database Schema Summary** - Table definitions with purpose
- **Edge Functions Deployment** - How the two serverless functions work
- **Technology Stack** - All dependencies and versions
- **Configuration Files** - What each config file does
- **Security & RLS Patterns** - Authentication, authorization, data protection
- **Common Tasks** - How to add features, deploy, debug
- **Debugging Tips** - Frontend, Edge Function, Database debugging
- **Future Considerations** - Scalability, features, performance, security

### 2. **ANALYSIS_SUMMARY.txt** (11 KB)
**Quick reference and condensed version of key findings**

Contains:
- 10 key findings with highlights
- Architectural insights (strengths, scalability, security)
- Quick reference commands
- Technology versions
- Main files to understand
- Environment setup
- Overall conclusion

### 3. **README_DOCUMENTATION.md** (this file)
**Navigation guide for the documentation**

---

## How to Use This Documentation

### For New Features
1. Start with CLAUDE.md "Key Architectural Patterns" section
2. Find the relevant workflow in "Critical Workflows"
3. Check "Database Schema Summary" if you need to modify tables
4. See "Common Tasks" for step-by-step instructions

### For Debugging
1. Go to CLAUDE.md "Debugging Tips" section
2. Choose frontend, edge function, or database debugging
3. Check specific console.log examples
4. Refer to error handling patterns if needed

### For Deployment
1. See CLAUDE.md "Development Commands" section
2. Follow steps in "Deploy to Production" under "Common Tasks"
3. Check edge function environment variables
4. Verify database migrations were applied

### For Understanding Message Flow
1. Read CLAUDE.md "Data Flow: Chat Message" section (visual diagram)
2. Deep dive into "Workflow 2: Chat Message Streaming" 
3. Understand "Three-tier Fallback" pattern for resilience
4. Check "Function Calling" pattern if using tools

### For Security Questions
1. Refer to CLAUDE.md "Security & RLS Patterns" section
2. Review database RLS policies
3. Check authentication flow in "Workflow 1"
4. See ANALYSIS_SUMMARY.txt "Security Considerations"

---

## Key Concepts Quick Reference

### Streaming Architecture
- Real-time AI responses via Server-Sent Events (SSE)
- Three-tier persistence: Edge Function → 3s timeout → stream end
- Idempotency via response_id field prevents duplicates

### State Management
- **Server State**: React Query (conversations, messages)
- **UI State**: useState (streaming text, reasoning, functions)  
- **Realtime**: Postgres change subscriptions
- **Auth**: Context API

### Authentication
- Email/password via Supabase Auth
- JWT in localStorage with auto-refresh
- Protected routes check user context
- Edge Functions validate JWT header

### Database Tables
- `conversations` - Chat sessions (user-isolated via RLS)
- `messages` - Chat history with response_id idempotency
- `conversation_files` - File uploads
- `profiles`, `organizations`, `user_roles` - User management

### Edge Functions
- `pediatric-ai-chat` - Main AI handler (609 lines)
- `generate-conversation-title` - Auto-title generation (184 lines)

### Medical Tools
- `calculate_pediatric_dosage` - Weight-based med calculations with safety checks
- `analyze_growth_chart` - Percentile analysis with percentile estimation

---

## Common Workflows at a Glance

### User Signs In
Auth.tsx → useAuth.signIn() → Supabase Auth → JWT stored → Redirects to /ai-copilot

### User Sends Chat Message  
Input → handleSendMessage() → POST /functions/v1/pediatric-ai-chat → OpenAI streaming → SSE to client → React UI updates → DB persistence with fallback

### First Message Received
Edge Function detects first message → Invokes generate-conversation-title → Polls OpenAI → Updates conversations.title → Frontend sees update via realtime

### User Deletes Conversation
Click trash → Confirm dialog → DELETE from conversations → Cascade delete messages/files → Cache invalidated → Chat resets

---

## Important File Locations

```
Main Chat State & Logic:
  /src/hooks/useAdvancedAIChat.ts (873 lines)

Chat UI Component:
  /src/components/chat/AdvancedChatInterface.tsx

Authentication Hook:
  /src/hooks/useAuth.tsx

Main Edge Function:
  /supabase/functions/pediatric-ai-chat/index.ts (609 lines)

Title Generation:
  /supabase/functions/generate-conversation-title/index.ts (184 lines)

Database Migrations:
  /supabase/migrations/ (multiple .sql files)

Type Definitions:
  /src/integrations/supabase/types.ts (auto-generated)
```

---

## Development Commands Cheat Sheet

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Development build
npm run build:dev

# Preview production build
npm run preview

# Lint code
npm run lint

# Deploy edge function
supabase functions deploy pediatric-ai-chat --project-id pgypyipdmrhrutegapsx

# Test edge functions locally
supabase functions serve

# Push database migrations
supabase db push --project-id pgypyipdmrhrutegapsx
```

---

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_PROJECT_ID=pgypyipdmrhrutegapsx
VITE_SUPABASE_PUBLISHABLE_KEY=<JWT_KEY>
VITE_SUPABASE_URL=https://pgypyipdmrhrutegapsx.supabase.co
```

### Edge Functions (Supabase Dashboard)
```
PediaAIKey=<OPENAI_API_KEY>
SUPABASE_URL=<SUPABASE_URL>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```

---

## Quick Problem Solving

### "Chat message not saving"
→ Check three-tier fallback in useAdvancedAIChat.ts lines 351-447
→ Verify response_id is being tracked
→ Check Edge Function logs in Supabase dashboard

### "Title not generating"
→ Check if conversation is first message (userMessageCount === 1)
→ Verify generate-conversation-title Edge Function is deployed
→ Check OpenAI API key is set in Supabase environment

### "User can see other users' conversations"
→ Check RLS policies on conversations table
→ Verify user_id is auth.uid() in SELECT WHERE clause
→ Restart Supabase to apply policy changes

### "Realtime not updating"
→ Verify REPLICA IDENTITY FULL on messages table
→ Check supabase_realtime publication includes messages table
→ Confirm subscription uses correct channel name

### "File upload failing"
→ Check file size limits in uploadFiles()
→ Verify Supabase storage bucket "documents" exists
→ Check user has storage permissions (RLS)

---

## For Future Claude Code Instances

This documentation was created to help future AI assistants be productive immediately without:
- Exploring the entire codebase structure
- Reverse-engineering data flows
- Discovering patterns through trial and error
- Re-reading the same files multiple times

Simply reference CLAUDE.md's relevant section and implement with confidence.

---

**Last Updated**: 2025-10-25
**Repository**: https://github.com/oscar-nuvo/pedia.git
**Project**: PediatricAI - Pediatric Decision Support with AI

