// src/routes/api.ts
import express from "express";
import { fetchPageContent, takeScreenshot } from "../utils/fetcher";
import { validateFetchRequest } from "../middleware/validators";
import { writeOutputToFile, writeBinaryToFile } from "../utils/fileHandler";

export const apiRouter = express.Router();

/**
 * @route   POST /api/fetch
 * @desc    Fetch web page content
 * @access  Public
 *
 * @body    {
 *  url: string,        // target URL to fetch (required)
 *  markdown: boolean,  // convert to markdown (optional)
 *  output: string      // output file path (optional)
 * }
 */
apiRouter.post("/fetch", validateFetchRequest, async (req, res, next) => {
  try {
    const { url, markdown = false, output } = req.body;

    console.log(`API: Fetching ${url}...`);

    // Fetch content using Playwright
    const content = await fetchPageContent(url, markdown);

    // Handle file output if specified
    if (output) {
      await writeOutputToFile(output, content);

      res.status(200).json({
        status: "success",
        message: `Content saved to ${output}`,
        url,
        markdown,
        output,
      });
    } else {
      // Return the content directly in the response
      res.status(200).json({
        status: "success",
        url,
        markdown,
        content,
      });
    }
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * @route   POST /api/screenshot
 * @desc    Take screenshot of a webpage
 * @access  Public
 *
 * @body    {
 *  url: string,        // target URL to screenshot (required)
 *  output: string      // output file path (optional)
 * }
 */
apiRouter.post("/screenshot", validateFetchRequest, async (req, res, next) => {
  try {
    const { url, output } = req.body;
    const headless = req.body.headless !== false; // Default to true if not specified

    console.log(`API: Taking screenshot of ${url}...`);

    // Take screenshot using Playwright
    const screenshotBuffer = await takeScreenshot(url, { headless });

    // Handle file output if specified
    if (output) {
      await writeBinaryToFile(output, screenshotBuffer);

      res.status(200).json({
        status: "success",
        message: `Screenshot saved to ${output}`,
        url,
        output,
      });
    } else {
      // Return the screenshot as base64
      const base64Screenshot = screenshotBuffer.toString("base64");

      res.status(200).json({
        status: "success",
        url,
        screenshot: `data:image/png;base64,${base64Screenshot}`,
      });
    }
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * @route   GET /api/status
 * @desc    Get API status
 * @access  Public
 */
apiRouter.get("/status", (req, res) => {
  res.json({
    status: "operational",
    timestamp: new Date().toISOString(),
  });
});
