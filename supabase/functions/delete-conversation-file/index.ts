import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Delete a file from a conversation
 * Removes from OpenAI Files API and database
 *
 * Security: Verifies user ownership of conversation before deletion
 */

const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = [
    'https://pedia-app.vercel.app',
    'https://staging.pedia-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Function uses POST with JSON body
    'Access-Control-Max-Age': '86400',
  };
};

serve(async (req) => {
  // Get origin for CORS
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin || undefined);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { conversationId, fileId } = await req.json();

    if (!conversationId || !fileId) {
      return new Response(
        JSON.stringify({ error: 'Missing conversationId or fileId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ SECURE: Get credentials from environment (never hardcoded)
    const openaiApiKey = Deno.env.get('PediaAIKey');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured. Set PediaAIKey in Supabase Secrets.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // SECURITY: Authenticate user - explicit null check to return proper 401 instead of 500
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

    console.log('Delete file requested', {
      userId: user.id,
      conversationId,
      fileId,
    });

    // ✅ SECURITY: Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (conversation.user_id !== user.id) {
      console.error('Unauthorized file deletion attempt', {
        userId: user.id,
        conversationOwnerId: conversation.user_id,
        fileId,
      });
      return new Response(
        JSON.stringify({ error: 'Not authorized to delete file from this conversation' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get file record from database
    const { data: fileRecord, error: fileError } = await supabase
      .from('conversation_files')
      .select('openai_file_id')
      .eq('id', fileId)
      .eq('conversation_id', conversationId)
      .single();

    if (fileError || !fileRecord) {
      return new Response(
        JSON.stringify({ error: 'File record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiFileId = fileRecord.openai_file_id;

    // Step 1: Delete from OpenAI Files API (optional - files can persist, but clean up is good practice)
    let openaiDeleteResult = { success: false, skipped: false, error: null as string | null };

    try {
      console.log('Deleting file from OpenAI', { openaiFileId });

      const openaiResponse = await fetch(`https://api.openai.com/v1/files/${openaiFileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      });

      if (openaiResponse.ok) {
        openaiDeleteResult.success = true;
        console.log('File deleted from OpenAI', { openaiFileId });
      } else if (openaiResponse.status === 404) {
        // File already deleted or doesn't exist - treat as success (idempotent)
        console.warn('File not found in OpenAI (already deleted?)', { openaiFileId });
        openaiDeleteResult.skipped = true;
        openaiDeleteResult.success = true; // Consider 404 as successful cleanup
      } else {
        const errorData = await openaiResponse.text();
        openaiDeleteResult.error = `OpenAI API error (${openaiResponse.status}): ${errorData}`;
        console.error('OpenAI deletion error', {
          status: openaiResponse.status,
          error: errorData,
          fileId: openaiFileId,
        });
        // Continue to delete from database - but track the failure
      }
    } catch (openaiError) {
      openaiDeleteResult.error = openaiError instanceof Error ? openaiError.message : String(openaiError);
      console.error('Error calling OpenAI delete API', {
        error: openaiDeleteResult.error,
        fileId: openaiFileId,
      });
      // Continue to delete from database - but track the failure
    }

    // Step 2: Delete from Supabase database (primary action)
    const { error: dbError } = await supabase
      .from('conversation_files')
      .delete()
      .eq('id', fileId)
      .eq('conversation_id', conversationId);

    if (dbError) {
      console.error('Database deletion error', {
        error: dbError,
        fileId,
        conversationId,
      });
      return new Response(
        JSON.stringify({
          error: 'Failed to delete file from database',
          details: dbError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('File deletion complete', {
      fileId,
      conversationId,
      userId: user.id,
      openaiDeleted: openaiDeleteResult.success,
      openaiSkipped: openaiDeleteResult.skipped,
      openaiError: openaiDeleteResult.error,
    });

    // Determine response status based on partial success
    // 200 = full success, 207 = partial success (DB deleted but OpenAI failed)
    const isPartialSuccess = !openaiDeleteResult.success && openaiDeleteResult.error;
    const httpStatus = isPartialSuccess ? 207 : 200;

    return new Response(
      JSON.stringify({
        success: true, // DB deletion succeeded
        fileId,
        deletedFromOpenAI: openaiDeleteResult.success,
        deletedFromDatabase: true,
        openaiSkipped: openaiDeleteResult.skipped,
        // Include warning for partial success so client knows file may persist in OpenAI
        ...(isPartialSuccess && {
          warning: 'File removed from conversation but may still exist in OpenAI storage',
          openaiError: openaiDeleteResult.error,
        }),
        message: isPartialSuccess
          ? 'File removed from conversation (OpenAI cleanup failed - file may persist in storage)'
          : 'File deleted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: httpStatus }
    );

  } catch (error) {
    // ✅ IMPROVED ERROR CATEGORIZATION: Distinguish between client and server errors
    const errorType = error?.constructor?.name || 'UnknownError';
    const isClientError = [
      'SyntaxError',      // Invalid JSON in request body
      'TypeError',        // Invalid parameter types
    ].includes(errorType);

    const statusCode = isClientError ? 400 : 500;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('Delete file error - unexpected', {
      errorType,
      errorMessage,
      statusCode,
      isClientError,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        error: isClientError ? 'Invalid request' : 'Internal server error',
        details: errorMessage,
        errorCode: errorType,
      }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
