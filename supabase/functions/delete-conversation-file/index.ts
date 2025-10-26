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
  ];

  const corsOrigin = (origin && allowedOrigins.includes(origin))
    ? origin
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, content-type',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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

    // ✅ SECURITY: Authenticate user
    const authHeader = req.headers.get('Authorization')!;
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
    let openaiDeleteResult = { success: false, skipped: false };

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
        // File already deleted or doesn't exist - not an error
        console.warn('File not found in OpenAI (already deleted?)', { openaiFileId });
        openaiDeleteResult.skipped = true;
      } else {
        const errorData = await openaiResponse.text();
        console.error('OpenAI deletion error', {
          status: openaiResponse.status,
          error: errorData,
          fileId: openaiFileId,
        });
        // Don't throw - continue to delete from database anyway
      }
    } catch (openaiError) {
      console.error('Error calling OpenAI delete API', {
        error: openaiError instanceof Error ? openaiError.message : String(openaiError),
        fileId: openaiFileId,
      });
      // Don't throw - continue to delete from database anyway
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
    });

    return new Response(
      JSON.stringify({
        success: true,
        fileId,
        deletedFromOpenAI: openaiDeleteResult.success,
        deletedFromDatabase: true,
        message: 'File deleted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
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
