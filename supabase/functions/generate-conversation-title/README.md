# Generate Conversation Title Function

This Supabase Edge Function generates meaningful 4-word titles for conversations using the OpenAI Responses API.

## Overview

The function takes a conversation ID and user message, then uses OpenAI's GPT-5-nano model to generate a concise title that summarizes the conversation topic.

## API Endpoints

### POST `/functions/v1/generate-conversation-title`

Generates a title for a conversation.

**Request Body:**
```json
{
  "conversationId": "uuid",
  "userMessage": "string"
}
```

**Response:**
```json
{
  "success": true,
  "title": "Generated four word title",
  "conversationId": "uuid"
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Environment Variables

- `PediaAIKey`: OpenAI API key for accessing the Responses API
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for database access

## Title Extraction Logic

The function handles multiple OpenAI response formats:

1. **Output Array Format** (most common):
   ```json
   {
     "output": [
       {
         "content": [
           {
             "type": "output_text",
             "text": "Generated title text"
           }
         ]
       }
     ]
   }
   ```

2. **Direct Text Format**:
   ```json
   {
     "text": "Generated title text"
   }
   ```

3. **Direct Output Format**:
   ```json
   {
     "output": "Generated title text"
   }
   ```

## Features

- **Robust Text Extraction**: Handles various OpenAI response formats
- **4-Word Limit**: Automatically truncates titles to exactly 4 words
- **Text Sanitization**: Removes extra whitespace and line breaks
- **Fallback**: Uses "New Conversation" if extraction fails
- **Comprehensive Logging**: Detailed logs for debugging

## Testing

### Unit Tests

Run unit tests to verify title extraction logic:

```bash
deno test supabase/functions/generate-conversation-title/test.ts
```

Tests cover:
- Different OpenAI response formats
- Text sanitization and truncation
- Edge cases and fallbacks
- Special characters handling

### Integration Tests

Run integration tests to verify end-to-end functionality:

```bash
deno test supabase/functions/generate-conversation-title/integration-test.ts --allow-net --allow-env
```

Tests cover:
- Full conversation title generation flow
- Input validation
- CORS functionality
- Database updates
- Error handling

**Note**: Integration tests require:
- Valid Supabase service role key
- Access to test database
- Network permissions for API calls

## Usage Example

```typescript
import { supabase } from '@/integrations/supabase/client';

// Trigger title generation for a conversation
const { data, error } = await supabase.functions.invoke('generate-conversation-title', {
  body: {
    conversationId: 'conversation-uuid',
    userMessage: 'What is the recommended pediatric dosage for acetaminophen?'
  }
});

if (data?.success) {
  console.log('Generated title:', data.title);
  // Title: "Pediatric acetaminophen dosage"
}
```

## Error Handling

The function includes comprehensive error handling for:

- Missing required parameters
- OpenAI API failures
- Database update failures
- Network timeouts
- Invalid response formats

All errors are logged with detailed context for debugging.

## Security

- Uses service role key for database access
- Validates input parameters
- Implements proper CORS headers
- Sanitizes generated text content
- Follows Supabase security best practices