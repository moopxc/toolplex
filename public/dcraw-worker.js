/**
 * Web Worker for dcraw RAW decoding.
 *
 * Each worker handles exactly one job then is terminated by the main thread,
 * giving every conversion a completely clean Emscripten heap.
 *
 * We pre-configure the Module object BEFORE importScripts so Emscripten picks
 * up our memory settings:
 *   TOTAL_MEMORY  – initial heap size (must be a multiple of 16 MB)
 *   TOTAL_STACK   – stack size for deep AHD demosaic recursion
 *
 * Message in:
 *   { buffer: ArrayBuffer, opts: object }              – full decode (PPM output)
 *   { buffer: ArrayBuffer, extractPreview: true }      – extract embedded JPEG (-e flag)
 *
 * Message out:
 *   { result: Uint8Array, isJpeg: boolean }  on success
 *   { error: string }                        on failure
 */

// 1.5 GB heap — Sony A7 ARW files need ~400 MB working space for full-res AHD decode.
// Must be a multiple of 16 MB (16777216).
self.Module = {
  TOTAL_MEMORY: 1536 * 1024 * 1024,  // 1536 MB
  TOTAL_STACK:  64  * 1024 * 1024,   // 64 MB stack
};

self.importScripts("/dcraw.js");

self.onmessage = function (e) {
  try {
    var buf  = new Uint8Array(e.data.buffer);

    if (typeof self.dcraw !== "function") {
      self.postMessage({ error: "dcraw not available in worker" });
      return;
    }

    var opts;
    if (e.data.extractPreview) {
      // -e: extract embedded JPEG thumbnail/preview — needs almost no memory
      opts = { e: true };
    } else {
      opts = e.data.opts;
    }

    var result = self.dcraw(buf, opts);

    if (typeof result === "string") {
      self.postMessage({ error: result.trim() || "RAW decode failed" });
      return;
    }

    if (!result || result.length === 0) {
      self.postMessage({ error: "RAW decoder returned empty output" });
      return;
    }

    // Detect whether the output is a JPEG (embedded preview) or PPM (decoded raw)
    var isJpeg = result[0] === 0xFF && result[1] === 0xD8;

    var out = new Uint8Array(result.length);
    out.set(result);
    self.postMessage({ result: out, isJpeg: isJpeg }, [out.buffer]);
  } catch (err) {
    self.postMessage({ error: err instanceof Error ? err.message : String(err) });
  }
};
