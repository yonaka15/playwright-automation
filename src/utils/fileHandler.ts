// src/utils/fileHandler.ts
import fs from "fs/promises";
import path from "path";

/**
 * Write content to a file, creating directories if needed
 *
 * @param filePath Path to the output file
 * @param content Content to write
 */
export async function writeOutputToFile(
  filePath: string,
  content: string
): Promise<void> {
  try {
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write content to file
    await fs.writeFile(filePath, content);
    console.log(`Content saved to ${filePath}`);
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    throw new Error(
      `Failed to write to file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Check if a file exists
 *
 * @param filePath Path to check
 * @returns Boolean indicating if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Write binary content to a file, creating directories if needed
 *
 * @param filePath Path to the output file
 * @param content Binary content to write
 */
export async function writeBinaryToFile(
  filePath: string,
  content: Buffer
): Promise<void> {
  try {
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write binary content to file
    await fs.writeFile(filePath, content);
    console.log(`Binary content saved to ${filePath}`);
  } catch (error) {
    console.error(`Error writing binary to file ${filePath}:`, error);
    throw new Error(
      `Failed to write binary to file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
