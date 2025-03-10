// src/middleware/validators.ts
import { Request, Response, NextFunction } from "express";

/**
 * Validate fetch request body
 */
export function validateFetchRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { url } = req.body;

  // Check if URL is provided
  if (!url) {
    res.status(400).json({
      status: "error",
      message: "URL is required",
    });
    return; // 単に return するだけに変更
  }

  // Validate URL format
  try {
    new URL(url); // Will throw if URL is invalid
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Invalid URL format",
    });
    return; // 単に return するだけに変更
  }

  // Optional validation for output path if provided
  const { output } = req.body;
  if (output && typeof output !== "string") {
    res.status(400).json({
      status: "error",
      message: "Output path must be a string",
    });
    return; // 単に return するだけに変更
  }

  // All validations passed
  next();
}
