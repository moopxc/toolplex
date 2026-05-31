import JSZip from "jszip";
import { downloadBlob } from "./utils";

export type FileStatus = "pending" | "processing" | "done" | "error";

export interface BatchFile<R = Blob> {
  id: string;
  file: File;
  status: FileStatus;
  result?: R;
  error?: string;
  /** 0–100 */
  progress?: number;
}

/** Run processor only on pending files with a concurrency limit */
export async function processBatch<R>(
  files: BatchFile<R>[],
  processor: (file: File, onProgress?: (pct: number) => void) => Promise<R>,
  onUpdate: (updated: BatchFile<R>[]) => void,
  concurrency = 3
): Promise<BatchFile<R>[]> {
  // Only process pending files — skip done/error
  const results = [...files];
  const pendingIndices = results
    .map((f, i) => (f.status === "pending" ? i : -1))
    .filter((i) => i !== -1);
  let cursor = 0;

  const runNext = async (): Promise<void> => {
    if (cursor >= pendingIndices.length) return;
    const i = pendingIndices[cursor++];
    results[i] = { ...results[i], status: "processing", progress: 0 };
    onUpdate([...results]);

    try {
      const result = await processor(results[i].file, (pct) => {
        results[i] = { ...results[i], progress: pct };
        onUpdate([...results]);
      });
      results[i] = { ...results[i], status: "done", result, progress: 100 };
    } catch (err) {
      results[i] = {
        ...results[i],
        status: "error",
        error: err instanceof Error ? err.message : "Failed",
        progress: 0,
      };
    }

    onUpdate([...results]);
    await runNext();
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, pendingIndices.length) }, runNext));
  return results;
}

/** Download a single result blob directly (no zip wrapper) */
export function downloadSingle(file: BatchFile<Blob>, outputName: string): void {
  if (file.result) downloadBlob(file.result, outputName);
}

/** Download all done results as a zip, using output names to avoid collisions */
export async function downloadAllAsZip(
  files: BatchFile<Blob>[],
  getOutputName: (file: File) => string,
  zipName: string
): Promise<void> {
  try {
    const zip = new JSZip();
    const seen = new Map<string, number>();
    files.forEach((f) => {
      if (f.status !== "done" || !f.result) return;
      let name = getOutputName(f.file);
      // Deduplicate names
      if (seen.has(name)) {
        const count = seen.get(name)! + 1;
        seen.set(name, count);
        const ext = name.includes(".") ? "." + name.split(".").pop() : "";
        name = name.replace(/\.[^.]+$/, "") + `_${count}` + ext;
      } else {
        seen.set(name, 1);
      }
      zip.file(name, f.result);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, zipName);
  } catch (err) {
    console.error("ZIP generation failed:", err);
    alert("Failed to create ZIP file. Try downloading files individually.");
  }
}

export function makeBatchFiles(files: File[]): BatchFile[] {
  return files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    status: "pending" as FileStatus,
  }));
}
