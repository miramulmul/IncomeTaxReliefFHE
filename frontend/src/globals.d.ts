declare global {
  var Buffer: typeof import("buffer").Buffer;
  var process: typeof import("process/browser");
  var global: typeof globalThis;
}

export {};
