import React from "react";
import { CheckCircle2, XCircle, Loader2, Clock, Download } from "lucide-react";
import { cn, formatBytes, downloadBlob } from "@/lib/utils";
import type { BatchFile } from "@/lib/batch";

interface BatchFileListProps {
  files: BatchFile<Blob>[];
  getOutputName: (file: File) => string;
}

export function BatchFileList({ files, getOutputName }: BatchFileListProps) {
  return (
    <div className="space-y-2">
      {files.map((f) => (
        <div
          key={f.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border text-sm transition-colors",
            f.status === "done" && "bg-green-50 border-green-200",
            f.status === "error" && "bg-red-50 border-red-200",
            f.status === "processing" && "bg-blue-50 border-blue-200",
            f.status === "pending" && "bg-gray-50 border-gray-200"
          )}
        >
          {/* Status icon */}
          <div className="flex-shrink-0">
            {f.status === "pending" && <Clock className="w-4 h-4 text-gray-400" />}
            {f.status === "processing" && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
            {f.status === "done" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
            {f.status === "error" && <XCircle className="w-4 h-4 text-red-500" />}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">{f.file.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{formatBytes(f.file.size)}</span>
              {f.status === "done" && f.result && (
                <span className="text-xs text-green-700">
                  → {formatBytes(f.result.size)}
                </span>
              )}
              {f.status === "error" && (
                <span className="text-xs text-red-600">{f.error}</span>
              )}
            </div>
            {/* Progress bar */}
            {f.status === "processing" && (
              <div className="mt-1.5 w-full bg-blue-200 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all duration-200"
                  style={{ width: `${f.progress ?? 0}%` }}
                />
              </div>
            )}
          </div>

          {/* Per-file download */}
          {f.status === "done" && f.result && (
            <button
              onClick={() => downloadBlob(f.result!, getOutputName(f.file))}
              className="flex-shrink-0 p-1.5 rounded-md hover:bg-green-100 text-green-700 transition-colors"
              aria-label={`Download ${f.file.name}`}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
