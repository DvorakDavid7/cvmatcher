"use client";

import { ChangeEvent, DragEvent, useCallback, useState } from "react";

interface DragAndDropProps {
  onFilesSelected?: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function DragAndDrop({
  onFilesSelected,
  acceptedTypes = [],
  maxFiles = 10,
  maxSizeMB = 10,
}: DragAndDropProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const validateFile = useCallback(
    (file: File): boolean => {
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return false;
      }
      return true;
    },
    [acceptedTypes, maxSizeMB],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(validateFile);

      if (uploadedFiles.length + validFiles.length > maxFiles) {
        const allowedCount = maxFiles - uploadedFiles.length;
        validFiles.splice(allowedCount);
      }

      const newFiles = [...uploadedFiles, ...validFiles];
      setUploadedFiles(newFiles);
      onFilesSelected?.(newFiles);
    },
    [uploadedFiles, validateFile, maxFiles, onFilesSelected],
  );

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles],
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(newFiles);
      onFilesSelected?.(newFiles);
    },
    [uploadedFiles, onFilesSelected],
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out cursor-pointer
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-105"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${uploadedFiles.length > 0 ? "bg-gray-50 dark:bg-gray-900/50" : "bg-white dark:bg-gray-900"}
        `}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          accept={acceptedTypes.join(",")}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div className="text-center">
          <div className="mb-4">
            <svg
              className={`mx-auto w-12 h-12 transition-colors duration-200 ${
                isDragActive ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <h3
            className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
              isDragActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"
            }`}
          >
            {isDragActive ? "Drop files here" : "Upload files"}
          </h3>

          <p className="text-gray-500 dark:text-gray-400 mb-4">Drag and drop files here, or click to browse</p>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            {acceptedTypes.length > 0 && <span>Accepted: {acceptedTypes.join(", ")}</span>}
            <span>Max {maxFiles} files</span>
            <span>Max {maxSizeMB}MB each</span>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)} {file.type || "Unknown type"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-3 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 flex-shrink-0"
                  title="Remove file"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
