import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateFile,
  validateFiles,
  formatFileSize,
  getDisplayFileName,
  getFileIcon,
} from '../fileUpload';

describe('fileUpload utilities', () => {
  describe('validateFile', () => {
    it('should accept valid PDF files', () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const result = validateFile(file);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid Word documents', () => {
      const docFile = new File(['content'], 'document.doc', { type: 'application/msword' });
      const docxFile = new File(['content'], 'document.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      expect(validateFile(docFile).isValid).toBe(true);
      expect(validateFile(docxFile).isValid).toBe(true);
    });

    it('should accept valid image files', () => {
      const jpegFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
      const pngFile = new File(['content'], 'image.png', { type: 'image/png' });
      const gifFile = new File(['content'], 'image.gif', { type: 'image/gif' });
      const webpFile = new File(['content'], 'image.webp', { type: 'image/webp' });

      expect(validateFile(jpegFile).isValid).toBe(true);
      expect(validateFile(pngFile).isValid).toBe(true);
      expect(validateFile(gifFile).isValid).toBe(true);
      expect(validateFile(webpFile).isValid).toBe(true);
    });

    it('should accept valid text files', () => {
      const txtFile = new File(['content'], 'document.txt', { type: 'text/plain' });
      const csvFile = new File(['content'], 'data.csv', { type: 'text/csv' });

      expect(validateFile(txtFile).isValid).toBe(true);
      expect(validateFile(csvFile).isValid).toBe(true);
    });

    it('should reject files larger than 20MB', () => {
      const largeFile = new File(
        [new ArrayBuffer(21 * 1024 * 1024)],
        'large.pdf',
        { type: 'application/pdf' }
      );

      const result = validateFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too large');
      expect(result.error).toContain('20MB');
    });

    it('should reject unsupported file types', () => {
      const exeFile = new File(['content'], 'virus.exe', { type: 'application/x-msdownload' });
      const result = validateFile(exeFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should provide helpful error message for unsupported types', () => {
      const result = validateFile(new File(['content'], 'file.xyz', { type: 'application/xyz' }));
      expect(result.error).toContain('PDF');
      expect(result.error).toContain('Word');
      expect(result.error).toContain('Images');
    });

    it('should accept 20MB file exactly', () => {
      const buffer = new ArrayBuffer(20 * 1024 * 1024);
      const file = new File([buffer], 'exact.pdf', { type: 'application/pdf' });
      const result = validateFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should reject file just over 20MB', () => {
      const buffer = new ArrayBuffer(20 * 1024 * 1024 + 1);
      const file = new File([buffer], 'over.pdf', { type: 'application/pdf' });
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateFiles', () => {
    it('should separate valid and invalid files', () => {
      const files = [
        new File(['content'], 'valid.pdf', { type: 'application/pdf' }),
        new File(['content'], 'invalid.exe', { type: 'application/x-msdownload' }),
        new File(['content'], 'valid.txt', { type: 'text/plain' }),
      ];

      const result = validateFiles(files);
      expect(result.valid).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].filename).toBe('invalid.exe');
    });

    it('should return empty arrays for empty input', () => {
      const result = validateFiles([]);
      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should include error messages', () => {
      const files = [new File(['content'], 'file.xyz', { type: 'application/xyz' })];
      const result = validateFiles(files);

      expect(result.errors[0]).toHaveProperty('filename');
      expect(result.errors[0]).toHaveProperty('error');
      expect(result.errors[0].error).toContain('not supported');
    });

    it('should validate all files correctly', () => {
      const files = [
        new File(['content'], 'doc1.pdf', { type: 'application/pdf' }),
        new File(['content'], 'doc2.pdf', { type: 'application/pdf' }),
        new File(['content'], 'doc3.pdf', { type: 'application/pdf' }),
      ];

      const result = validateFiles(files);
      expect(result.valid).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(512)).toBe('512 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimal sizes', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1536 * 1024)).toBe('1.5 MB');
    });

    it('should handle large files', () => {
      const twentyMB = 20 * 1024 * 1024;
      expect(formatFileSize(twentyMB)).toBe('20 MB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1234 * 1024)).toMatch(/1\.\d{1,2} MB/);
    });
  });

  describe('getDisplayFileName', () => {
    it('should return short filenames as-is', () => {
      expect(getDisplayFileName('document.pdf')).toBe('document.pdf');
      expect(getDisplayFileName('file.txt')).toBe('file.txt');
    });

    it('should truncate long filenames', () => {
      const longName = 'this_is_a_very_long_filename_that_exceeds_the_limit.pdf';
      const result = getDisplayFileName(longName);

      expect(result.length).toBeLessThanOrEqual(30);
      expect(result).toContain('...');
      expect(result).toMatch(/\.pdf$/);
    });

    it('should preserve file extension', () => {
      const longName = 'a'.repeat(40) + '.docx';
      const result = getDisplayFileName(longName);

      expect(result).toMatch(/\.docx$/);
    });

    it('should use custom max length', () => {
      const longName = 'very_long_filename.pdf';
      const result = getDisplayFileName(longName, 10);

      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should handle filenames without extension', () => {
      const name = 'a'.repeat(50);
      const result = getDisplayFileName(name);

      expect(result.length).toBeLessThanOrEqual(30);
      expect(result).toContain('...');
    });
  });

  describe('getFileIcon', () => {
    it('should return correct icon for PDF', () => {
      expect(getFileIcon('application/pdf')).toBe('pdf');
    });

    it('should return correct icon for Word documents', () => {
      expect(getFileIcon('application/msword')).toBe('doc');
      expect(
        getFileIcon('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      ).toBe('doc');
    });

    it('should return correct icon for images', () => {
      expect(getFileIcon('image/jpeg')).toBe('image');
      expect(getFileIcon('image/png')).toBe('image');
      expect(getFileIcon('image/gif')).toBe('image');
    });

    it('should return correct icon for text files', () => {
      expect(getFileIcon('text/plain')).toBe('text');
      expect(getFileIcon('text/csv')).toBe('csv');
    });

    it('should return default icon for unknown types', () => {
      expect(getFileIcon('application/unknown')).toBe('file');
    });
  });
});
