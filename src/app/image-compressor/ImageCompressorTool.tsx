"use client";

import React, { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import { Download, RotateCcw, PackageOpen } from "lucide-react";
import { DropZone } from "@/components/DropZone";
import { BatchFileList } from "@/components/BatchFileList";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { inferImageMime } from "@/lib/image";
import { makeBatchFiles, processBatch, downloadAllAsZip, type BatchFile } from "@/lib/batch";

export function ImageCompressorTool() {
  const [files, setFiles] = useState<BatchFile<Blob>[]>([]);
  const [quality, setQuality] = useState(80);
  const [running, setRunning] = useState(false);

  const handleFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...makeBatchFiles(incoming)]);
  }, []);

  const compress = async () => {
    if (files.length === 0 || running) return;
    setRunning(true);
    await processBatch(
      files,
      async (file) => {
        const compressed = await imageCompression(file, {
          useWebWorker: true,
          initialQuality: quality / 100,
          alwaysKeepResolution: true,
          fileType: inferImageMime(file),
        });
        return compressed as Blob;
      },
      setFiles,
      3
    );
    setRunning(false);
  };

  const reset = () => setFiles([]);

  const getOutputName = (file: File) => {
    const ext = file.name.split(".").pop() ?? "jpg";
    return file.name.replace(/\.[^.]+$/, "") + "_compressed." + ext;
  };

  const doneFiles = files.filter((f) => f.status === "done" && f.result);
  const totalOriginal = files.reduce((s, f) => s + f.file.size, 0);
  const totalCompressed = doneFiles.reduce((s, f) => s + (f.result?.size ?? 0), 0);
  const savings = totalOriginal > 0 && totalCompressed > 0
    ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;

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
              <button
                onClick={reset}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
              >
                Clear all
              </button>
            </div>

            <Slider label="Compression Quality" min={10} max={100} step={5} value={quality} onChange={setQuality} />
            <p className="text-xs text-gray-500">Higher quality = larger file. Lower quality = smaller file.</p>

            <div className="flex flex-wrap gap-3">
              <Button onClick={compress} disabled={running} size="lg">
                {running ? "Compressing…" : `Compress ${files.length} Image${files.length !== 1 ? "s" : ""}`}
              </Button>
              {/* Single file: direct download, no zip wrapper */}
              {doneFiles.length === 1 && doneFiles[0].result && (
                <Button variant="success" size="lg"
                  onClick={() => downloadBlob(doneFiles[0].result!, getOutputName(doneFiles[0].file))}>
                  <Download className="w-4 h-4" />Download
                </Button>
              )}
              {/* Multiple files: zip */}
              {doneFiles.length > 1 && (
                <Button variant="outline" size="lg"
                  onClick={() => downloadAllAsZip(doneFiles, getOutputName, "compressed_images.zip")}>
                  <PackageOpen className="w-4 h-4" />Download All as ZIP
                </Button>
              )}
              <Button variant="outline" size="lg" onClick={reset} disabled={running}>
                <RotateCcw className="w-4 h-4" />New
              </Button>
            </div>

            {doneFiles.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex flex-wrap gap-4 text-sm" role="status">
                <span className="text-green-800 font-semibold">{savings}% smaller overall</span>
                <span className="text-green-700">{formatBytes(totalOriginal)} → {formatBytes(totalCompressed)}</span>
                <span className="text-green-700">{doneFiles.length}/{files.length} done</span>
              </div>
            )}
          </div>

          <BatchFileList files={files} getOutputName={getOutputName} />
        </>
      )}
    </div>
  );
}
