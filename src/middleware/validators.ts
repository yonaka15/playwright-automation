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
    return;
  }

  // Validate URL format
  try {
    new URL(url); // Will throw if URL is invalid
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Invalid URL format",
    });
    return;
  }

  // Optional validation for output path if provided
  const { output } = req.body;
  if (output && typeof output !== "string") {
    res.status(400).json({
      status: "error",
      message: "Output path must be a string",
    });
    return;
  }

  // All validations passed
  next();
}

/**
 * Validate script execution request body
 */
export function validateScriptRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { url, script } = req.body;

  // Check if URL is provided
  if (!url) {
    res.status(400).json({
      status: "error",
      message: "URL is required",
    });
    return;
  }

  // Validate URL format
  try {
    new URL(url); // Will throw if URL is invalid
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Invalid URL format",
    });
    return;
  }

  // Check if script is provided
  if (!script) {
    res.status(400).json({
      status: "error",
      message: "Script is required",
    });
    return;
  }

  // Validate script type
  if (typeof script !== "string") {
    res.status(400).json({
      status: "error",
      message: "Script must be a string",
    });
    return;
  }

  // Optional validation for output path if provided
  const { output } = req.body;
  if (output && typeof output !== "string") {
    res.status(400).json({
      status: "error",
      message: "Output path must be a string",
    });
    return;
  }

  // All validations passed
  next();
}
