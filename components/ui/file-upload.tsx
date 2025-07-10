'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  X, 
  FileText, 
  Image, 
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
}

export function FileUpload({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024, // 10MB default
  className 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-8 w-8 text-purple-600" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo className="h-8 w-8 text-red-600" />;
      case 'mp3':
      case 'wav':
        return <FileAudio className="h-8 w-8 text-orange-600" />;
      default:
        return <File className="h-8 w-8 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }

    const allowedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return `File type not supported. Allowed types: ${accept}`;
    }

    return null;
  };

  const simulateUpload = useCallback((file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  }, []);

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(file);
    simulateUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileRemove();
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {!selectedFile ? (
        <Card
          className={cn(
            "border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-blue-400",
            isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
            error ? "border-red-300 bg-red-50" : ""
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
              isDragOver ? "bg-blue-100" : "bg-gray-100"
            )}>
              <Upload className={cn(
                "h-8 w-8 transition-colors",
                isDragOver ? "text-blue-600" : "text-gray-400"
              )} />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Document
            </h3>
            
            <p className="text-gray-600 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <p>Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG</p>
              <p>Maximum file size: {formatFileSize(maxSize)}</p>
            </div>
            
            <Button type="button" variant="outline" className="mt-4">
              Choose File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getFileIcon(selectedFile.name)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {isUploading ? 'Uploading...' : 'Ready'}
                  </Badge>
                </div>
                
                {isUploading && (
                  <div className="mt-3">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}