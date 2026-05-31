"use client";

import React, { useState, useCallback, useMemo } from "react";
import { RotateCcw, ArrowRight, PackageOpen, Download } from "lucide-react";
import { DropZone } from "@/components/DropZone";
import { BatchFileList } from "@/components/BatchFileList";
import { Button } from "@/components/ui/button";
import { downloadBlob, cn } from "@/lib/utils";
import { blobFromCanvasSource, loadImageFromFile } from "@/lib/image";
import { makeBatchFiles, processBatch, downloadAllAsZip, type BatchFile } from "@/lib/batch";
import type { ImageFormat } from "@/lib/types";

const FORMAT_OPTIONS: { value: ImageFormat; label: string; ext: string }[] = [
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

async function convertFile(file: File, targetFormat: ImageFormat): Promise<Blob> {
  const img = await loadImageFromFile(file);
  let w = img.naturalWidth;
  let h = img.naturalHeight;

  // PNG is lossless — cap pixel count so output stays under ~5 MB.
  // Empirically PNG compresses to ~3.5 bytes/pixel for photos.
  // 5 MB / 3.5 ≈ 1,497,965 pixels max.
  if (targetFormat === "image/png") {
    const MAX_PIXELS = 1_500_000;
    const pixels = w * h;
    if (pixels > MAX_PIXELS) {
      const scale = Math.sqrt(MAX_PIXELS / pixels);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
  }

  return blobFromCanvasSource(img, w, h, targetFormat, {
    fillWhite: targetFormat === "image/jpeg",
  });
}

export function ImageConverterTool() {
  const [files, setFiles] = useState<BatchFile<Blob>[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("image/webp");
  const [running, setRunning] = useState(false);

  const handleFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...makeBatchFiles(incoming)]);
  }, []);

  const convert = async () => {
    if (files.length === 0 || running) return;
    setRunning(true);
    await processBatch(files, (file) => convertFile(file, targetFormat), setFiles, 4);
    setRunning(false);
  };

  const reset = () => setFiles([]);

  const ext = FORMAT_OPTIONS.find((f) => f.value === targetFormat)?.ext ?? "jpg";
  const getOutputName = (file: File) => file.name.replace(/\.[^.]+$/, "") + "." + ext;
  const doneFiles = files.filter((f) => f.status === "done" && f.result);

  // Show info note when any JPEG source is being converted to PNG
  const hasPngWarning = useMemo(() => {
    if (targetFormat !== "image/png") return false;
    return files.some((f) => {
      const t = f.file.type;
      const name = f.file.name.toLowerCase();
      return t === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg");
    });
  }, [files, targetFormat]);

  return (
    <div className="space-y-6">
      <DropZone onFiles={handleFiles} accept="image/jpeg,image/png,image/webp" />

      {files.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </span>
              <button onClick={reset}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded">
                Clear all
              </button>
            </div>

            <div role="group" aria-labelledby="format-label">
              <p id="format-label" className="text-sm font-medium text-gray-700 mb-3">Convert all to:</p>
              <div className="flex gap-3">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => setTargetFormat(fmt.value)}
                    role="radio"
                    aria-checked={targetFormat === fmt.value}
                    className={cn(
                      "flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      targetFormat === fmt.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-300 text-gray-700"
                    )}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {targetFormat === "image/jpeg" && (
                <p className="text-xs text-amber-600 mt-2" role="note">⚠️ Transparent areas will become white.</p>
              )}
              {hasPngWarning && (
                <p className="text-xs text-amber-600 mt-2" role="note">
                  ℹ️ Large photos will be scaled down automatically to keep PNG output under 5 MB.
                </p>
              )}
              {targetFormat === "image/webp" && (
                <p className="text-xs text-green-600 mt-2" role="note">✓ WebP gives the best balance of quality and small file size.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={convert} disabled={running} size="lg">
                {running ? "Converting…" : (
                  <>Convert {files.length} file{files.length !== 1 ? "s" : ""} <ArrowRight className="w-4 h-4" aria-hidden="true" /> {FORMAT_OPTIONS.find((f) => f.value === targetFormat)?.label}</>
                )}
              </Button>
              {doneFiles.length === 1 && doneFiles[0].result && (
                <Button variant="success" size="lg"
                  onClick={() => downloadBlob(doneFiles[0].result!, getOutputName(doneFiles[0].file))}>
                  <Download className="w-4 h-4" />Download
                </Button>
              )}
              {doneFiles.length > 1 && (
                <Button variant="outline" size="lg"
                  onClick={() => downloadAllAsZip(doneFiles, getOutputName, `converted_${ext}.zip`)}>
                  <PackageOpen className="w-4 h-4" />Download All as ZIP
                </Button>
              )}
              <Button variant="outline" size="lg" onClick={reset} disabled={running}>
                <RotateCcw className="w-4 h-4" />New
              </Button>
            </div>
          </div>

          <BatchFileList files={files} getOutputName={getOutputName} />
        </>
      )}
    </div>
  );
}
