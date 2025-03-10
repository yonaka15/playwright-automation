// src/routes/api.ts
import express from "express";
import { fetchPageContent, takeScreenshot } from "../utils/fetcher";
import { validateFetchRequest } from "../middleware/validators";
import { writeOutputToFile, writeBinaryToFile } from "../utils/fileHandler";

export const apiRouter = express.Router();

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

/**
 * @route   POST /api/html
 * @desc    Fetch web page content as HTML
 * @access  Public
 *
 * @body    {
 *  url: string,        // target URL to fetch (required)
 *  output: string      // output file path (optional)
 * }
 */
apiRouter.post("/html", validateFetchRequest, async (req, res, next) => {
  try {
    const {
      url,
      output,
    }: {
      url: string;
      output: string;
    } = req.body;
    const headless = req.body.headless !== false; // Default to true if not specified

    console.log(`API: Fetching ${url}...`);

    const markdown = false;
    const readability = false;

    // Fetch content using Playwright
    const content = await fetchPageContent(url, markdown, readability, {
      headless,
    });

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
 * @route   POST /api/html
 * @desc    Fetch web content as readable Markdown
 * @access  Public
 *
 * @body    {
 *  url: string,        // target URL to fetch (required)
 *  output: string      // output file path (optional)
 * }
 */
apiRouter.post("/read", validateFetchRequest, async (req, res, next) => {
  try {
    const {
      url,
      output,
    }: {
      url: string;
      output: string;
    } = req.body;
    const headless = req.body.headless !== false; // Default to true if not specified

    console.log(`API: Fetching ${url}...`);

    const markdown = true;
    const readability = true;

    // Fetch content using Playwright
    const content = await fetchPageContent(url, markdown, readability, {
      headless,
    });

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
