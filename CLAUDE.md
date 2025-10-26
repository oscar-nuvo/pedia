# PediatricAI Codebase Guide

A comprehensive guide to the PediatricAI (Pedia) project for Claude Code instances.

## Project Overview

**PediatricAI** is an AI-powered copilot designed for pediatric medical professionals. It combines a modern React frontend with serverless backend processing via Supabase Edge Functions and OpenAI's Responses API.

- **Repository**: https://github.com/oscar-nuvo/pedia.git
- **Project Type**: Full-stack web application
- **Framework**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **AI Integration**: OpenAI Responses API with streaming
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Package Manager**: npm + Bun

---

## Development Commands

### Core Development
```bash
npm run dev              # Start dev server (localhost:8080)
npm run build           # Production build (to dist/)
npm run build:dev       # Development build
npm run preview         # Preview production build locally
npm run lint            # ESLint TypeScript/React files
```

### Supabase Edge Functions
```bash
# Deploy Edge Function (requires Supabase CLI)
supabase functions deploy pediatric-ai-chat
supabase functions deploy generate-conversation-title

# Test locally
supabase functions serve
```

### Environment Setup
```bash
# Required env vars (.env file):
VITE_SUPABASE_PROJECT_ID="pgypyipdmrhrutegapsx"
VITE_SUPABASE_PUBLISHABLE_KEY="<JWT_KEY>"
VITE_SUPABASE_URL="https://pgypyipdmrhrutegapsx.supabase.co"

# Edge Function env vars (configured in Supabase dashboard):
PediaAIKey              # OpenAI API key
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

---

## Project Structure

```
pedia/
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Main app with routing & providers
│   ├── index.css                # Global styles + CSS variables
│   ├── pages/
│   │   ├── Index.tsx           # Home landing page
│   │   ├── Auth.tsx            # Sign up/sign in
│   │   ├── Onboarding.tsx      # User onboarding flow
│   │   ├── Overview.tsx        # Dashboard overview
│   │   ├── Analytics.tsx       # Analytics dashboard
│   │   ├── AdminAgents.tsx     # Admin agent management
│   │   ├── ParentPortal.tsx    # Parent/guardian portal
│   │   ├── Documentation.tsx   # Medical documentation
│   │   ├── Scheduling.tsx      # Appointment scheduling
│   │   └── NotFound.tsx        # 404 page
│   ├── components/
│   │   ├── chat/
│   │   │   └── AdvancedChatInterface.tsx  # Main chat UI (sidebar, messages, input)
│   │   ├── ui/                 # shadcn/ui components (100+ files)
│   │   ├── ProtectedRoute.tsx  # Auth guard for routes
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── [Feature Components] # HeroSection, FeatureShowcase, etc.
│   ├── hooks/
│   │   ├── useAuth.tsx         # Auth context + hook (session management)
│   │   ├── useAdvancedAIChat.ts # Core chat logic (streaming, conversation state)
│   │   ├── use-toast.ts        # Toast notifications
│   │   └── use-mobile.tsx      # Responsive utilities
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts       # Supabase client initialization
│   │       └── types.ts        # Auto-generated TypeScript types
│   ├── lib/
│   └── assets/
├── supabase/
│   ├── config.toml             # Edge Function configuration
│   ├── functions/
│   │   ├── pediatric-ai-chat/
│   │   │   └── index.ts        # Main chat streaming handler (609 lines)
│   │   └── generate-conversation-title/
│   │       └── index.ts        # Auto-title generation for conversations
│   └── migrations/
│       ├── 20250928005549...sql  # Organizations/Profiles/User Roles
│       ├── 20250928012835...sql  # Conversations/Messages/Files tables
│       └── [More migrations]
├── package.json              # Dependencies
├── vite.config.ts           # Vite build config
├── tsconfig.json            # TypeScript base config
├── tailwind.config.ts       # Tailwind theme + colors
├── eslint.config.js         # ESLint rules
└── index.html               # HTML entry point
```

---

## High-Level Architecture

### 1. **Frontend Architecture** (React + Vite)

```
┌─────────────────────────────────────┐
│         React Application           │
├─────────────────────────────────────┤
│ App.tsx                             │
│ ├─ AuthProvider (session mgmt)     │
│ ├─ QueryClientProvider (react-query│
│ └─ Routes (React Router)            │
│    ├─ Public routes (/, /auth)     │
│    └─ Protected routes (/ai-copilot)│
├─────────────────────────────────────┤
│ Pages & Components                  │
│ ├─ AdvancedChatInterface           │
│ │  ├─ Chat sidebar (conversations) │
│ │  ├─ Message display area         │
│ │  ├─ Input box + file upload      │
│ │  └─ Reasoning/function panels    │
│ └─ Auth, Onboarding, Analytics     │
├─────────────────────────────────────┤
│ State Management                    │
│ ├─ React Context (Auth)            │
│ ├─ React Query (conversations/msgs)│
│ ├─ Local useState (UI state)       │
│ └─ Custom Hooks (useAdvancedAIChat)│
├─────────────────────────────────────┤
│ External APIs                       │
│ ├─ Supabase Client (REST/RT)       │
│ └─ Edge Functions (via fetch)      │
└─────────────────────────────────────┘
```

### 2. **Backend Architecture** (Supabase + Edge Functions)

```
┌──────────────────────────────────────┐
│   Supabase (PostgreSQL + Auth)      │
├──────────────────────────────────────┤
│ Tables:                              │
│ ├─ auth.users (Supabase Auth)       │
│ ├─ profiles (user metadata)         │
│ ├─ organizations (team management)  │
│ ├─ user_roles (RBAC)                │
│ ├─ conversations (chat sessions)    │
│ ├─ messages (chat history)          │
│ └─ conversation_files (uploads)     │
├──────────────────────────────────────┤
│ RLS Policies (Row Level Security)    │
│ ├─ Users see only own conversations │
│ ├─ Org admins manage team users     │
│ └─ File access tied to conversations│
├──────────────────────────────────────┤
│ Realtime Subscriptions              │
│ └─ messages table (INSERT events)   │
├──────────────────────────────────────┤
│ Storage Buckets                      │
│ └─ documents/ (user file uploads)   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│   Edge Functions (Deno Runtime)     │
├──────────────────────────────────────┤
│ pediatric-ai-chat:                   │
│ ├─ Receive chat message + context  │
│ ├─ Call OpenAI Responses API        │
│ ├─ Stream response events to client │
│ ├─ Persist messages to DB (+ retry) │
│ ├─ Handle function calls (dosage)  │
│ └─ Return streaming SSE response   │
│                                      │
│ generate-conversation-title:         │
│ ├─ Called on first user message     │
│ ├─ Generate 4-word title            │
│ ├─ Poll OpenAI response until done  │
│ └─ Update conversation.title        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│   External: OpenAI Responses API    │
├──────────────────────────────────────┤
│ ├─ POST /v1/responses               │
│ │  ├─ Prompt library (ID-based)    │
│ │  ├─ Streaming + storage          │
│ │  ├─ Function calling              │
│ │  └─ Reasoning support             │
│ └─ GET /v1/responses/{id}           │
│    └─ Poll for completion           │
└──────────────────────────────────────┘
```

### 3. **Data Flow: Chat Message** (Key Workflow)

```
User Types Message in Chat Input
    ↓
[AdvancedChatInterface] captures input
    ↓
handleSendMessage() uploads files (if any)
    ↓
sendMessage mutation via useAdvancedAIChat
    ↓
POST to Edge Function: /functions/v1/pediatric-ai-chat
    ├─ Body: { message, conversationId, fileIds, patientContext, options }
    └─ Headers: { Authorization: Bearer token, apikey }
    ↓
[Edge Function: pediatric-ai-chat/index.ts]
    ├─ Authenticate user (JWT)
    ├─ Save user message to messages table
    ├─ Fetch recent messages from DB (context)
    ├─ Format for OpenAI Responses API
    ├─ POST to OpenAI with streaming
    ├─ Stream events back to client (Server-Sent Events)
    └─ Persist assistant message (with fallback)
    ↓
Client receives SSE stream:
    ├─ type: 'response_started'
    ├─ type: 'response_id'
    ├─ type: 'text_delta' (chunked text)
    ├─ type: 'reasoning_delta' (thinking steps)
    ├─ type: 'function_result' (tool calls)
    ├─ type: 'response_saved' (DB confirmation)
    └─ type: 'response_complete' (final)
    ↓
[AdvancedChatInterface] processStreamEvent() updates UI:
    ├─ Accumulate text_delta → streamingState
    ├─ Show reasoning if visible
    ├─ Display function calls
    └─ Optimistically add message to cache
    ↓
Query cache invalidated
    ├─ Fetch fresh messages from DB
    └─ Re-render chat with new message

FALLBACK: If response_complete but no DB save:
    └─ Client-side fallback saves message (3s timeout)
```

---

## Key Architectural Patterns

### 1. **Authentication & Authorization**

**Pattern**: Supabase Auth + Session Context

```typescript
// useAuth.tsx - Context hook
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    // Listen to auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
  }, []);
  
  return <AuthContext.Provider value={{ user, session, signUp, signIn, signOut }}>
```

- JWT stored in localStorage via Supabase client
- Auto token refresh enabled
- Protected routes check `user` from context
- Edge Functions validate JWT header: `Bearer <token>`

### 2. **State Management**

**Pattern**: React Query + Context + Local State

```typescript
// useAdvancedAIChat.ts
export const useAdvancedAIChat = (conversationId?: string) => {
  // Server state (Supabase)
  const { data: conversations } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => supabase.from('conversations').select(...),
  });
  
  const { data: messages } = useQuery({
    queryKey: ['messages', currentConversationId],
    queryFn: async () => supabase.from('messages').select(...),
  });
  
  // Mutations
  const sendMessageMutation = useMutation({...});
  const deleteConversationMutation = useMutation({...});
  
  // UI state (local)
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    streamingMessage: '',  // Accumulates text chunks
    reasoningText: '',     // Thinking steps
    functionCalls: [],     // Tool calls
    images: [],            // Generated images
    progress: { type: 'text', status: 'Generating...' }
  });
  
  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${currentConversationId}`)
      .on('postgres_changes', { event: 'INSERT', table: 'messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages', ...] });
      })
      .subscribe();
  }, [currentConversationId]);
  
  return { conversations, messages, streamingState, sendMessage, ... };
};
```

- **Server State**: React Query (conversations, messages) with auto-refetch
- **UI State**: Local useState for streaming/progress
- **Realtime**: Postgres Change subscriptions via Supabase
- **Cache**: React Query cache invalidation on mutations

### 3. **Streaming & Real-Time Updates**

**Pattern**: Server-Sent Events (SSE) + Event Processing

```typescript
// Edge Function streams SSE
const stream = new ReadableStream({
  async start(controller) {
    const reader = response.body?.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const parsed = JSON.parse(line.slice(6));
          
          // Stream events to client
          controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify(parsed)}\n\n`
          ));
        }
      }
    }
  }
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});
```

Client-side:
```typescript
const response = await fetch('.../pediatric-ai-chat', {
  method: 'POST',
  signal: abortControllerRef.current?.signal  // Cancelable
});

const reader = response.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = new TextDecoder().decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const parsed = JSON.parse(line.slice(6));
      await processStreamEvent(parsed, context);  // Handle each event
    }
  }
}
```

- **Streaming Response**: OpenAI → Edge Function → Client (SSE)
- **Event Types**: response_started, text_delta, reasoning_delta, function_result, response_complete
- **Abort Control**: AbortController for canceling long-running streams
- **Timeout Handling**: 3-5s fallback window for DB persistence

### 4. **Function Calling (Tool Use)**

**Pattern**: Tool Definition → Call Streaming → Result Handling

```typescript
// Tools defined in Edge Function
const tools = [
  {
    name: "calculate_pediatric_dosage",
    type: "function",
    parameters: {
      properties: {
        medication: { type: "string" },
        weight_kg: { type: "number" },
        age_years: { type: "number" },
        indication: { type: "string" },
        route: { type: "string", default: "oral" }
      },
      required: ["medication", "weight_kg", "age_years", "indication"]
    }
  },
  {
    name: "analyze_growth_chart",
    type: "function",
    parameters: { /* ... */ }
  }
];

// Handle function calls
if (parsed.type === 'response.function_call.arguments.done') {
  const result = await handleFunctionCall({
    name: parsed.name,
    arguments: parsed.arguments
  });
  
  controller.enqueue(`data: ${JSON.stringify({
    type: 'function_result',
    function_name: parsed.name,
    result
  })}\n\n`);
}

// Implementation examples
async function calculatePediatricDosage(params) {
  const { medication, weight_kg, age_years, indication, route } = params;
  
  // Lookup dosing tables
  const dosing = medications[medication.toLowerCase()][route];
  
  // Calculate with safety checks
  let calculatedDose = weight_kg * dosing.dose_mg_kg_day;
  if (calculatedDose > dosing.max_dose_mg_day) {
    calculatedDose = dosing.max_dose_mg_day;
    warnings.push('Dose capped at maximum');
  }
  
  return { calculated_dose_mg, frequency, warnings, safety_note };
}
```

- **Tool Definition**: JSON Schema with parameters
- **Streaming Arguments**: `function_arguments_delta` events
- **Result Handling**: Execute tool, stream result back
- **Safety**: Medical dosing calculations with max dose caps

### 5. **Database Schema & RLS**

**Pattern**: Row-Level Security (RLS) for multi-tenant isolation

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policy: users see only own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Messages table (realtime enabled)
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  response_id TEXT,  -- Track OpenAI response for idempotency
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users see messages in their own conversations
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  ));

ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

- **User Isolation**: RLS policies ensure users see only their data
- **Cascading Deletes**: Deleting conversation cascades to messages/files
- **Realtime**: Messages table enabled for INSERT subscriptions
- **Indexes**: On user_id, conversation_id, created_at for performance
- **Metadata**: JSONB columns store flexible data (reasoning, citations, etc.)

### 6. **Error Handling & Resilience**

**Pattern**: Three-tier fallback for message persistence

```typescript
// Tier 1: Edge Function saves during streaming
const persistAssistantMessage = async () => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantContent,
      response_id: currentResponseId  // Idempotency key
    });
  
  if (error) {
    controller.enqueue(`data: ${JSON.stringify({
      type: 'db_error',
      details: error.message
    })}\n\n`);
  }
};

// Tier 2: Primary client-side fallback (3s timeout)
setTimeout(async () => {
  const { data: existing } = await supabase
    .from('messages')
    .select('id')
    .eq('response_id', currentResponseId)  // Check by response ID
    .single();
  
  if (!existing) {
    // Save as fallback
    await supabase.from('messages').insert({...});
  }
}, 3000);

// Tier 3: Secondary fallback on stream end (2s timeout)
if (!receivedResponseComplete && accumulatedContent.trim()) {
  setTimeout(async () => {
    // Check again and save if needed
  }, 2000);
}
```

- **Idempotency**: response_id field prevents duplicate messages
- **Three-tier Fallback**: Edge Function → Primary timeout → Secondary timeout
- **Graceful Degradation**: UI shows message immediately (optimistic), DB saves async
- **Error Logging**: All errors logged; toast notifications to user

---

## Critical Workflows

### Workflow 1: User Authentication Flow

```
1. User visits / (Index page)
2. Click "Sign In" → navigate to /auth
3. AuthProvider checks session on mount
   - If session exists → redirect to /ai-copilot
   - If no session → show Auth page
4. User submits form (email/password)
5. Auth.tsx calls useAuth().signUp() or signIn()
6. Supabase creates user + profile record (trigger)
7. Email sent for verification
8. User returns to app → session auto-restored
9. Protected routes allow access
```

**Files**: `src/hooks/useAuth.tsx`, `src/pages/Auth.tsx`, `src/components/ProtectedRoute.tsx`

### Workflow 2: Chat Message Streaming

```
1. User types in AdvancedChatInterface input box
2. Hits Enter → handleSendMessage()
3. Uploads files (if any) to Supabase storage
4. Calls sendMessage mutation with message + fileIds
5. useAdvancedAIChat sends POST to Edge Function:
   POST /functions/v1/pediatric-ai-chat
   {
     message: "...",
     conversationId: "...",
     fileIds: [...],
     patientContext: {...},
     options: { reasoningEffort: 'high' }
   }

6. Edge Function processes:
   - Auth validation
   - Save user message to DB
   - Check if first message → trigger title generation
   - Fetch conversation history (last 20 messages)
   - Call OpenAI Responses API with streaming

7. OpenAI streams events:
   - response.output_text.delta → accumulate text
   - response.reasoning.summary.delta → thinking steps
   - response.function_call.arguments.done → execute tool
   - response.completed → save message to DB

8. Edge Function re-streams to client as SSE:
   data: { type: 'text_delta', delta: '...' }
   data: { type: 'reasoning_delta', delta: '...' }
   data: { type: 'function_result', result: {...} }
   data: { type: 'response_complete', ... }

9. Client receives stream:
   - processStreamEvent() updates streamingState
   - React re-renders with new text chunks
   - Message appears in real-time

10. On response_complete:
    - Optimistically add message to React Query cache
    - Set 3s timeout for DB fallback
    - Invalidate messages query after 1s

11. Realtime subscription triggers:
    - Messages table INSERT detected
    - React Query cache refreshed
    - Chat shows persisted message
```

**Files**: `src/hooks/useAdvancedAIChat.ts`, `src/components/chat/AdvancedChatInterface.tsx`, `supabase/functions/pediatric-ai-chat/index.ts`

### Workflow 3: Conversation Title Generation (Fire-and-Forget)

```
1. User sends first message in new conversation
2. Edge Function detects it's first message:
   if (userMessageCount === 1) {
     supabase.functions.invoke('generate-conversation-title', {
       body: { conversationId, userMessage: message }
     }).catch(...);  // Fire-and-forget
   }

3. generate-conversation-title function:
   - Receives message text
   - Calls OpenAI Responses API: "Write a 4-word summary of: ..."
   - Returns response ID
   - Polls GET /v1/responses/{id} every 1s (max 30s)
   - When completed, extracts text from output
   - Updates conversations.title in DB

4. Frontend doesn't wait:
   - Conversation shows "New Conversation" initially
   - Realtime subscription detects UPDATE
   - Title automatically refreshes on screen
```

**Files**: `supabase/functions/generate-conversation-title/index.ts`, `supabase/functions/pediatric-ai-chat/index.ts` (trigger)

### Workflow 4: Conversation Deletion

```
1. User clicks trash icon on conversation in sidebar
2. AlertDialog confirms deletion
3. deleteConversation() mutation called
4. DELETE FROM conversations WHERE id = ? AND user_id = ?
5. Cascade delete: messages, files in DB
6. Query cache invalidated:
   - ['conversations', user.id]
   - ['messages', conversationId]
7. If deleting current conversation:
   - Reset streamingState
   - setCurrentConversationId(null)
8. Chat shows "Start a new conversation"
```

**Files**: `src/hooks/useAdvancedAIChat.ts`, `src/components/chat/AdvancedChatInterface.tsx`

---

## Database Schema Summary

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `conversations` | Chat sessions | id, user_id, title, metadata, created_at, updated_at |
| `messages` | Chat history | id, conversation_id, role (user/assistant), content, response_id, metadata |
| `conversation_files` | File uploads | id, conversation_id, openai_file_id, filename, content_type, size_bytes |
| `profiles` | User metadata | id, user_id, first_name, last_name, email, avatar_url, onboarding_completed |
| `organizations` | Teams | id, name, subscription_tier, settings |
| `user_roles` | RBAC | user_id, organization_id, role (super_admin/admin/doctor/nurse/receptionist) |

### Migrations Executed

1. **20250928005549**: Core org/profile/user_roles tables + RLS + triggers
2. **20250928012835**: Conversations/messages/files tables + RLS + realtime + indexes
3. **[Others]**: Additional schema refinements

---

## Edge Functions Deployment

### 1. **pediatric-ai-chat** (Main Chat Handler)

**Path**: `supabase/functions/pediatric-ai-chat/index.ts` (609 lines)

**Triggers**: POST from frontend via fetch

**Responsibilities**:
- Authenticate user (validate JWT)
- Save user message to DB
- Trigger title generation on first message
- Build conversation context from DB
- Call OpenAI Responses API with tools
- Stream events back to client (SSE)
- Persist assistant message (with retry)
- Handle function calls (dosage, growth chart)

**Environment Variables**:
- `PediaAIKey`: OpenAI API key
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

**Example Request**:
```bash
curl -X POST https://pgypyipdmrhrutegapsx.supabase.co/functions/v1/pediatric-ai-chat \
  -H "Authorization: Bearer $SUPABASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the amoxicillin dose for a 5-year-old weighing 18kg?",
    "conversationId": "...",
    "patientContext": { "age": 5, "weight_kg": 18 }
  }'
```

**Response** (SSE stream):
```
data: {"type":"response_started"}
data: {"type":"response_id","responseId":"resp_..."}
data: {"type":"text_delta","delta":"The recommended"}
data: {"type":"text_delta","delta":" amoxicillin dose"}
...
data: {"type":"response_complete","usage":{"prompt_tokens":150,"completion_tokens":50}}
```

### 2. **generate-conversation-title** (Auto-title)

**Path**: `supabase/functions/generate-conversation-title/index.ts` (184 lines)

**Triggers**: Called via `.functions.invoke()` from main edge function

**Responsibilities**:
- Receive first user message
- Call OpenAI Responses API to generate 4-word title
- Poll for completion (1s intervals, 30s max)
- Update conversations.title

**Example**:
- Input: "My child has been having a high fever for 3 days"
- Output: "Fever management in children"

---

## Key Technologies & Versions

| Technology | Version | Role |
|-----------|---------|------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.5.3 | Type safety |
| Vite | 5.4.1 | Build tool |
| React Router | 6.26.2 | Routing |
| React Query | 5.56.2 | Server state |
| Supabase | 2.58.0 | Backend/Auth |
| Tailwind CSS | 3.4.11 | Styling |
| shadcn/ui | Latest | Component library |
| Deno | Latest | Edge Function runtime |
| OpenAI API | Responses API | AI backend |

---

## Configuration Files

### `vite.config.ts`
- Dev server: `localhost:8080`
- Build output: `dist/`
- Path alias: `@/` → `src/`
- React SWC plugin for fast builds

### `tsconfig.json`
- Target: ES2020
- Lib: ES2020 + DOM
- JSX: React 18
- Base path with `@/*` alias
- Loose type checking (skipLibCheck, noImplicitAny: false)

### `tailwind.config.ts`
- Dark mode: class-based
- Brand colors: yellow, lime
- Neutral scale: 50-900
- Extended sidebar component colors
- Custom keyframes: accordion, float, fade-in

### `eslint.config.js`
- Recommended rules from @eslint/js
- TypeScript rules from typescript-eslint
- React Hooks rules
- React Refresh rules
- Relaxed rules: no-unused-vars off

### `.env`
```
VITE_SUPABASE_PROJECT_ID=pgypyipdmrhrutegapsx
VITE_SUPABASE_PUBLISHABLE_KEY=<JWT>
VITE_SUPABASE_URL=https://pgypyipdmrhrutegapsx.supabase.co
```

---

## Security & RLS Patterns

### Authentication
- **Supabase Auth**: Email/password with JWT
- **Session Storage**: localStorage + auto-refresh
- **Protected Routes**: ProtectedRoute component checks `user` context
- **Edge Function Auth**: Header validation + `supabase.auth.getUser(token)`

### Row-Level Security (RLS)
```sql
-- Users see only their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users create messages only in their conversations
CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  ));

-- Admins can manage team members
CREATE POLICY "Admins can manage roles in their organization"
  ON user_roles FOR ALL USING (
    organization_id = public.get_user_organization(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );
```

### API Security
- **CORS Headers**: Allowed origins configured in Edge Functions
- **API Keys**: Environment variables, never exposed to client
- **File Upload**: Stored in Supabase Storage with user-namespaced paths

---

## Common Tasks

### Add a New Chat Feature

1. **Add field to conversation_files / messages / conversations table**:
   - Create new migration in `supabase/migrations/`
   - Run: `supabase db push`

2. **Update TypeScript types**:
   - Edit `src/integrations/supabase/types.ts` (auto-generated, but may need manual updates)
   - Or run: `supabase gen types typescript > src/integrations/supabase/types.ts`

3. **Modify chat hook**:
   - Update `useAdvancedAIChat.ts`: add query/mutation for new data
   - Add state to StreamingState interface

4. **Update UI component**:
   - Modify `AdvancedChatInterface.tsx`: display new data
   - Pass state to child components

5. **Update Edge Function**:
   - Modify `pediatric-ai-chat/index.ts`: handle new request fields
   - Add new OpenAI tools if needed
   - Test with `supabase functions serve`

### Deploy to Production

1. **Frontend**:
   ```bash
   npm run build
   # Deploy dist/ to Lovable or Vercel/Netlify
   git push origin main
   ```

2. **Edge Functions**:
   ```bash
   supabase functions deploy pediatric-ai-chat --project-id pgypyipdmrhrutegapsx
   supabase functions deploy generate-conversation-title --project-id pgypyipdmrhrutegapsx
   ```

3. **Database Migrations**:
   - Created migrations are auto-applied on push
   - Or manually: `supabase db push --project-id pgypyipdmrhrutegapsx`

### Add a New Route/Page

1. Create page component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:
   ```typescript
   <Route path="/new-page" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
   ```
3. Link from navigation (e.g., Header, Sidebar)

### Handle a Streaming Error

1. Check Edge Function logs in Supabase dashboard
2. Client receives `stream_error` event
3. Check browser console for fetch errors
4. Verify OpenAI API key is valid
5. Check user has valid session (JWT not expired)

---

## Debugging Tips

### Frontend Debugging
```typescript
// Enable verbose logging in useAdvancedAIChat
const processStreamEvent = async (event: any, context: any) => {
  console.log('Stream event:', event.type, event);  // Add this
  switch (event.type) { ... }
};

// Check React Query cache
import { useQueryClient } from '@tanstack/react-query';
const qc = useQueryClient();
console.log(qc.getQueryData(['messages', currentConversationId]));

// Check Supabase session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

### Edge Function Debugging
```typescript
// Deno console.log visible in Supabase function logs
console.log('User ID:', user.id);
console.log('Request body:', { message, conversationId, ... });
console.log('OpenAI response status:', response.status);

// Test locally
supabase functions serve
# Call http://localhost:54321/functions/v1/pediatric-ai-chat
```

### Database Debugging
```sql
-- Check recent messages
SELECT * FROM messages
WHERE conversation_id = 'xxx'
ORDER BY created_at DESC
LIMIT 10;

-- Check RLS is working
-- Connect as authenticated user, verify can't see other users' conversations
SELECT * FROM conversations WHERE user_id != auth.uid();  -- Should be empty

-- Check realtime is enabled
SELECT name FROM pg_publication WHERE pubname = 'supabase_realtime';
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

---

## Future Architecture Considerations

1. **Scalability**:
   - Consider moving function calls to separate worker pool
   - Cache frequently used medical reference data
   - Implement Redis caching for conversation summaries

2. **Features**:
   - Multi-turn reasoning with Claude via Responses API
   - Medical image analysis (upload X-rays, etc.)
   - Integration with EHR systems (HL7/FHIR)
   - Offline-first architecture with local SQLite

3. **Performance**:
   - Implement message pagination (don't load all history)
   - Compress large metadata objects
   - Use CDN for static assets
   - Optimize bundled size (tree-shaking, code splitting)

4. **Security**:
   - End-to-end encryption for sensitive data
   - Audit logging for HIPAA compliance
   - Rate limiting per user/org
   - RBAC improvements (role-based tool access)

---

## Summary

**PediatricAI** is a modern, production-ready pediatric decision-support system built on:
- **React + TypeScript** for type-safe, maintainable UI
- **Supabase** for serverless backend with RLS & realtime
- **OpenAI Responses API** for advanced reasoning & function calling
- **Streaming architecture** for real-time AI feedback
- **Three-tier fallback** for robust message persistence

This architecture enables **scalable, secure, real-time medical collaboration** with minimal DevOps overhead.

---

**Last Updated**: 2025-10-25
**Maintainer**: Oscar Oliva
**Repository**: https://github.com/oscar-nuvo/pedia.git
