"use client";

import React, { useState, useCallback, useRef } from "react";
import { RotateCcw, Info, PackageOpen, Download } from "lucide-react";
import { DropZone } from "@/components/DropZone";
import { BatchFileList } from "@/components/BatchFileList";
import { Button } from "@/components/ui/button";
import { cn, downloadBlob } from "@/lib/utils";
import { makeBatchFiles, processBatch, downloadAllAsZip, type BatchFile } from "@/lib/batch";

type OutputFormat = "png" | "webp";

export function BackgroundRemoverTool() {
  const [files, setFiles] = useState<BatchFile<Blob>[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("webp");
  const [running, setRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState<{ label: string; pct: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Cache the imported function — avoids re-importing on every batch run
  const removeBgRef = useRef<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((input: any, opts?: any) => Promise<Blob>) | null
  >(null);

  const handleFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...makeBatchFiles(incoming)]);
    setError(null);
  }, []);

  const process = async () => {
    if (files.length === 0 || running) return;
    setRunning(true);
    setError(null);
    setOverallProgress({ label: "Loading AI model…", pct: 0 });

    try {
      if (!removeBgRef.current) {
        const mod = await import("@imgly/background-removal");
        removeBgRef.current = mod.removeBackground;
      }
      const removeBg = removeBgRef.current!;
      const fmt = outputFormat;

      setOverallProgress({ label: "Processing…", pct: 0 });

      await processBatch(
        files,
        async (file, onProgress) => {
          const outputMime = fmt === "webp" ? "image/webp" : "image/png";
          const blob = await removeBg(file, {
            model: "isnet_fp16",
            output: {
              format: outputMime,
              quality: fmt === "webp" ? 0.92 : 1,
              type: "foreground",
            },
            progress: (_key: string, current: number, total: number) => {
              if (total > 0) onProgress?.(Math.round((current / total) * 100));
            },
          });
          return blob as Blob;
        },
        (updated) => {
          setFiles(updated);
          const done = updated.filter((f) => f.status === "done").length;
          setOverallProgress({
            label: `Processing ${done}/${updated.length}…`,
            pct: Math.round((done / updated.length) * 100),
          });
        },
        1 // AI model cannot parallelize
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Distinguish model load failure from processing failure
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("load")) {
        setError("Failed to load the AI model. Check your internet connection and try again.");
      } else {
        setError("Background removal failed. Try a smaller image or a different browser.");
      }
    } finally {
      setRunning(false);
      setOverallProgress(null);
    }
  };

  const reset = () => { setFiles([]); setError(null); setOverallProgress(null); };

  const ext = outputFormat === "webp" ? "webp" : "png";
  const getOutputName = (file: File) => file.name.replace(/\.[^.]+$/, "") + `_no_bg.${ext}`;
  const doneFiles = files.filter((f) => f.status === "done" && f.result);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-blue-800">
          AI model runs in your browser. First run downloads ~10MB and caches it. Files are processed one at a time.
        </p>
      </div>

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

            {/* Output format — radio group for a11y */}
            <div role="radiogroup" aria-labelledby="format-label">
              <p id="format-label" className="text-sm font-medium text-gray-700 mb-2">Output format:</p>
              <div className="flex gap-3">
                {([
                  { value: "webp" as OutputFormat, label: "WebP", hint: "~70% smaller, supports transparency" },
                  { value: "png" as OutputFormat, label: "PNG", hint: "Lossless, larger file, max compatibility" },
                ]).map((f) => (
                  <button
                    key={f.value}
                    role="radio"
                    aria-checked={outputFormat === f.value}
                    onClick={() => setOutputFormat(f.value)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      outputFormat === f.value ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                    )}
                  >
                    <p className={cn("font-semibold text-sm", outputFormat === f.value ? "text-blue-700" : "text-gray-700")}>
                      {f.label}
                      {f.value === "webp" && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Recommended</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={process} disabled={running} size="lg">
                {running ? overallProgress?.label ?? "Processing…"
                  : `Remove Background from ${files.length} Image${files.length !== 1 ? "s" : ""}`}
              </Button>
              {doneFiles.length === 1 && doneFiles[0].result && (
                <Button variant="success" size="lg"
                  onClick={() => downloadBlob(doneFiles[0].result!, getOutputName(doneFiles[0].file))}>
                  <Download className="w-4 h-4" />Download {ext.toUpperCase()}
                </Button>
              )}
              {doneFiles.length > 1 && (
                <Button variant="outline" size="lg"
                  onClick={() => downloadAllAsZip(doneFiles, getOutputName, "no_bg_images.zip")}>
                  <PackageOpen className="w-4 h-4" />Download All as ZIP
                </Button>
              )}
              <Button variant="outline" size="lg" onClick={reset} disabled={running}>
                <RotateCcw className="w-4 h-4" />New
              </Button>
            </div>

            {running && overallProgress && (
              <div className="space-y-1.5" role="status" aria-live="polite">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{overallProgress.label}</span>
                  <span>{overallProgress.pct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress.pct}%` }} />
                </div>
              </div>
            )}

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          </div>

          <BatchFileList files={files} getOutputName={getOutputName} />
        </>
      )}
    </div>
  );
}
