# Edge Function Tests

Unit tests for Supabase Edge Functions security and validation logic.

## Prerequisites

- [Deno](https://deno.land/) runtime installed

Install Deno:
```bash
# macOS
brew install deno

# or using the installer script
curl -fsSL https://deno.land/install.sh | sh
```

## Running Tests

Run all tests:
```bash
deno test --allow-env supabase/functions/_tests/
```

Run specific test file:
```bash
deno test --allow-env supabase/functions/_tests/cors.test.ts
deno test --allow-env supabase/functions/_tests/file-validation.test.ts
deno test --allow-env supabase/functions/_tests/auth-security.test.ts
```

Run with verbose output:
```bash
deno test --allow-env --trace-ops supabase/functions/_tests/
```

## Test Coverage

### `cors.test.ts`
Tests CORS header generation:
- Allowed origins (production, staging, localhost variants)
- Rejected unauthorized origins
- Wildcard prevention
- Required headers (methods, max-age, etc.)

### `file-validation.test.ts`
Tests file upload validation:
- File size limits (min 1 byte, max 20MB)
- Allowed file types (PDF, Word, images, text)
- Rejected file types (executables, scripts, HTML)
- Filename validation (directory traversal prevention)

### `auth-security.test.ts`
Tests authentication and authorization:
- Bearer token extraction
- Conversation ownership verification
- Missing/invalid auth header handling
- Cross-user access prevention

## CI Integration

Add to your CI pipeline:
```yaml
- name: Run Edge Function Tests
  run: |
    deno test --allow-env supabase/functions/_tests/
```
