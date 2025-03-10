// src/middleware/validators.ts
import { Request, Response, NextFunction } from "express";

/**
 * Validate go_to request
 */
export function validateGoToRequest(
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

  // Optional timeout validation
  const { timeout } = req.body;
  if (timeout !== undefined && typeof timeout !== "number") {
    res.status(400).json({
      status: "error",
      message: "Timeout must be a number",
    });
    return;
  }

  // Optional waitUntil validation
  const { waitUntil } = req.body;
  if (
    waitUntil !== undefined &&
    !["load", "domcontentloaded", "networkidle"].includes(waitUntil)
  ) {
    res.status(400).json({
      status: "error",
      message: "waitUntil must be one of: 'load', 'domcontentloaded', 'networkidle'",
    });
    return;
  }

  // All validations passed
  next();
}

/**
 * Validate viewport request
 */
export function validateViewportRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { width, height } = req.body;

  // Check if width is provided and valid
  if (width === undefined) {
    res.status(400).json({
      status: "error",
      message: "Width is required",
    });
    return;
  }

  if (typeof width !== "number" || width <= 0) {
    res.status(400).json({
      status: "error",
      message: "Width must be a positive number",
    });
    return;
  }

  // Check if height is provided and valid
  if (height === undefined) {
    res.status(400).json({
      status: "error",
      message: "Height is required",
    });
    return;
  }

  if (typeof height !== "number" || height <= 0) {
    res.status(400).json({
      status: "error",
      message: "Height must be a positive number",
    });
    return;
  }

  // All validations passed
  next();
}

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

  // Validate viewport width and height if provided
  const { viewportWidth, viewportHeight } = req.body;
  if (viewportWidth !== undefined && typeof viewportWidth !== "number") {
    res.status(400).json({
      status: "error",
      message: "Viewport width must be a number",
    });
    return;
  }

  if (viewportHeight !== undefined && typeof viewportHeight !== "number") {
    res.status(400).json({
      status: "error",
      message: "Viewport height must be a number",
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
  const { script } = req.body;

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
