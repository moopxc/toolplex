"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  className?: string;
}

export function DropZone({
  onFiles,
  accept = "image/*",
  maxSizeMB = 50,
  multiple = true,
  className,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      setError(null);
      const arr = Array.from(incoming);
      if (arr.length === 0) return;

      const tooBig = arr.filter((f) => f.size > maxSizeMB * 1024 * 1024);
      const valid = arr.filter((f) => f.size <= maxSizeMB * 1024 * 1024);

      if (tooBig.length > 0) {
        setError(
          `${tooBig.map((f) => f.name).join(", ")} exceed${tooBig.length === 1 ? "s" : ""} the ${maxSizeMB}MB limit and ${tooBig.length === 1 ? "was" : "were"} skipped.`
        );
      }

      if (valid.length === 0) return;
      onFiles(valid);
    },
    [onFiles, maxSizeMB]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => {
    // Only clear drag state when leaving the drop zone itself, not a child
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  const acceptLabel =
    accept === "image/*"
      ? `JPG, PNG, WebP up to ${maxSizeMB}MB`
      : accept.replace(/image\//g, "").replace(/,/g, ", ").replace(/\./g, "").toUpperCase() +
        ` up to ${maxSizeMB}MB`;

  return (
    <div className={cn("w-full", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images — click or drag and drop files here"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors select-none",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
        )}
      >
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center pointer-events-none">
          {isDragging
            ? <ImageIcon className="w-7 h-7 text-blue-600" />
            : <Upload className="w-7 h-7 text-blue-600" />}
        </div>
        <div className="text-center pointer-events-none">
          <p className="font-semibold text-gray-700">
            {isDragging ? "Drop your images here" : "Click to upload or drag & drop"}
          </p>
          <p className="text-sm text-gray-500 mt-1">{acceptLabel}</p>
          {multiple && (
            <p className="text-xs text-blue-600 mt-1 font-medium">Multiple files supported</p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onInputChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-amber-600 flex items-center gap-1">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
