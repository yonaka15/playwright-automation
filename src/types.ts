// src/types.ts

// Common options for browser operations
export interface BrowserOptions {
  headless?: boolean;
  timeout?: number;
  waitUntil?: "load" | "domcontentloaded" | "networkidle";
}

// Script execution result
export interface ScriptResult {
  success: boolean;
  result?: any;
  error?: string;
  screenshot?: Buffer;
}

// Request body for script execution
export interface ScriptRequestBody {
  url: string;
  script: string;
  output?: string;
  headless?: boolean;
  timeout?: number;
  waitUntil?: "load" | "domcontentloaded" | "networkidle";
}

// Request body for fetch operations
export interface FetchRequestBody {
  url: string;
  output?: string;
  headless?: boolean;
  markdown?: boolean;
  readability?: boolean;
}

// API response structure
export interface ApiResponse {
  status: "success" | "error";
  message?: string;
  url?: string;
  output?: string;
  result?: any;
  content?: string;
  markdown?: boolean;
  screenshot?: string;
}
