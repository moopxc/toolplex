import React from "react";
import { formatBytes, cn } from "@/lib/utils";

interface ImagePreviewProps {
  src: string;
  label: string;
  filename?: string;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  checkered?: boolean;
}

export function ImagePreview({
  src,
  label,
  filename,
  size,
  width,
  height,
  className,
  checkered = false,
}: ImagePreviewProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div
        className="rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center min-h-48 bg-gray-100"
        style={
          checkered
            ? {
                backgroundImage:
                  "linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0,0 8px,8px -8px,-8px 0px",
                backgroundColor: "#fff",
              }
            : {}
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={filename ? `${label} — ${filename}` : label}
          className="max-w-full max-h-64 object-contain"
        />
      </div>
      {(size !== undefined || width !== undefined) && (
        <div className="flex gap-3 text-xs text-gray-500">
          {size !== undefined && <span>{formatBytes(size)}</span>}
          {width !== undefined && height !== undefined && (
            <span>{width} × {height}px</span>
          )}
        </div>
      )}
    </div>
  );
}
