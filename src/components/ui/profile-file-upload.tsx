"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { uploadFileViaAPI, deleteFile, validateFile, FileUploadResult, FileUploadProgress } from '@/lib/utils/file-upload';
import { cn } from '@/lib/utils';

interface ProfileFileUploadProps {
  type: 'resume' | 'certification';
  value?: string | string[]; // URL or array of URLs
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
  required?: boolean;
}

interface UploadedFile {
  url: string;
  publicUrl: string;
  fileName: string;
  originalName: string;
  size: number;
  uploadedAt: Date;
}

export const ProfileFileUpload: React.FC<ProfileFileUploadProps> = ({
  type,
  value,
  onChange,
  multiple = false,
  disabled = false,
  className,
  label,
  description,
  required = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert value to array for consistent handling
  const files: UploadedFile[] = React.useMemo(() => {
    if (!value) return [];
    
    const urls = Array.isArray(value) ? value : [value];
    return urls.map(url => ({
      url,
      publicUrl: url,
      fileName: url.split('/').pop() || 'Unknown file',
      originalName: url.split('/').pop()?.split('-').slice(1).join('-') || 'Unknown file',
      size: 0, // Size not available from URL
      uploadedAt: new Date()
    }));
  }, [value]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesToUpload = Array.from(selectedFiles);
    
    if (!multiple && filesToUpload.length > 1) {
      setError('Only one file is allowed');
      return;
    }

    uploadFiles(filesToUpload);
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Validate file before upload
        const validation = validateFile(file, type);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const result = await uploadFileViaAPI(
          file, 
          type,
          (progress) => {
            setUploadProgress(progress.progress);
          }
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        return result;
      });

      const results = await Promise.all(uploadPromises);
      
      // Update value based on multiple flag
      if (multiple) {
        const newUrls = results.map(r => r.url!);
        const currentUrls = Array.isArray(value) ? value : (value ? [value] : []);
        onChange([...currentUrls, ...newUrls]);
      } else {
        onChange(results[0].url!);
      }

      setUploadProgress(100);
      
      // Reset progress after success animation
      setTimeout(() => setUploadProgress(0), 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = async (fileUrl: string) => {
    try {
      // Extract fileName from URL for deletion
      const fileName = fileUrl.replace(/^.*\//, '');
      
      const result = await deleteFile(fileName);
      if (!result.success) {
        console.error('Delete error:', result.error);
        // Continue with removal from UI even if server deletion fails
      }

      // Update value
      if (multiple) {
        const currentUrls = Array.isArray(value) ? value : [];
        onChange(currentUrls.filter(url => url !== fileUrl));
      } else {
        onChange('');
      }
    } catch (error) {
      console.error('Remove file error:', error);
      // Remove from UI even if server deletion fails
      if (multiple) {
        const currentUrls = Array.isArray(value) ? value : [];
        onChange(currentUrls.filter(url => url !== fileUrl));
      } else {
        onChange('');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAcceptedFileTypes = () => {
    const types = {
      resume: '.pdf,.doc,.docx',
      certification: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
    };
    return types[type];
  };

  const getFileTypeDescription = () => {
    const descriptions = {
      resume: 'PDF, DOC, or DOCX files',
      certification: 'PDF, DOC, DOCX, JPG, or PNG files'
    };
    return descriptions[type];
  };

  return (
    <div className={cn("space-y-4 flex flex-col h-full", className)}>
      {/* Label and Description */}
      {(label || description) && (
        <div>
          {label && (
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragOver && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className=" text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptedFileTypes()}
            multiple={multiple}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
          
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploading...</p>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {multiple ? 'Choose files' : 'Choose a file'} or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  {getFileTypeDescription()} (max 10MB)
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded files:</p>
          {files.map((file, index) => (
            <Card key={index} className="p-3 h-fit">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.originalName}</p>
                    {file.size > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.publicUrl, '_blank');
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file.url);
                    }}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
