"use client";

import React, { useState, useCallback, useRef } from "react";
import { RotateCcw, Link, Unlink, PackageOpen, Download } from "lucide-react";
import { DropZone } from "@/components/DropZone";
import { BatchFileList } from "@/components/BatchFileList";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/utils";
import { resizeImageToBlob } from "@/lib/image";
import { makeBatchFiles, processBatch, downloadAllAsZip, type BatchFile } from "@/lib/batch";

interface Dims { width: number; height: number }

export function ImageResizerTool() {
  const [files, setFiles] = useState<BatchFile<Blob>[]>([]);
  const [dims, setDims] = useState<Dims>({ width: 1920, height: 1080 });
  const [lockAspect, setLockAspect] = useState(false);
  const [dimError, setDimError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const aspectRef = useRef<number>(16 / 9);
  // Track whether dims have been auto-filled to avoid stale closure issue
  const autoFilledRef = useRef(false);

  const handleFiles = useCallback((incoming: File[]) => {
    if (incoming.length > 0 && !autoFilledRef.current) {
      autoFilledRef.current = true;
      const url = URL.createObjectURL(incoming[0]);
      const img = new Image();
      img.onload = () => {
        aspectRef.current = img.naturalWidth / img.naturalHeight;
        setDims({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
    setFiles((prev) => [...prev, ...makeBatchFiles(incoming)]);
  }, []); // no deps — uses ref instead of state

  const handleWidthChange = (val: string) => {
    const w = parseInt(val) || 0;
    if (lockAspect && w > 0) {
      setDims({ width: w, height: Math.round(w / aspectRef.current) });
    } else {
      setDims((d) => ({ ...d, width: w }));
    }
    setDimError(null);
  };

  const handleHeightChange = (val: string) => {
    const h = parseInt(val) || 0;
    if (lockAspect && h > 0) {
      setDims({ width: Math.round(h * aspectRef.current), height: h });
    } else {
      setDims((d) => ({ ...d, height: h }));
    }
    setDimError(null);
  };

  const resize = async () => {
    if (files.length === 0 || running) return;
    if (dims.width <= 0 || dims.height <= 0) {
      setDimError("Please enter valid dimensions greater than 0.");
      return;
    }
    if (dims.width > 8000 || dims.height > 8000) {
      setDimError("Maximum dimension is 8000px.");
      return;
    }
    setDimError(null);
    setRunning(true);
    await processBatch(files, (file) => resizeImageToBlob(file, dims.width, dims.height), setFiles, 3);
    setRunning(false);
  };

  const reset = () => {
    autoFilledRef.current = false;
    setFiles([]);
    setDimError(null);
  };

  const getOutputName = (file: File) => {
    const ext = file.name.split(".").pop() ?? "jpg";
    return file.name.replace(/\.[^.]+$/, "") + `_${dims.width}x${dims.height}.` + ext;
  };

  const doneFiles = files.filter((f) => f.status === "done" && f.result);

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

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Output dimensions:</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block" htmlFor="width-input">Width (px)</label>
                  <input id="width-input" type="number" min={1} max={8000}
                    value={dims.width || ""}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    aria-describedby={dimError ? "dim-error" : undefined}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button onClick={() => setLockAspect((v) => !v)}
                  className="mt-5 p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
                  aria-pressed={lockAspect}>
                  {lockAspect ? <Link className="w-4 h-4 text-blue-600" aria-hidden="true" /> : <Unlink className="w-4 h-4 text-gray-400" aria-hidden="true" />}
                </button>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block" htmlFor="height-input">Height (px)</label>
                  <input id="height-input" type="number" min={1} max={8000}
                    value={dims.height || ""}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    aria-describedby={dimError ? "dim-error" : undefined}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{lockAspect ? "🔒 Aspect ratio locked" : "🔓 Aspect ratio unlocked"}</p>
              {dimError && <p id="dim-error" role="alert" className="text-xs text-red-600 mt-1">{dimError}</p>}
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Quick presets:</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Dimension presets">
                {[
                  { label: "1920×1080", w: 1920, h: 1080 },
                  { label: "1280×720", w: 1280, h: 720 },
                  { label: "800×600", w: 800, h: 600 },
                  { label: "400×400", w: 400, h: 400 },
                  { label: "150×150", w: 150, h: 150 },
                ].map((p) => (
                  <button key={p.label}
                    onClick={() => { setDims({ width: p.w, height: p.h }); setDimError(null); }}
                    aria-label={`Set dimensions to ${p.label}`}
                    className="text-xs px-3 py-1.5 rounded-md border border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={resize} disabled={running} size="lg">
                {running ? "Resizing…" : `Resize ${files.length} Image${files.length !== 1 ? "s" : ""}`}
              </Button>
              {doneFiles.length === 1 && doneFiles[0].result && (
                <Button variant="success" size="lg"
                  onClick={() => downloadBlob(doneFiles[0].result!, getOutputName(doneFiles[0].file))}>
                  <Download className="w-4 h-4" />Download
                </Button>
              )}
              {doneFiles.length > 1 && (
                <Button variant="outline" size="lg"
                  onClick={() => downloadAllAsZip(doneFiles, getOutputName, "resized_images.zip")}>
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
