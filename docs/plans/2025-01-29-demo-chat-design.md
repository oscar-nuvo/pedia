# Landing Page Demo with Real AI

## Overview

Enable real AI responses on the landing page demo with lead capture and abuse protection.

## User Flow

```
1. User lands on page → sees terminal with blinking cursor
2. User types question, hits enter
3. Input validated (length, injection patterns)
4. Terminal asks: "Good question. Drop your email and I'll pull up the answer."
5. User types email
6. Email validated (format + MX lookup)
7. If valid → stream real AI response, show "2 questions remaining"
8. Queries 2 & 3 → direct to AI (no email prompt)
9. After 3rd query → redirect to /auth?email=<email>
```

## Backend Architecture

### New Edge Function: `demo-chat`

**Endpoint:** `POST /functions/v1/demo-chat`

**Request:**
```json
{
  "email": "user@example.com",
  "question": "What's the amoxicillin dose for 15kg?"
}
```

**Validation Pipeline:**
1. CORS check (same allowed origins as production)
2. Rate limit by IP (10 req/min, 50 req/hour)
3. Input length check (≤ 500 chars)
4. Injection pattern scan
5. Email format validation (regex)
6. MX record lookup (cached)
7. Query count check (≤ 3 per email)

**Response:** SSE stream matching production format
```
event: text_delta
data: {"text": "Based on "}

event: complete
data: {"remaining": 2}
```

### New Database Table: `demo_leads`

```sql
CREATE TABLE demo_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  queries_used INTEGER DEFAULT 1,
  first_question TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_query_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick email lookups
CREATE INDEX idx_demo_leads_email ON demo_leads(email);
```

## Security Measures (Demo Only)

### Input Length Cap
- Maximum 500 characters
- Reject with friendly message if exceeded

### Injection Pattern Scanner

Blocked patterns (case-insensitive):
- "ignore your", "ignore all", "ignore previous"
- "disregard your", "forget your"
- "system prompt", "reveal your", "what are your instructions"
- "pretend you", "act as", "you are now"
- "jailbreak", "DAN mode", "developer mode"

Response: "I'm here for clinical questions only. Try asking about dosing, differentials, or drug interactions."

### Rate Limiting (IP-based)

| Limit | Window | Purpose |
|-------|--------|---------|
| 10 requests | 1 minute | Stops automated scripts |
| 50 requests | 1 hour | Stops determined manual abuse |

### MX Lookup Caching
- Valid domains: cache 24 hours
- Invalid domains: cache 1 hour
- Timeout: 3 seconds, fail open

### Server-Side Query Tracking
- Stored in `demo_leads` table
- Cannot be bypassed by clearing localStorage
- Email is unique constraint

## Frontend Changes

### InteractiveDemo.tsx

States:
- `idle` - waiting for question
- `awaiting_email` - question submitted, asking for email
- `validating` - checking email
- `streaming` - AI response streaming
- `complete` - response done, show remaining count
- `exhausted` - 3 queries used, redirect to signup

Terminal messages:
- Email prompt: "Good question. Drop your email and I'll pull up the answer."
- Invalid email: "That email doesn't look right. Try again?"
- Injection blocked: "I'm here for clinical questions only..."
- After response: "X free questions remaining"
- Exhausted: "You've used your 3 free questions. Ready for unlimited access?"

## Files to Create/Modify

1. `supabase/functions/demo-chat/index.ts` - New edge function
2. `supabase/migrations/XXXX_create_demo_leads.sql` - Database migration
3. `src/components/landing/InteractiveDemo.tsx` - Update UI flow
4. `src/pages/Auth.tsx` - Accept email query param

## Logged-In Users

These protections are demo-only. Authenticated users:
- No input length cap
- No injection scanning
- Generous rate limits (100/min)
- No query limits
