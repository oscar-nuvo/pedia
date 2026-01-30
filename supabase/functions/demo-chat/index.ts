import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================
// CONFIGURATION
// ============================================

const MAX_QUERIES_PER_EMAIL = 3;
const MAX_INPUT_LENGTH = 500;
const RATE_LIMIT_PER_MINUTE = 10;
const RATE_LIMIT_PER_HOUR = 50;
const MX_LOOKUP_TIMEOUT_MS = 3000;

// Use the same prompt ID as production for consistent responses
const PROMPT_ID = "pmpt_68d880ea8b0c8194897a498de096ee0f0859affba435451f";

// Injection patterns to block (case-insensitive)
const INJECTION_PATTERNS = [
  "ignore your",
  "ignore all",
  "ignore previous",
  "disregard your",
  "forget your",
  "system prompt",
  "reveal your",
  "what are your instructions",
  "pretend you",
  "act as",
  "you are now",
  "jailbreak",
  "dan mode",
  "developer mode",
  "bypass",
  "override",
];

// In-memory rate limiting (per instance - works for edge functions)
const rateLimitMap = new Map<string, number[]>();

// MX lookup cache
const mxCache = new Map<string, { valid: boolean; timestamp: number }>();
const MX_CACHE_VALID_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MX_CACHE_INVALID_TTL = 60 * 60 * 1000; // 1 hour

// ============================================
// CORS
// ============================================

const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = [
    'https://pedia.lovable.app',
    'https://pedia-app.vercel.app',
    'https://staging.pedia-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
  ];

  const corsOrigin = (origin && allowedOrigins.includes(origin))
    ? origin
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'content-type, x-client-info, apikey',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

// ============================================
// VALIDATION HELPERS
// ============================================

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Clean old timestamps
  const oneHourAgo = now - 60 * 60 * 1000;
  const recentTimestamps = timestamps.filter(t => t > oneHourAgo);

  // Check per-minute limit
  const oneMinuteAgo = now - 60 * 1000;
  const lastMinuteCount = recentTimestamps.filter(t => t > oneMinuteAgo).length;
  if (lastMinuteCount >= RATE_LIMIT_PER_MINUTE) {
    return { allowed: false, retryAfter: 60 };
  }

  // Check per-hour limit
  if (recentTimestamps.length >= RATE_LIMIT_PER_HOUR) {
    return { allowed: false, retryAfter: 3600 };
  }

  // Record this request
  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);

  return { allowed: true };
}

function checkInjection(input: string): boolean {
  const lower = input.toLowerCase();
  return INJECTION_PATTERNS.some(pattern => lower.includes(pattern));
}

function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function validateMxRecord(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  if (!domain) return false;

  // Check cache first
  const cached = mxCache.get(domain);
  if (cached) {
    const ttl = cached.valid ? MX_CACHE_VALID_TTL : MX_CACHE_INVALID_TTL;
    if (Date.now() - cached.timestamp < ttl) {
      return cached.valid;
    }
  }

  try {
    // Use DNS-over-HTTPS to check MX records
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MX_LOOKUP_TIMEOUT_MS);

    const response = await fetch(
      `https://dns.google/resolve?name=${domain}&type=MX`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Fail open on API errors, but log for monitoring
      console.warn('MX lookup API error - failing open:', {
        domain,
        status: response.status,
        timestamp: new Date().toISOString()
      });
      return true;
    }

    const data = await response.json();
    const hasMx = data.Answer && data.Answer.length > 0;

    // Cache the result
    mxCache.set(domain, { valid: hasMx, timestamp: Date.now() });

    return hasMx;
  } catch (error) {
    // Fail open on network errors, but log for monitoring
    console.warn('MX lookup network error - failing open:', {
      domain,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return true;
  }
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin || undefined);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';

  try {
    // ============================================
    // 1. RATE LIMITING
    // ============================================
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'rate_limited',
          message: 'Too many requests. Please try again later.',
          retryAfter: rateCheck.retryAfter
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 2. PARSE REQUEST
    // ============================================
    const { email, question } = await req.json();

    if (!email || !question) {
      return new Response(
        JSON.stringify({ error: 'missing_fields', message: 'Email and question are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 3. INPUT LENGTH CHECK
    // ============================================
    if (question.length > MAX_INPUT_LENGTH) {
      return new Response(
        JSON.stringify({
          error: 'input_too_long',
          message: `Question must be ${MAX_INPUT_LENGTH} characters or less.`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 4. INJECTION PATTERN CHECK
    // ============================================
    if (checkInjection(question)) {
      return new Response(
        JSON.stringify({
          error: 'invalid_question',
          message: "I'm here for clinical questions only. Try asking about dosing, differentials, or drug interactions."
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 5. EMAIL FORMAT VALIDATION
    // ============================================
    if (!validateEmailFormat(email)) {
      return new Response(
        JSON.stringify({
          error: 'invalid_email',
          message: "That email doesn't look right. Try again?"
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 6. MX RECORD VALIDATION
    // ============================================
    const hasMx = await validateMxRecord(email);
    if (!hasMx) {
      return new Response(
        JSON.stringify({
          error: 'invalid_email_domain',
          message: "That email domain doesn't seem valid. Try a different email?"
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 7. DATABASE: CHECK/UPDATE QUERY COUNT
    // ============================================
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing required environment variables:', {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey
      });
      throw new Error('Server configuration error: Missing database credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check existing lead
    const { data: existingLead, error: lookupError } = await supabase
      .from('demo_leads')
      .select('id, queries_used')
      .eq('email', email.toLowerCase())
      .single();

    // PGRST116 = no rows found (expected for new users, not an error)
    if (lookupError && lookupError.code !== 'PGRST116') {
      console.error('Database lookup error:', {
        email,
        error: lookupError,
        code: lookupError.code
      });
      throw new Error('Database lookup failed');
    }

    let queriesUsed = 0;
    let remaining = MAX_QUERIES_PER_EMAIL;

    if (existingLead) {
      queriesUsed = existingLead.queries_used;

      if (queriesUsed >= MAX_QUERIES_PER_EMAIL) {
        return new Response(
          JSON.stringify({
            error: 'queries_exhausted',
            message: "You've used your 3 free questions. Ready for unlimited access?",
            remaining: 0,
            redirectTo: `/auth?email=${encodeURIComponent(email)}`
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment query count - this is critical for quota enforcement
      const { error: updateError } = await supabase
        .from('demo_leads')
        .update({
          queries_used: queriesUsed + 1,
          last_query_at: new Date().toISOString()
        })
        .eq('id', existingLead.id);

      if (updateError) {
        console.error('Critical: Failed to update lead query count:', {
          email,
          leadId: existingLead.id,
          error: updateError,
          code: updateError.code
        });
        // Fail the request to prevent quota bypass
        return new Response(
          JSON.stringify({
            error: 'server_error',
            message: 'Unable to process your request. Please try again.'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      remaining = MAX_QUERIES_PER_EMAIL - queriesUsed - 1;
    } else {
      // Create new lead
      const { error: insertError } = await supabase
        .from('demo_leads')
        .insert({
          email: email.toLowerCase(),
          queries_used: 1,
          first_question: question,
          ip_address: clientIP
        });

      // 23505 = unique_violation (duplicate email) - this can happen in race conditions
      // and is expected, so we continue. Other errors should fail the request.
      if (insertError && insertError.code !== '23505') {
        console.error('Critical: Failed to create demo lead:', {
          email,
          error: insertError,
          code: insertError.code
        });
        return new Response(
          JSON.stringify({
            error: 'server_error',
            message: 'Unable to process your request. Please try again.'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      remaining = MAX_QUERIES_PER_EMAIL - 1;
    }

    // ============================================
    // 8. CALL OPENAI
    // ============================================
    const openaiApiKey = Deno.env.get('PediaAIKey');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Demo chat: ${email} asking: ${question.substring(0, 50)}...`);

    // Use Responses API with stored prompt and gpt-5 (same as production)
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        prompt: {
          id: PROMPT_ID
        },
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: question
              }
            ]
          }
        ],
        stream: true,
        store: true,
        max_output_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // ============================================
    // 9. STREAM RESPONSE
    // ============================================
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          console.error('OpenAI response has no readable body', {
            email,
            question: question.substring(0, 50),
            responseStatus: response.status
          });
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'error',
            message: 'Failed to receive response from AI service. Please try again.'
          })}\n\n`));
          controller.close();
          return;
        }

        let lineBuffer = '';
        let responseText = '';

        try {
          // Send initial event with remaining count
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'started',
            remaining
          })}\n\n`));

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            lineBuffer += new TextDecoder().decode(value);
            const parts = lineBuffer.split('\n');
            lineBuffer = parts.pop() || '';

            for (const line of parts) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);

                  // Responses API format - handle multiple event types
                  if (parsed.type === 'response.output_text.delta') {
                    responseText += parsed.delta;
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'text_delta',
                      delta: parsed.delta
                    })}\n\n`));
                  } else if (parsed.type === 'response.content_part.delta') {
                    // Alternative event type for text streaming
                    const text = parsed.delta?.text || parsed.delta;
                    if (text) {
                      responseText += text;
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                        type: 'text_delta',
                        delta: text
                      })}\n\n`));
                    }
                  } else if (parsed.type === 'response.output_item.done') {
                    // Extract text from output item
                    const content = parsed.item?.content?.[0]?.text || parsed.item?.text;
                    if (content && !responseText) {
                      responseText = content;
                    }
                  } else if (parsed.type === 'response.completed' ||
                             parsed.type === 'response.done' ||
                             parsed.type === 'response.output_text.done') {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'complete',
                      remaining,
                      content: responseText
                    })}\n\n`));
                  }
                } catch (parseError) {
                  // Log parse errors for debugging but continue processing
                  // Single malformed line shouldn't break the entire stream
                  console.warn('Failed to parse SSE data line:', {
                    data: data.substring(0, 100),
                    error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
                  });
                }
              }
            }
          }

          // Safety: ensure complete event is sent
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'complete',
            remaining,
            content: responseText
          })}\n\n`));

        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'error',
            message: 'An error occurred while generating the response.'
          })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in demo-chat function:', error);
    return new Response(
      JSON.stringify({ error: 'server_error', message: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
