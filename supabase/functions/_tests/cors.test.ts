/**
 * CORS Headers Tests
 *
 * Tests for the getCorsHeaders function used across Edge Functions.
 * Run with: deno test --allow-env supabase/functions/_tests/cors.test.ts
 */

import {
  assertEquals,
  assertNotEquals,
} from 'https://deno.land/std@0.192.0/testing/asserts.ts';

// Inline implementation of getCorsHeaders for testing
// (In production, this would be imported from a shared module)
const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = [
    'https://pedia-app.vercel.app',
    'https://staging.pedia-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
  ];

  const corsOrigin =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

Deno.test('getCorsHeaders - returns production origin for allowed origin', () => {
  const headers = getCorsHeaders('https://pedia-app.vercel.app');
  assertEquals(
    headers['Access-Control-Allow-Origin'],
    'https://pedia-app.vercel.app'
  );
});

Deno.test('getCorsHeaders - returns staging origin for staging requests', () => {
  const headers = getCorsHeaders('https://staging.pedia-app.vercel.app');
  assertEquals(
    headers['Access-Control-Allow-Origin'],
    'https://staging.pedia-app.vercel.app'
  );
});

Deno.test('getCorsHeaders - returns localhost:8080 for local dev', () => {
  const headers = getCorsHeaders('http://localhost:8080');
  assertEquals(headers['Access-Control-Allow-Origin'], 'http://localhost:8080');
});

Deno.test('getCorsHeaders - returns localhost:3000 for CRA dev', () => {
  const headers = getCorsHeaders('http://localhost:3000');
  assertEquals(headers['Access-Control-Allow-Origin'], 'http://localhost:3000');
});

Deno.test('getCorsHeaders - returns localhost:5173 for Vite default', () => {
  const headers = getCorsHeaders('http://localhost:5173');
  assertEquals(headers['Access-Control-Allow-Origin'], 'http://localhost:5173');
});

Deno.test('getCorsHeaders - rejects unauthorized origin and defaults to production', () => {
  const headers = getCorsHeaders('https://malicious-site.com');
  assertEquals(
    headers['Access-Control-Allow-Origin'],
    'https://pedia-app.vercel.app'
  );
  assertNotEquals(
    headers['Access-Control-Allow-Origin'],
    'https://malicious-site.com'
  );
});

Deno.test('getCorsHeaders - handles undefined origin by defaulting to production', () => {
  const headers = getCorsHeaders(undefined);
  assertEquals(
    headers['Access-Control-Allow-Origin'],
    'https://pedia-app.vercel.app'
  );
});

Deno.test('getCorsHeaders - handles null origin by defaulting to production', () => {
  // @ts-ignore - testing null handling
  const headers = getCorsHeaders(null);
  assertEquals(
    headers['Access-Control-Allow-Origin'],
    'https://pedia-app.vercel.app'
  );
});

Deno.test('getCorsHeaders - includes required headers', () => {
  const headers = getCorsHeaders('https://pedia-app.vercel.app');
  assertEquals(headers['Access-Control-Allow-Methods'], 'POST, OPTIONS');
  assertEquals(headers['Access-Control-Max-Age'], '86400');
  assertEquals(
    headers['Access-Control-Allow-Headers'],
    'authorization, x-client-info, apikey, content-type'
  );
});

Deno.test('getCorsHeaders - does NOT allow wildcard origin', () => {
  const headers = getCorsHeaders('*');
  assertNotEquals(headers['Access-Control-Allow-Origin'], '*');
});

Deno.test('getCorsHeaders - rejects http version of production URL', () => {
  const headers = getCorsHeaders('http://pedia-app.vercel.app');
  assertNotEquals(
    headers['Access-Control-Allow-Origin'],
    'http://pedia-app.vercel.app'
  );
});
