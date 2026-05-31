"use client";

import React, { useState, useCallback, useEffect } from "react";
import { RotateCcw, PackageOpen, Download, Loader2, AlertCircle } from "lucide-react";
import { DropZone } from "@/components/DropZone";
import { BatchFileList } from "@/components/BatchFileList";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { decodePpm, imageDataToJpegBlob } from "@/lib/image";
import { makeBatchFiles, processBatch, downloadAllAsZip, type BatchFile } from "@/lib/batch";

const SUPPORTED_EXTS = ["dng","cr2","cr3","nef","arw","orf","rw2","pef","srw","raf","3fr","kdc","dcr","mrw","x3f"];

/** dcraw mutates its input — always pass a fresh mutable copy. */
async function readMutableRawBuffer(file: File): Promise<Uint8Array> {
  const src = new Uint8Array(await file.arrayBuffer());
  const copy = new Uint8Array(src.byteLength);
  copy.set(src);
  return copy;
}

/**
 * Run dcraw inside a dedicated Web Worker so each conversion gets a clean
 * Emscripten heap. The worker is terminated immediately after the job
 * completes, fully releasing its memory before the next file starts.
 */
function runDcrawInWorker(
  buf: Uint8Array,
  opts: Record<string, unknown>
): Promise<{ data: Uint8Array; isJpeg: boolean }> {
  return new Promise((resolve, reject) => {
    if (typeof Worker === "undefined") {
      reject(new Error("Web Workers are not available in this environment."));
      return;
    }

    const worker = new Worker("/dcraw-worker.js");

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error("RAW decode timed out after 3 minutes."));
    }, 3 * 60 * 1000);

    worker.onmessage = (e: MessageEvent<{ result?: Uint8Array; isJpeg?: boolean; error?: string }>) => {
      clearTimeout(timeout);
      worker.terminate();
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        resolve({ data: e.data.result!, isJpeg: e.data.isJpeg ?? false });
      }
    };

    worker.onerror = (e: ErrorEvent) => {
      clearTimeout(timeout);
      worker.terminate();
      reject(new Error(e.message ?? "Worker error"));
    };

    worker.postMessage({ buffer: buf.buffer, opts }, [buf.buffer]);
  });
}

/**
 * Extract the embedded JPEG preview from a RAW file using dcraw -e.
 * Sony ARW files always contain a full-resolution or near-full-resolution
 * embedded JPEG — this needs almost no memory to extract.
 */
function extractEmbeddedPreview(buf: Uint8Array): Promise<{ data: Uint8Array; isJpeg: boolean }> {
  return new Promise((resolve, reject) => {
    if (typeof Worker === "undefined") {
      reject(new Error("Web Workers are not available in this environment."));
      return;
    }

    const worker = new Worker("/dcraw-worker.js");

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error("Preview extraction timed out."));
    }, 60 * 1000);

    worker.onmessage = (e: MessageEvent<{ result?: Uint8Array; isJpeg?: boolean; error?: string }>) => {
      clearTimeout(timeout);
      worker.terminate();
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        resolve({ data: e.data.result!, isJpeg: e.data.isJpeg ?? false });
      }
    };

    worker.onerror = (e: ErrorEvent) => {
      clearTimeout(timeout);
      worker.terminate();
      reject(new Error(e.message ?? "Worker error"));
    };

    worker.postMessage({ buffer: buf.buffer, extractPreview: true }, [buf.buffer]);
  });
}

function isMemoryError(msg: string): boolean {
  return (
    msg.includes("Cannot enlarge") ||
    msg.includes("abort") ||
    msg.includes("memory") ||
    msg.includes("Assignment to constant") ||
    msg.includes("Out of memory") ||
    msg.includes("OOM")
  );
}

async function convertRawFile(file: File, jpgQuality: number): Promise<Blob> {
  const dcrawOpts: Record<string, unknown> = {
    w: true, // camera white balance
    q: 3,    // AHD interpolation (best quality)
    H: 2,    // blend highlights
  };

  // Tier 1: full-resolution decode
  try {
    const buf = await readMutableRawBuffer(file);
    const { data, isJpeg } = await runDcrawInWorker(buf, dcrawOpts);
    if (!isJpeg) {
      return ppmToJpeg(data, jpgQuality, file.size);
    }
  } catch (err1) {
    const msg1 = err1 instanceof Error ? err1.message : String(err1);
    if (!isMemoryError(msg1)) throw new Error(msg1 || "RAW decode failed");

    // Tier 2: half-size decode (uses ~4× less memory)
    try {
      const buf2 = await readMutableRawBuffer(file);
      const { data: data2, isJpeg: isJpeg2 } = await runDcrawInWorker(buf2, { ...dcrawOpts, h: true });
      if (!isJpeg2) {
        return ppmToJpeg(data2, jpgQuality, 0 /* skip size check for half-size */);
      }
    } catch (err2) {
      const msg2 = err2 instanceof Error ? err2.message : String(err2);
      if (!isMemoryError(msg2)) throw new Error(msg2 || "RAW decode failed");

      // Tier 3: extract embedded JPEG preview (needs almost no memory)
      try {
        const buf3 = await readMutableRawBuffer(file);
        const { data: data3, isJpeg: isJpeg3 } = await extractEmbeddedPreview(buf3);
        if (isJpeg3 && data3.length > 0) {
          // Return the embedded JPEG directly — it's already a JPEG from the camera
          return new Blob([data3], { type: "image/jpeg" });
        }
        throw new Error("Embedded preview not found in this RAW file.");
      } catch (err3) {
        const msg3 = err3 instanceof Error ? err3.message : String(err3);
        throw new Error(
          `Could not decode this RAW file in the browser (${msg3}). ` +
          `Try using a desktop app like Lightroom, RawTherapee, or darktable.`
        );
      }
    }
  }

  throw new Error("RAW decode produced unexpected output.");
}

/** Convert a PPM buffer to a JPEG Blob via decodePpm + imageDataToJpegBlob. */
async function ppmToJpeg(data: Uint8Array, quality: number, fileSize: number): Promise<Blob> {
  const ppmBytes = new Uint8Array(data.length);
  ppmBytes.set(data);
  const imageData = decodePpm(ppmBytes);

  if (fileSize > 5_000_000 && Math.max(imageData.width, imageData.height) < 2000) {
    throw new Error(
      `Decoded image is only ${imageData.width}×${imageData.height}px — full resolution decode did not succeed.`
    );
  }

  return imageDataToJpegBlob(imageData, quality);
}

export function RawToJpgTool() {
  const [files, setFiles] = useState<BatchFile<Blob>[]>([]);
  const [jpgQuality, setJpgQuality] = useState(95);
  const [running, setRunning] = useState(false);
  // Workers are supported in all modern browsers — check once on mount
  const [workerSupported, setWorkerSupported] = useState(true);

  useEffect(() => {
    if (typeof Worker === "undefined") setWorkerSupported(false);
  }, []);

  const handleFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((f) =>
      SUPPORTED_EXTS.includes(f.name.split(".").pop()?.toLowerCase() ?? "")
    );
    const invalid = incoming.filter((f) =>
      !SUPPORTED_EXTS.includes(f.name.split(".").pop()?.toLowerCase() ?? "")
    );
    if (invalid.length > 0) {
      console.warn("Unsupported files skipped:", invalid.map((f) => f.name));
    }
    if (valid.length > 0) setFiles((prev) => [...prev, ...makeBatchFiles(valid)]);
  }, []);

  const convert = async () => {
    if (files.length === 0 || running) return;
    setRunning(true);
    await processBatch(files, (file) => convertRawFile(file, jpgQuality), setFiles, 1);
    setRunning(false);
  };

  const reset = () => setFiles([]);
  const getOutputName = (file: File) => file.name.replace(/\.[^.]+$/, "") + ".jpg";
  const doneFiles = files.filter((f) => f.status === "done" && f.result);

  return (
    <div className="space-y-6">
      <DropZone onFiles={handleFiles} accept={SUPPORTED_EXTS.map((e) => `.${e}`).join(",")} maxSizeMB={200} />

      {!workerSupported && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          Your browser does not support Web Workers, which are required for RAW decoding. Please use a modern browser.
        </div>
      )}

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

            <div className="text-xs text-gray-500 space-y-0.5" aria-label="Selected files">
              {files.slice(0, 3).map((f) => (
                <div key={f.id} className="flex gap-2">
                  <span className="uppercase font-medium text-orange-600" aria-hidden="true">{f.file.name.split(".").pop()}</span>
                  <span className="truncate">{f.file.name}</span>
                  <span className="flex-shrink-0">{formatBytes(f.file.size)}</span>
                </div>
              ))}
              {files.length > 3 && <p>…and {files.length - 3} more</p>}
            </div>

            <Slider label="Output JPG Quality" min={60} max={100} step={5} value={jpgQuality} onChange={setJpgQuality} />
            <p className="text-xs text-gray-500 -mt-2">95 is recommended. Full-resolution decode may take 1–2 minutes for large ARW files.</p>

            <div className="flex flex-wrap gap-3">
              <Button onClick={convert} disabled={running || !workerSupported} size="lg">
                {running ? (
                  <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Converting…</>
                ) : `Convert ${files.length} file${files.length !== 1 ? "s" : ""} to JPG`}
              </Button>
              {doneFiles.length === 1 && doneFiles[0].result && (
                <Button variant="success" size="lg"
                  onClick={() => downloadBlob(doneFiles[0].result!, getOutputName(doneFiles[0].file))}>
                  <Download className="w-4 h-4" />Download
                </Button>
              )}
              {doneFiles.length > 1 && (
                <Button variant="outline" size="lg"
                  onClick={() => downloadAllAsZip(doneFiles, getOutputName, "raw_to_jpg.zip")}>
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
