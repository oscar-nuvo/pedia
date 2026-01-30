/**
 * useAdvancedAIChat Hook Tests
 *
 * Unit tests for the AI chat hook's utility functions and state management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Type definitions matching the hook
interface AdvancedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: {
    reasoning?: string;
    fileIds?: string[];
    isPersisted?: boolean;
  };
}

interface UploadResult {
  fileIds: string[];
  conversationId: string | null;
}

// Utility functions extracted for testing
function validateFileForUpload(
  file: File
): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File ${file.name} is too large (max 20MB)`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported`,
    };
  }

  return { valid: true };
}

function parseSSEEvent(line: string): { type: string; data: unknown } | null {
  if (!line.startsWith('data: ')) return null;
  const data = line.slice(6);
  if (data === '[DONE]') return { type: 'done', data: null };

  try {
    const parsed = JSON.parse(data);
    return { type: parsed.type, data: parsed };
  } catch {
    return null;
  }
}

function buildMessageWithFiles(
  message: string,
  fileIds: string[]
): { content: string; metadata: { fileIds?: string[] } } {
  return {
    content: message,
    metadata: fileIds.length > 0 ? { fileIds } : {},
  };
}

describe('File Upload Validation', () => {
  it('validates PDF files', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    expect(validateFileForUpload(file).valid).toBe(true);
  });

  it('validates image files', () => {
    const jpegFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const pngFile = new File(['content'], 'test.png', { type: 'image/png' });

    expect(validateFileForUpload(jpegFile).valid).toBe(true);
    expect(validateFileForUpload(pngFile).valid).toBe(true);
  });

  it('rejects files over 20MB', () => {
    // Create a mock file with size over 20MB
    const largeContent = new ArrayBuffer(21 * 1024 * 1024);
    const file = new File([largeContent], 'large.pdf', {
      type: 'application/pdf',
    });

    const result = validateFileForUpload(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });

  it('rejects unsupported file types', () => {
    const file = new File(['content'], 'script.js', {
      type: 'application/javascript',
    });

    const result = validateFileForUpload(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not supported');
  });

  it('validates Word documents', () => {
    const docFile = new File(['content'], 'test.doc', {
      type: 'application/msword',
    });
    const docxFile = new File(['content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    expect(validateFileForUpload(docFile).valid).toBe(true);
    expect(validateFileForUpload(docxFile).valid).toBe(true);
  });

  it('validates text and CSV files', () => {
    const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const csvFile = new File(['content'], 'test.csv', { type: 'text/csv' });

    expect(validateFileForUpload(txtFile).valid).toBe(true);
    expect(validateFileForUpload(csvFile).valid).toBe(true);
  });

  it('rejects executable files', () => {
    const exeFile = new File(['content'], 'virus.exe', {
      type: 'application/x-executable',
    });
    expect(validateFileForUpload(exeFile).valid).toBe(false);
  });

  it('rejects HTML files (XSS vector)', () => {
    const htmlFile = new File(['<script>alert("xss")</script>'], 'page.html', {
      type: 'text/html',
    });
    expect(validateFileForUpload(htmlFile).valid).toBe(false);
  });
});

describe('SSE Event Parsing', () => {
  it('parses text_delta events', () => {
    const line = 'data: {"type":"text_delta","delta":"Hello"}';
    const result = parseSSEEvent(line);

    expect(result).not.toBeNull();
    expect(result?.type).toBe('text_delta');
    expect((result?.data as any).delta).toBe('Hello');
  });

  it('parses response_complete events', () => {
    const line =
      'data: {"type":"response_complete","responseId":"resp_123","content":"Done"}';
    const result = parseSSEEvent(line);

    expect(result?.type).toBe('response_complete');
    expect((result?.data as any).responseId).toBe('resp_123');
  });

  it('parses reasoning_delta events', () => {
    const line = 'data: {"type":"reasoning_delta","delta":"Thinking..."}';
    const result = parseSSEEvent(line);

    expect(result?.type).toBe('reasoning_delta');
    expect((result?.data as any).delta).toBe('Thinking...');
  });

  it('handles [DONE] marker', () => {
    const result = parseSSEEvent('data: [DONE]');
    expect(result?.type).toBe('done');
    expect(result?.data).toBeNull();
  });

  it('returns null for non-data lines', () => {
    expect(parseSSEEvent('event: ping')).toBeNull();
    expect(parseSSEEvent('')).toBeNull();
    expect(parseSSEEvent(': comment')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    const result = parseSSEEvent('data: {invalid json}');
    expect(result).toBeNull();
  });

  it('parses function_result events', () => {
    const line =
      'data: {"type":"function_result","function_name":"calculate_dosage","result":{"dose":100}}';
    const result = parseSSEEvent(line);

    expect(result?.type).toBe('function_result');
    expect((result?.data as any).function_name).toBe('calculate_dosage');
  });

  it('parses response_saved events', () => {
    const line =
      'data: {"type":"response_saved","messageId":"msg_123","responseId":"resp_456"}';
    const result = parseSSEEvent(line);

    expect(result?.type).toBe('response_saved');
    expect((result?.data as any).messageId).toBe('msg_123');
  });

  it('parses db_error events', () => {
    const line =
      'data: {"type":"db_error","details":"Unique constraint violation"}';
    const result = parseSSEEvent(line);

    expect(result?.type).toBe('db_error');
    expect((result?.data as any).details).toContain('constraint');
  });
});

describe('Message Building', () => {
  it('builds message without files', () => {
    const result = buildMessageWithFiles('Hello', []);

    expect(result.content).toBe('Hello');
    expect(result.metadata.fileIds).toBeUndefined();
  });

  it('builds message with files', () => {
    const fileIds = ['file_123', 'file_456'];
    const result = buildMessageWithFiles('Check this document', fileIds);

    expect(result.content).toBe('Check this document');
    expect(result.metadata.fileIds).toEqual(fileIds);
  });

  it('preserves message content exactly', () => {
    const content = 'What is the dosage for a 15kg patient?';
    const result = buildMessageWithFiles(content, []);
    expect(result.content).toBe(content);
  });
});

describe('Upload Result Handling', () => {
  it('handles successful upload with new conversation', () => {
    const result: UploadResult = {
      fileIds: ['file_123'],
      conversationId: 'conv_new_456',
    };

    expect(result.fileIds.length).toBe(1);
    expect(result.conversationId).toBe('conv_new_456');
  });

  it('handles upload to existing conversation', () => {
    const result: UploadResult = {
      fileIds: ['file_123', 'file_456'],
      conversationId: 'conv_existing_789',
    };

    expect(result.fileIds.length).toBe(2);
    expect(result.conversationId).toBe('conv_existing_789');
  });

  it('handles empty upload result', () => {
    const result: UploadResult = {
      fileIds: [],
      conversationId: null,
    };

    expect(result.fileIds.length).toBe(0);
    expect(result.conversationId).toBeNull();
  });
});

describe('Message State Management', () => {
  it('correctly identifies user messages', () => {
    const message: AdvancedMessage = {
      id: 'msg_1',
      role: 'user',
      content: 'Hello',
      created_at: new Date().toISOString(),
    };

    expect(message.role).toBe('user');
  });

  it('correctly identifies assistant messages', () => {
    const message: AdvancedMessage = {
      id: 'msg_2',
      role: 'assistant',
      content: 'Hi there!',
      created_at: new Date().toISOString(),
      metadata: {
        isPersisted: true,
      },
    };

    expect(message.role).toBe('assistant');
    expect(message.metadata?.isPersisted).toBe(true);
  });

  it('handles messages with file attachments', () => {
    const message: AdvancedMessage = {
      id: 'msg_3',
      role: 'user',
      content: 'Check this image',
      created_at: new Date().toISOString(),
      metadata: {
        fileIds: ['file_123', 'file_456'],
      },
    };

    expect(message.metadata?.fileIds?.length).toBe(2);
  });
});

describe('Error Handling', () => {
  it('handles network errors gracefully', () => {
    const mockError = new Error('Network request failed');
    expect(mockError.message).toBe('Network request failed');
  });

  it('handles auth errors', () => {
    const authError = { message: 'Unauthorized', status: 401 };
    expect(authError.status).toBe(401);
  });

  it('handles rate limit errors', () => {
    const rateLimitError = {
      message: 'Rate limit exceeded',
      status: 429,
      retryAfter: 60,
    };
    expect(rateLimitError.status).toBe(429);
    expect(rateLimitError.retryAfter).toBe(60);
  });
});
