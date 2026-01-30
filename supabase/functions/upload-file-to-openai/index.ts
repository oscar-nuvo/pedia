import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Get CORS headers with restricted origin
 * Restricts requests to your own domain to prevent abuse
 */
const getCorsHeaders = (origin?: string) => {
  // List of allowed origins - update to match your domains
  const allowedOrigins = [
    'https://pedia-app.vercel.app',  // Production
    'https://staging.pedia-app.vercel.app', // Staging
    'http://localhost:3000',  // Local dev
    'http://localhost:5173',  // Vite dev server
    'http://localhost:8080',  // Vite dev server (configured port)
  ];

  // Check if origin is allowed
  const isAllowed = origin && allowedOrigins.includes(origin);

  // Log warning for unknown origins to help debug CORS issues in new deployments
  if (origin && !isAllowed) {
    console.warn('CORS: Unknown origin attempted request', {
      origin,
      allowedOrigins,
      timestamp: new Date().toISOString(),
    });
  }

  // Default to first allowed origin for CORS header (request still processes, but browser blocks response)
  const corsOrigin = isAllowed ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

interface UploadResponse {
  file_id: string;
  filename: string;
  size_bytes: number;
  content_type: string;
  uploaded_at: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

serve(async (req) => {
  // Get origin for CORS
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin || undefined);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Parse form data from request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const conversationId = formData.get('conversationId') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: 'No conversation ID provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Get OpenAI API key from Supabase Secrets (never hardcoded)
    // Set this in Supabase dashboard: Project Settings → Secrets/Environment Variables
    const openaiApiKey = Deno.env.get('PediaAIKey');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openaiApiKey) {
      console.error('OpenAI API key not configured in Supabase Secrets');
      throw new Error('OpenAI API key not configured. Set PediaAIKey in Supabase Secrets.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user - explicit null check to return proper 401 instead of 500
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Server-side file validation (real security happens here)
    // Client-side validation is just UX - server must validate everything

    // Validate file size (20MB max)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`File size validation failed: ${file.name} (${file.size} bytes)`);
      return new Response(
        JSON.stringify({
          error: `File too large. Maximum size: 20MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size minimum (prevent empty files)
    const MIN_FILE_SIZE = 1; // 1 byte minimum
    if (file.size < MIN_FILE_SIZE) {
      console.warn(`File too small: ${file.name} (${file.size} bytes)`);
      return new Response(
        JSON.stringify({
          error: 'File is empty. Please provide a file with content.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type (whitelist approach - more secure)
    // OpenAI supported types:
    // - Images (input_image): JPEG, PNG, GIF, WebP
    // - Documents (input_file): PDF only
    const ALLOWED_TYPES = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      console.warn(`File type validation failed: ${file.name} (${file.type})`);
      return new Response(
        JSON.stringify({
          error: `File type not supported. Allowed types: PDF, Images (JPEG, PNG, GIF, WebP)`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate filename (prevent directory traversal)
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      console.warn(`Invalid filename: ${file.name}`);
      return new Response(
        JSON.stringify({
          error: 'Invalid filename. Please use a standard filename without path characters.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Create FormData for OpenAI Files API
    // Use 'vision' purpose for images, 'assistants' for documents
    const isImage = file.type.startsWith('image/');
    const purpose = isImage ? 'vision' : 'assistants';

    const openaiFormData = new FormData();
    openaiFormData.append('file', new Blob([buffer], { type: file.type }), file.name);
    openaiFormData.append('purpose', purpose);

    // Log with structured format for better debugging
    console.log('Upload to OpenAI started', {
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type,
      conversationId: conversationId,
      userId: user.id,
    });

    // Upload to OpenAI Files API
    const openaiResponse = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: openaiFormData,
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI Files API error', {
        status: openaiResponse.status,
        fileName: file.name,
        fileSizeBytes: file.size,
        error: errorData,
        userId: user.id,
      });

      if (openaiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: 'Upload service is busy. Please try again in a moment.',
            details: 'Rate limit exceeded'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          error: 'Failed to upload file to OpenAI',
          details: errorData
        }),
        { status: openaiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData: any = await openaiResponse.json();
    const fileId = openaiData.id;

    console.log('File uploaded to OpenAI successfully', {
      fileName: file.name,
      fileId: fileId,
      fileSizeBytes: file.size,
      conversationId: conversationId,
      userId: user.id,
    });

    // Store file metadata in Supabase
    const { data: fileRecord, error: dbError } = await supabase
      .from('conversation_files')
      .insert({
        conversation_id: conversationId,
        openai_file_id: fileId,
        filename: file.name,
        content_type: file.type,
        size_bytes: file.size,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error storing file metadata', {
        fileName: file.name,
        fileId: fileId,
        error: dbError.message,
        userId: user.id,
      });
      // CRITICAL: If DB fails, the chat function won't know the file's content type
      // This would cause images to be sent as documents, breaking the OpenAI API call
      // Fail the upload to ensure data consistency
      return new Response(
        JSON.stringify({
          error: 'Failed to save file metadata. Please try again.',
          details: dbError.message,
          // Include the OpenAI file ID in case manual recovery is needed
          openai_file_id: fileId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response: UploadResponse = {
      file_id: fileId,
      filename: file.name,
      size_bytes: file.size,
      content_type: file.type,
      uploaded_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Upload error - unexpected', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name,
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };

    return new Response(
      JSON.stringify(errorResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
