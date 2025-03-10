// src/routes/api.ts
import express from "express";
import { Page } from "playwright";
import { fetchPageContent, takeScreenshot } from "../utils/fetcher";
import { runScript, runAdvancedScript } from "../utils/scriptRunner";
import {
  validateFetchRequest,
  validateScriptRequest,
} from "../middleware/validators";
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
 * @route   POST /api/read
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

/**
 * @route   POST /api/script
 * @desc    Execute a custom script on a webpage
 * @access  Public
 *
 * @body    {
 *  url: string,        // target URL to execute script on (required)
 *  script: string,     // JavaScript code to execute (required)
 *  output: string,     // output file path for result (optional)
 *  headless: boolean,  // run in headless mode (default: true)
 *  timeout: number     // timeout in milliseconds (default: 30000)
 * }
 */
apiRouter.post("/script", validateScriptRequest, async (req, res, next) => {
  try {
    const {
      url,
      script,
      output,
    }: {
      url: string;
      script: string;
      output?: string;
    } = req.body;

    const options = {
      headless: req.body.headless !== false, // Default to true if not specified
      timeout: req.body.timeout || 30000,
      waitUntil: req.body.waitUntil || "domcontentloaded",
    };

    console.log(`API: Executing script on ${url}...`);

    // Run the script using Playwright
    const result = await runScript(url, script, options);

    // デバッグログを追加
    console.log("Script execution result:", result);

    // Handle script execution failure
    if (!result.success) {
      res.status(400).json({
        status: "error",
        message: `Script execution failed: ${result.error}`,
        url,
      });
      return;
    }

    // デバッグログを追加
    console.log("Script result value:", result.result);

    // Handle file output if specified
    if (output) {
      // Convert result to string for file output
      const resultStr =
        typeof result.result === "object"
          ? JSON.stringify(result.result, null, 2)
          : String(result.result);

      await writeOutputToFile(output, resultStr);

      // If result contains a screenshot and output is specified, save it as well
      if (result.screenshot) {
        const screenshotPath = `${output}.png`;
        await writeBinaryToFile(screenshotPath, result.screenshot);
      }

      res.status(200).json({
        status: "success",
        message: `Script result saved to ${output}`,
        url,
        output,
        result: result.result, // 結果も含める
        screenshot: result.screenshot ? `${output}.png` : undefined,
      });
    } else {
      // Return the result directly in the response
      // If result contains a screenshot, convert to base64
      const base64Screenshot = result.screenshot
        ? `data:image/png;base64,${result.screenshot.toString("base64")}`
        : undefined;

      res.status(200).json({
        status: "success",
        url,
        result: result.result,
        screenshot: base64Screenshot,
      });
    }
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * @route   POST /api/advanced-script
 * @desc    Execute an advanced script that requires Page object
 * @access  Public
 *
 * @body    {
 *  url: string,        // target URL to execute script on (required)
 *  script: string,     // JavaScript function code that uses Page object (required)
 *  output: string,     // output file path for result (optional)
 *  headless: boolean,  // run in headless mode (default: true)
 *  timeout: number     // timeout in milliseconds (default: 30000)
 * }
 */
apiRouter.post(
  "/advanced-script",
  validateScriptRequest,
  async (req, res, next) => {
    try {
      const {
        url,
        script,
        output,
      }: {
        url: string;
        script: string;
        output?: string;
      } = req.body;

      const options = {
        headless: req.body.headless !== false, // Default to true if not specified
        timeout: req.body.timeout || 30000,
        waitUntil: req.body.waitUntil || "domcontentloaded",
      };

      console.log(`API: Executing advanced script on ${url}...`);
      console.log(`Original script: ${script}`);

      // 重要な修正: スクリプトを適切な形式に変換する
      // 2つの一般的なパターンを処理:
      // 1. スクリプトが "async function run(page) { ... }" の形式の場合
      // 2. スクリプトがfunction宣言を含まない場合

      let processedScript = script;

      if (script.includes("function run(page)")) {
        // run関数が定義されているがまだ呼び出されていない場合、実行コードを追加
        if (!script.includes("return run(page)")) {
          processedScript = `
          ${script}
          return await run(page);  // 関数を実行して結果を返す
        `;
        }
      } else if (!script.includes("return ") && !script.includes("=>")) {
        // return文も矢印関数もない場合は直接実行できるステートメントと見なす
        processedScript = `async (page) => { return ${script} }`;
      } else if (
        script.trim().startsWith("async (page)") ||
        script.trim().startsWith("async function")
      ) {
        // すでに適切な形式の場合はそのまま使用
        processedScript = script;
      } else {
        // それ以外のケースでは単にasync関数でラップする
        processedScript = `async (page) => { ${script} }`;
      }

      console.log(`Processed script: ${processedScript}`);

      // Convert string script to function
      // This is a potential security risk, so additional validation should be added in production
      let scriptFn: (page: Page) => Promise<any>;
      try {
        // Create a function with 'page' parameter that returns a Promise
        const AsyncFunction = Object.getPrototypeOf(
          async function () {}
        ).constructor;
        scriptFn = new AsyncFunction("page", processedScript) as (
          page: Page
        ) => Promise<any>;
      } catch (e) {
        console.error("Script compilation error:", e);
        res.status(400).json({
          status: "error",
          message: `Invalid script syntax: ${
            e instanceof Error ? e.message : String(e)
          }`,
        });
        return;
      }

      // Run the advanced script function
      const result = await runAdvancedScript(url, scriptFn, options);

      // デバッグログを追加
      console.log("Advanced script execution result:", result);

      // Handle script execution failure
      if (!result.success) {
        res.status(400).json({
          status: "error",
          message: `Script execution failed: ${result.error}`,
          url,
        });
        return;
      }

      // Handle file output if specified
      if (output) {
        // Convert result to string for file output
        const resultStr =
          typeof result.result === "object"
            ? JSON.stringify(result.result, null, 2)
            : String(result.result);

        await writeOutputToFile(output, resultStr);

        // If result contains a screenshot and output is specified, save it as well
        if (result.screenshot) {
          const screenshotPath = `${output}.png`;
          await writeBinaryToFile(screenshotPath, result.screenshot);
        }

        res.status(200).json({
          status: "success",
          message: `Script result saved to ${output}`,
          url,
          output,
          result: result.result, // 結果も含める
          screenshot: result.screenshot ? `${output}.png` : undefined,
        });
      } else {
        // Return the result directly in the response
        // If result contains a screenshot, convert to base64
        const base64Screenshot = result.screenshot
          ? `data:image/png;base64,${result.screenshot.toString("base64")}`
          : undefined;

        res.status(200).json({
          status: "success",
          url,
          result: result.result,
          screenshot: base64Screenshot,
        });
      }
    } catch (error) {
      console.error("Advanced script error:", error);
      next(error); // Pass to error handler
    }
  }
);
