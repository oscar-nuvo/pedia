/**
 * File Deletion Utilities
 * Handles permanent deletion of uploaded files from OpenAI and database
 */

export interface DeleteFileResult {
  success: boolean;
  fileId: string;
  deletedFromOpenAI: boolean;
  deletedFromDatabase: boolean;
  error?: string;
}

/**
 * Delete a file from a conversation
 * Removes from both OpenAI Files API and Supabase database
 *
 * @param fileId - ID of file record in database
 * @param conversationId - ID of conversation containing the file
 * @param authToken - User's authentication token
 * @param supabaseUrl - Supabase project URL
 * @returns Result of deletion operation
 */
export const deleteConversationFile = async (
  fileId: string,
  conversationId: string,
  authToken: string,
  supabaseUrl: string
): Promise<DeleteFileResult> => {
  try {
    if (!fileId || !conversationId) {
      throw new Error('Missing fileId or conversationId');
    }

    // ✅ TIMEOUT PROTECTION: 30-second limit (consistent with upload pattern)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/delete-conversation-file`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileId,
            conversationId,
          }),
          signal: controller.signal,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('File deletion failed', {
          status: response.status,
          fileId,
          conversationId,
          errorMessage: data.error,
        });

        return {
          success: false,
          fileId,
          deletedFromOpenAI: false,
          deletedFromDatabase: false,
          error: data.error || `HTTP ${response.status}: ${data.details || 'Unknown error'}`,
        };
      }

      console.log('File deleted successfully', {
        fileId,
        conversationId,
        deletedFromOpenAI: data.deletedFromOpenAI,
        deletedFromDatabase: data.deletedFromDatabase,
      });

      return {
        success: true,
        fileId,
        deletedFromOpenAI: data.deletedFromOpenAI,
        deletedFromDatabase: data.deletedFromDatabase,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('File deletion error', {
      fileId,
      conversationId,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      fileId,
      deletedFromOpenAI: false,
      deletedFromDatabase: false,
      error: errorMessage,
    };
  }
};

/**
 * Delete multiple files from a conversation
 * Files are deleted sequentially to avoid overwhelming the API and ensure proper error tracking
 *
 * @param fileIds - Array of file IDs to delete
 * @param conversationId - ID of conversation
 * @param authToken - User's authentication token
 * @param supabaseUrl - Supabase project URL
 * @returns Array of deletion results (one per file, order preserved)
 */
export const deleteConversationFiles = async (
  fileIds: string[],
  conversationId: string,
  authToken: string,
  supabaseUrl: string
): Promise<DeleteFileResult[]> => {
  const results: DeleteFileResult[] = [];

  for (const fileId of fileIds) {
    try {
      const result = await deleteConversationFile(
        fileId,
        conversationId,
        authToken,
        supabaseUrl
      );
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        fileId,
        deletedFromOpenAI: false,
        deletedFromDatabase: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
};
