/**
 * File Upload Utilities for Document Upload Feature
 * Handles validation, upload to OpenAI, and error management
 */

export interface UploadFileMetadata {
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  openaiFileId?: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Constants
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.csv', '.jpg', '.jpeg', '.png', '.gif', '.webp'];

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second initial delay, exponential backoff

/**
 * Validates a file before upload
 * @param file - File to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      isValid: false,
      error: `File too large (${sizeMB}MB). Maximum size: 20MB.`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !ALLOWED_EXTENSIONS.includes(`.${extension}`)) {
      return {
        isValid: false,
        error: 'File type not supported. Supported types: PDF, Word, Text, CSV, Images (JPEG, PNG, GIF, WebP)'
      };
    }
  }

  return { isValid: true };
};

/**
 * Validates multiple files
 * @param files - Files to validate
 * @returns Object with valid files and errors for invalid ones
 */
export const validateFiles = (files: File[]): {
  valid: File[];
  errors: { filename: string; error: string }[];
} => {
  const valid: File[] = [];
  const errors: { filename: string; error: string }[] = [];

  for (const file of files) {
    const validation = validateFile(file);
    if (validation.isValid) {
      valid.push(file);
    } else {
      errors.push({
        filename: file.name,
        error: validation.error || 'Unknown error'
      });
    }
  }

  return { valid, errors };
};

/**
 * Uploads a single file to OpenAI via Edge Function with retry logic and progress tracking
 * @param file - File to upload
 * @param conversationId - ID of the conversation
 * @param authToken - Authentication token for the API call
 * @param supabaseUrl - Supabase project URL
 * @param anonKey - Supabase anonymous key (from environment)
 * @param onProgress - Callback for progress updates
 * @returns Promise with file ID from OpenAI
 */
export const uploadFileToOpenAI = async (
  file: File,
  conversationId: string,
  authToken: string,
  supabaseUrl: string,
  anonKey: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  // Use crypto.randomUUID() for better uniqueness
  const fileId = crypto.randomUUID();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Notify progress
      onProgress?.({
        fileId,
        progress: attempt === 0 ? 0 : (attempt / (MAX_RETRIES + 1)) * 50,
        status: 'uploading',
      });

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      // Upload to Edge Function - NO HARDCODED CREDENTIALS
      // Auth handled via Bearer token and Supabase SDK
      const response = await fetch(
        `${supabaseUrl}/functions/v1/upload-file-to-openai`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            // Note: Edge Function uses PediaAIKey from Supabase Secrets
            // No credentials sent from client
          },
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // Handle response
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || `Upload failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      // Success - return OpenAI file ID
      onProgress?.({
        fileId,
        progress: 100,
        status: 'success',
      });

      return data.file_id;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));

      const isLastAttempt = attempt === MAX_RETRIES;
      const isRateLimitError = lastError.message.includes('Rate limit') || lastError.message.includes('429');
      const isTimeoutError = lastError.name === 'AbortError';

      if (isLastAttempt) {
        // All retries exhausted
        const userFriendlyError = isTimeoutError
          ? 'Upload timed out - network too slow. Check your connection and try again.'
          : lastError.message;

        onProgress?.({
          fileId,
          progress: 0,
          status: 'error',
          error: userFriendlyError,
        });
        throw new Error(userFriendlyError);
      }

      // Calculate backoff delay
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
      const backoffMs = isRateLimitError ? delay * 2 : delay; // Double delay for rate limits

      // Better logging with full context
      console.warn('Upload failed with retry', {
        fileName: file.name,
        attempt: attempt + 1,
        maxAttempts: MAX_RETRIES + 1,
        error: lastError.message,
        isTimeout: isTimeoutError,
        isRateLimit: isRateLimitError,
        retryInMs: backoffMs,
        stack: lastError.stack,
      });

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // Should not reach here, but just in case
  throw lastError || new Error('File upload failed');
};

/**
 * Uploads multiple files sequentially with progress tracking
 * @param files - Files to upload
 * @param conversationId - ID of the conversation
 * @param authToken - Authentication token for the API call
 * @param supabaseUrl - Supabase project URL
 * @param anonKey - Supabase anonymous key (from environment)
 * @param onProgress - Callback for progress updates
 * @returns Promise with array of file IDs from OpenAI
 */
export const uploadFilesToOpenAI = async (
  files: File[],
  conversationId: string,
  authToken: string,
  supabaseUrl: string,
  anonKey: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string[]> => {
  const uploadedFileIds: string[] = [];

  for (const file of files) {
    try {
      const fileId = await uploadFileToOpenAI(
        file,
        conversationId,
        authToken,
        supabaseUrl,
        anonKey,
        onProgress
      );
      uploadedFileIds.push(fileId);
    } catch (error) {
      // Log error with full context
      console.error('Failed to upload file:', {
        fileName: file.name,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error; // Stop on first failure
    }
  }

  return uploadedFileIds;
};

/**
 * Gets file display name with truncation for long names
 * @param filename - Original filename
 * @param maxLength - Maximum length (default: 30)
 * @returns Truncated filename with ellipsis if needed
 */
export const getDisplayFileName = (filename: string, maxLength: number = 30): string => {
  if (filename.length <= maxLength) {
    return filename;
  }

  const ext = filename.split('.').pop();
  const name = filename.slice(0, filename.lastIndexOf('.'));
  const truncatedName = name.slice(0, maxLength - 3 - (ext?.length || 0));

  return `${truncatedName}...${ext ? '.' + ext : ''}`;
};

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted size string (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Gets file icon based on MIME type
 * @param mimeType - File MIME type
 * @returns Icon name or component type
 */
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word')) return 'doc';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('text')) return 'text';
  if (mimeType.includes('csv')) return 'csv';
  return 'file';
};
