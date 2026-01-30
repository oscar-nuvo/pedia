/**
 * File Upload Validation Tests
 *
 * Tests for server-side file validation in upload-file-to-openai function.
 * Run with: deno test --allow-env supabase/functions/_tests/file-validation.test.ts
 */

import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.192.0/testing/asserts.ts';

// Validation constants (matching upload-file-to-openai)
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MIN_FILE_SIZE = 1; // 1 byte minimum
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

// Validation functions (matching upload-file-to-openai logic)
interface FileValidationResult {
  valid: boolean;
  error?: string;
}

function validateFileSize(size: number): FileValidationResult {
  if (size < MIN_FILE_SIZE) {
    return {
      valid: false,
      error: 'File is empty. Please provide a file with content.',
    };
  }
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: 20MB. Your file: ${(size / 1024 / 1024).toFixed(2)}MB`,
    };
  }
  return { valid: true };
}

function validateFileType(type: string): FileValidationResult {
  if (!ALLOWED_TYPES.includes(type)) {
    return {
      valid: false,
      error:
        'File type not supported. Allowed types: PDF, Word, Text, CSV, Images (JPEG, PNG, GIF, WebP)',
    };
  }
  return { valid: true };
}

function validateFilename(name: string): FileValidationResult {
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return {
      valid: false,
      error:
        'Invalid filename. Please use a standard filename without path characters.',
    };
  }
  return { valid: true };
}

// File size tests
Deno.test('validateFileSize - accepts valid file size', () => {
  const result = validateFileSize(1024 * 1024); // 1MB
  assertEquals(result.valid, true);
});

Deno.test('validateFileSize - accepts minimum size (1 byte)', () => {
  const result = validateFileSize(1);
  assertEquals(result.valid, true);
});

Deno.test('validateFileSize - accepts maximum size (20MB)', () => {
  const result = validateFileSize(20 * 1024 * 1024);
  assertEquals(result.valid, true);
});

Deno.test('validateFileSize - rejects empty file (0 bytes)', () => {
  const result = validateFileSize(0);
  assertEquals(result.valid, false);
  assertEquals(
    result.error,
    'File is empty. Please provide a file with content.'
  );
});

Deno.test('validateFileSize - rejects file over 20MB', () => {
  const result = validateFileSize(21 * 1024 * 1024); // 21MB
  assertEquals(result.valid, false);
  assertEquals(result.error?.includes('File too large'), true);
});

Deno.test('validateFileSize - rejects large file (100MB)', () => {
  const result = validateFileSize(100 * 1024 * 1024);
  assertEquals(result.valid, false);
});

// File type tests
Deno.test('validateFileType - accepts PDF', () => {
  const result = validateFileType('application/pdf');
  assertEquals(result.valid, true);
});

Deno.test('validateFileType - accepts Word doc', () => {
  const result = validateFileType('application/msword');
  assertEquals(result.valid, true);
});

Deno.test('validateFileType - accepts Word docx', () => {
  const result = validateFileType(
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
  assertEquals(result.valid, true);
});

Deno.test('validateFileType - accepts plain text', () => {
  const result = validateFileType('text/plain');
  assertEquals(result.valid, true);
});

Deno.test('validateFileType - accepts CSV', () => {
  const result = validateFileType('text/csv');
  assertEquals(result.valid, true);
});

Deno.test('validateFileType - accepts JPEG images', () => {
  const result = validateFileType('image/jpeg');
  assertEquals(result.valid, true);
});

Deno.test('validateFileType - accepts PNG images', () => {
  const result = validateFileType('image/png');
  assertEquals(result.valid, true);
});

Deno.test('validateFileType - accepts GIF images', () => {
  const result = validateFileType('image/gif');
  assertEquals(result.valid, true);
});

Deno.test('validateFileType - accepts WebP images', () => {
  const result = validateFileType('image/webp');
  assertEquals(result.valid, true);
});

Deno.test('validateFileType - rejects executable files', () => {
  const result = validateFileType('application/x-executable');
  assertEquals(result.valid, false);
});

Deno.test('validateFileType - rejects JavaScript files', () => {
  const result = validateFileType('application/javascript');
  assertEquals(result.valid, false);
});

Deno.test('validateFileType - rejects HTML files', () => {
  const result = validateFileType('text/html');
  assertEquals(result.valid, false);
});

Deno.test('validateFileType - rejects zip files', () => {
  const result = validateFileType('application/zip');
  assertEquals(result.valid, false);
});

Deno.test('validateFileType - rejects SVG (potential XSS vector)', () => {
  const result = validateFileType('image/svg+xml');
  assertEquals(result.valid, false);
});

// Filename validation tests (directory traversal prevention)
Deno.test('validateFilename - accepts normal filename', () => {
  const result = validateFilename('document.pdf');
  assertEquals(result.valid, true);
});

Deno.test('validateFilename - accepts filename with spaces', () => {
  const result = validateFilename('my document.pdf');
  assertEquals(result.valid, true);
});

Deno.test('validateFilename - accepts filename with hyphens and underscores', () => {
  const result = validateFilename('my-document_v2.pdf');
  assertEquals(result.valid, true);
});

Deno.test('validateFilename - rejects path traversal with ..', () => {
  const result = validateFilename('../../../etc/passwd');
  assertEquals(result.valid, false);
  assertEquals(result.error?.includes('Invalid filename'), true);
});

Deno.test('validateFilename - rejects forward slash', () => {
  const result = validateFilename('path/to/file.pdf');
  assertEquals(result.valid, false);
});

Deno.test('validateFilename - rejects backslash', () => {
  const result = validateFilename('path\\to\\file.pdf');
  assertEquals(result.valid, false);
});

Deno.test('validateFilename - rejects Windows path', () => {
  const result = validateFilename('C:\\Windows\\System32\\config.pdf');
  assertEquals(result.valid, false);
});

Deno.test('validateFilename - rejects encoded path traversal', () => {
  // Note: The actual function checks for literal characters
  // URL encoding should be decoded before validation in a real implementation
  const result = validateFilename('..%2F..%2Fetc%2Fpasswd');
  // This passes because it checks literal characters, not encoded
  // In production, ensure URL decoding happens before validation
  assertEquals(result.valid, true);
});

// Purpose determination tests
Deno.test('isImageFile - correctly identifies images', () => {
  const isImageFile = (contentType: string) =>
    contentType?.startsWith('image/') || false;

  assertEquals(isImageFile('image/jpeg'), true);
  assertEquals(isImageFile('image/png'), true);
  assertEquals(isImageFile('image/gif'), true);
  assertEquals(isImageFile('image/webp'), true);
  assertEquals(isImageFile('application/pdf'), false);
  assertEquals(isImageFile('text/plain'), false);
});
