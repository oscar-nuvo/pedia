import React, { useCallback, useMemo } from 'react';
import { X, Upload, AlertCircle, CheckCircle, Loader, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  UploadFileMetadata,
  validateFile,
  formatFileSize,
  getFileIcon,
  getDisplayFileName
} from '@/utils/fileUpload';

interface FileUploadPanelProps {
  files: UploadFileMetadata[];
  onRemoveFile: (index: number) => void;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const getStatusIcon = (status: UploadFileMetadata['status']) => {
  switch (status) {
    case 'pending':
      return <Paperclip className="w-4 h-4 text-gray-400" />;
    case 'uploading':
      return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
  }
};

const getStatusText = (status: UploadFileMetadata['status']): string => {
  switch (status) {
    case 'pending':
      return 'Ready';
    case 'uploading':
      return 'Uploading...';
    case 'success':
      return 'Uploaded';
    case 'error':
      return 'Failed';
  }
};

const FileUploadItem: React.FC<{
  file: UploadFileMetadata;
  onRemove: () => void;
}> = ({ file, onRemove }) => {
  const displayName = getDisplayFileName(file.name);
  const isCompleted = file.status === 'success' || file.status === 'error';

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* File icon and info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-shrink-0">
            {getStatusIcon(file.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                {displayName}
              </span>
              <Badge
                variant={
                  file.status === 'success' ? 'default' :
                  file.status === 'error' ? 'destructive' :
                  file.status === 'uploading' ? 'secondary' :
                  'outline'
                }
                className="text-xs"
              >
                {getStatusText(file.status)}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatFileSize(file.size)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {file.status === 'uploading' && (
          <div className="space-y-1">
            <Progress value={file.progress} className="h-1.5" />
            <div className="text-xs text-gray-500 text-right">
              {Math.round(file.progress)}%
            </div>
          </div>
        )}

        {/* Error message */}
        {file.status === 'error' && file.error && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400">
            {file.error}
          </div>
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        disabled={file.status === 'uploading'}
        className="flex-shrink-0 mt-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Remove file"
        aria-label={`Remove ${file.name}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const FileUploadPanel: React.FC<FileUploadPanelProps> = ({
  files,
  onRemoveFile,
  onFilesSelected,
  disabled = false
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      // Reset input to allow re-selecting the same file
      e.target.value = '';
    }
  }, [onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      onFilesSelected(droppedFiles);
    }
  }, [onFilesSelected]);

  const hasFiles = files.length > 0;
  const isUploading = files.some(f => f.status === 'uploading');
  const allUploaded = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');
  const successCount = files.filter(f => f.status === 'success').length;
  const failedCount = files.filter(f => f.status === 'error').length;

  // Summary text
  const summarText = useMemo(() => {
    if (!hasFiles) return null;

    if (isUploading) {
      return `Uploading ${files.filter(f => f.status === 'uploading').length} of ${files.length} files...`;
    }

    if (allUploaded) {
      if (failedCount > 0) {
        return `${successCount} uploaded, ${failedCount} failed`;
      }
      return `${successCount} file${successCount === 1 ? '' : 's'} ready to submit`;
    }

    return `${files.length} file${files.length === 1 ? '' : 's'} ready to upload`;
  }, [hasFiles, isUploading, files.length, successCount, failedCount, allUploaded]);

  return (
    <div className="space-y-3">
      {/* File input (hidden) */}
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
        accept=".pdf,.doc,.docx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp"
        className="hidden"
        aria-label="Upload files"
      />

      {/* Upload button and drag-drop zone */}
      <div
        role="region"
        aria-label="File upload area - drag and drop files or click to browse"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          disabled || isUploading
            ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 cursor-not-allowed'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer'
        }`}
      >
        <button
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className="w-full flex flex-col items-center gap-2"
        >
          <Upload className="w-5 h-5 text-gray-400" />
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Documents
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            PDF, Word, Text, CSV, Images (max 20MB each)
          </div>
        </button>
      </div>

      {/* File list */}
      {hasFiles && (
        <div className="space-y-2">
          {/* Summary */}
          {summarText && (
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {summarText}
            </div>
          )}

          {/* Individual files */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <FileUploadItem
                // Use combination of file properties and index for stable key
                // Note: In production, consider adding id field to UploadFileMetadata
                key={`${file.name}-${file.size}-${file.type}-${index}`}
                file={file}
                onRemove={() => onRemoveFile(index)}
              />
            ))}
          </div>

          {/* Error summary */}
          {failedCount > 0 && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {failedCount} file{failedCount === 1 ? '' : 's'} failed to upload. You can remove them and try again.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Help text */}
      {!hasFiles && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
          Drag files here or click to browse
        </div>
      )}
    </div>
  );
};

export default FileUploadPanel;
