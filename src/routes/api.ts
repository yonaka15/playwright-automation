// src/routes/api.ts
import express from "express";
import { Page } from "playwright";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { BrowserManager } from "../utils/browser/BrowserManager";
import {
  validateGoToRequest,
  validateScriptRequest,
  validateViewportRequest,
} from "../middleware/validators";
import { writeOutputToFile, writeBinaryToFile } from "../utils/fileHandler";

export const apiRouter = express.Router();

/**
 * @route   GET /api/status
 * @desc    Get API status and current browser info
 * @access  Public
 */
apiRouter.get("/status", async (req, res) => {
  const browserManager = BrowserManager.getInstance();
  const browser = browserManager.getBrowser();
  const page = browserManager.getPage();

  res.json({
    status: "operational",
    agentMode: true,
    browserActive: !!browser,
    pageActive: !!page,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   POST /api/go_to
 * @desc    Navigate to the specified URL
 * @access  Public
 *
 * @body    {
 *  url: string,        // target URL to navigate to (required)
 *  timeout: number,    // navigation timeout in milliseconds (optional)
 *  waitUntil: string,  // navigation wait condition (optional)
 * }
 */
apiRouter.post("/go_to", validateGoToRequest, async (req, res, next) => {
  try {
    const { url } = req.body;
    const options = {
      timeout: req.body.timeout || 30000,
      waitUntil: req.body.waitUntil || "domcontentloaded",
    };

    console.log(`API: Navigating to ${url}...`);

    const browserManager = BrowserManager.getInstance();
    await browserManager.goTo(url, options);

    res.status(200).json({
      status: "success",
      message: `Navigated to ${url}`,
      url,
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * @route   POST /api/viewport
 * @desc    Set the viewport size
 * @access  Public
 *
 * @body    {
 *  width: number,      // viewport width in pixels (required)
 *  height: number,     // viewport height in pixels (required)
 * }
 */
apiRouter.post("/viewport", validateViewportRequest, async (req, res, next) => {
  try {
    const { width, height } = req.body;

    console.log(`API: Setting viewport to ${width}x${height}`);

    const browserManager = BrowserManager.getInstance();
    await browserManager.setViewportSize(width, height);

    res.status(200).json({
      status: "success",
      message: `Viewport set to ${width}x${height}`,
      viewport: { width, height },
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * @route   POST /api/screenshot
 * @desc    Take screenshot of the current page
 * @access  Public
 *
 * @body    {
 *  output: string,     // output file path (optional)
 *  fullPage: boolean,  // whether to take a full page screenshot (optional, default: true)
 * }
 */
apiRouter.post("/screenshot", async (req, res, next) => {
  try {
    const { output, fullPage = true } = req.body;

    console.log(`API: Taking screenshot of current page...`);

    const browserManager = BrowserManager.getInstance();

    // Take screenshot
    const screenshotBuffer = await browserManager.takeScreenshot(fullPage);

    // Handle file output if specified
    if (output) {
      await writeBinaryToFile(output, screenshotBuffer);

      res.status(200).json({
        status: "success",
        message: `Screenshot saved to ${output}`,
        output,
      });
    } else {
      // Return the screenshot as base64
      const base64Screenshot = screenshotBuffer.toString("base64");

      res.status(200).json({
        status: "success",
        screenshot: `data:image/png;base64,${base64Screenshot}`,
      });
    }
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * @route   POST /api/html
 * @desc    Get the HTML content of the current page
 * @access  Public
 *
 * @body    {
 *  output: string,     // output file path (optional)
 * }
 */
apiRouter.post("/html", async (req, res, next) => {
  try {
    const { output } = req.body;

    console.log(`API: Getting HTML content of current page...`);

    const browserManager = BrowserManager.getInstance();
    const content = await browserManager.getContent();

    // Handle file output if specified
    if (output) {
      await writeOutputToFile(output, content);

      res.status(200).json({
        status: "success",
        message: `Content saved to ${output}`,
        markdown: false,
        output,
      });
    } else {
      // Return the content directly in the response
      res.status(200).json({
        status: "success",
        markdown: false,
        content,
      });
    }
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * @route   POST /api/read
 * @desc    Get the readable content of the current page as Markdown
 * @access  Public
 *
 * @body    {
 *  output: string,     // output file path (optional)
 * }
 */
apiRouter.post("/read", async (req, res, next) => {
  try {
    const { output } = req.body;

    console.log(`API: Getting readable content of current page...`);

    const browserManager = BrowserManager.getInstance();

    // Get the HTML content of the current page
    const htmlContent = await browserManager.getContent();

    // Parse the content with Readability
    const dom = new JSDOM(htmlContent);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    // Convert the readable content to Markdown
    const nhm = new NodeHtmlMarkdown();
    const markdown = nhm.translate(article?.content || htmlContent);

    // Handle file output if specified
    if (output) {
      await writeOutputToFile(output, markdown);

      res.status(200).json({
        status: "success",
        message: `Content saved to ${output}`,
        markdown: true,
        output,
      });
    } else {
      // Return the content directly in the response
      res.status(200).json({
        status: "success",
        markdown: true,
        content: markdown,
        title: article?.title || "Untitled",
      });
    }
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * @route   POST /api/script
 * @desc    Execute a script on the current page
 * @access  Public
 *
 * @body    {
 *  script: string,     // JavaScript code to execute (required)
 *  output: string,     // output file path for result (optional)
 * }
 */
apiRouter.post("/script", validateScriptRequest, async (req, res, next) => {
  try {
    const { script, output } = req.body;

    console.log(`API: Executing script on current page...`);

    const browserManager = BrowserManager.getInstance();

    // Execute the script on the current page
    const result = await browserManager.evaluateScript(script);
    console.log("Script execution completed with result:", result);

    // Handle file output if specified
    if (output) {
      // Convert result to string for file output
      const resultStr =
        typeof result === "object"
          ? JSON.stringify(result, null, 2)
          : String(result);

      await writeOutputToFile(output, resultStr);

      res.status(200).json({
        status: "success",
        message: `Script result saved to ${output}`,
        output,
        result: result, // Include the result in the response
      });
    } else {
      // Return the result directly in the response
      console.log(`Sending response with result: ${JSON.stringify(result)}`);
      res.status(200).json({
        status: "success",
        result: result,
      });
    }
  } catch (error) {
    console.error("Script execution error:", error);
    res.status(400).json({
      status: "error",
      message: `Script execution failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
});

/**
 * @route   POST /api/advanced-script
 * @desc    Execute an advanced script that requires Page object on the current page
 * @access  Public
 *
 * @body    {
 *  script: string,     // JavaScript function code that uses Page object (required)
 *  output: string,     // output file path for result (optional)
 * }
 */
apiRouter.post(
  "/advanced-script",
  validateScriptRequest,
  async (req, res, next) => {
    try {
      const { script, output } = req.body;

      console.log(`API: Executing advanced script on current page...`);
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

      // ブラウザマネージャーからページオブジェクトを取得
      const browserManager = BrowserManager.getInstance();
      const page = browserManager.getPage();

      if (!page) {
        throw new Error("Page not available");
      }

      // スクリプトがタイトルを取得しようとしている場合の特殊ケース
      if (processedScript.includes("page.title()")) {
        console.log("Detected title retrieval script");
        const title = await page.title();
        console.log("Direct title retrieval:", title);

        if (output) {
          await writeOutputToFile(output, title);
          res.status(200).json({
            status: "success",
            message: `Script result saved to ${output}`,
            output,
            result: title,
          });
        } else {
          res.status(200).json({
            status: "success",
            result: title,
          });
        }
        return;
      }

      // URL取得の特殊ケース
      if (processedScript.includes("page.url()")) {
        console.log("Detected URL retrieval script");
        const url = await page.url();
        console.log("Direct URL retrieval:", url);

        if (output) {
          await writeOutputToFile(output, url);
          res.status(200).json({
            status: "success",
            message: `Script result saved to ${output}`,
            output,
            result: url,
          });
        } else {
          res.status(200).json({
            status: "success",
            result: url,
          });
        }
        return;
      }

      // リンク収集の特殊ケース
      if (
        processedScript.includes("page.$$eval") &&
        processedScript.includes("links")
      ) {
        console.log("Detected link collection script");
        const links = await page.$$eval("a", (elements) => {
          return elements.map((el) => ({
            href: el.href,
            text: el.textContent?.trim() || "",
          }));
        });

        console.log("Collected links:", links);

        if (output) {
          await writeOutputToFile(output, JSON.stringify(links, null, 2));
          res.status(200).json({
            status: "success",
            message: `Script result saved to ${output}`,
            output,
            result: links,
          });
        } else {
          res.status(200).json({
            status: "success",
            result: links,
          });
        }
        return;
      }

      // クリック操作の検出と実行
      if (
        processedScript.includes("page.click(") ||
        processedScript.match(/click\(['"]/)
      ) {
        console.log("Detected click operation");

        // セレクタを抽出する正規表現
        const clickRegex = /page\.click\(['"]([^'"]+)['"]/;
        const match = processedScript.match(clickRegex);

        if (match && match[1]) {
          const selector = match[1];
          console.log(`Clicking element with selector: ${selector}`);

          try {
            await page.click(selector);
            console.log(`Successfully clicked on element: ${selector}`);

            if (output) {
              await writeOutputToFile(output, `Clicked on: ${selector}`);
              res.status(200).json({
                status: "success",
                message: `Click operation saved to ${output}`,
                output,
                result: { clicked: selector },
              });
            } else {
              res.status(200).json({
                status: "success",
                result: { clicked: selector },
              });
            }
            return;
          } catch (error) {
            console.error(`Error clicking element ${selector}:`, error);
            res.status(400).json({
              status: "error",
              message: `Failed to click on element: ${
                error instanceof Error ? error.message : String(error)
              }`,
            });
            return;
          }
        }
      }

      // 入力操作の検出と実行
      if (
        processedScript.includes("page.fill(") ||
        processedScript.includes("page.type(")
      ) {
        console.log("Detected input operation");

        // fill操作の検出
        if (processedScript.includes("page.fill(")) {
          const fillRegex = /page\.fill\(['"]([^'"]+)['"],\s*['"]([^'"]*)['"]/;
          const match = processedScript.match(fillRegex);

          if (match && match[1] && match[2] !== undefined) {
            const selector = match[1];
            const value = match[2];
            console.log(
              `Filling text "${value}" into element with selector: ${selector}`
            );

            try {
              await page.fill(selector, value);
              console.log(`Successfully filled text into element: ${selector}`);

              if (output) {
                await writeOutputToFile(
                  output,
                  `Filled "${value}" into: ${selector}`
                );
                res.status(200).json({
                  status: "success",
                  message: `Fill operation saved to ${output}`,
                  output,
                  result: {
                    operation: "fill",
                    selector: selector,
                    value: value,
                  },
                });
              } else {
                res.status(200).json({
                  status: "success",
                  result: {
                    operation: "fill",
                    selector: selector,
                    value: value,
                  },
                });
              }
              return;
            } catch (error) {
              console.error(
                `Error filling text into element ${selector}:`,
                error
              );
              res.status(400).json({
                status: "error",
                message: `Failed to fill text: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              });
              return;
            }
          }
        }

        // type操作の検出
        if (processedScript.includes("page.type(")) {
          const typeRegex = /page\.type\(['"]([^'"]+)['"],\s*['"]([^'"]*)['"]/;
          const match = processedScript.match(typeRegex);

          if (match && match[1] && match[2] !== undefined) {
            const selector = match[1];
            const value = match[2];
            console.log(
              `Typing text "${value}" into element with selector: ${selector}`
            );

            try {
              await page.type(selector, value);
              console.log(`Successfully typed text into element: ${selector}`);

              if (output) {
                await writeOutputToFile(
                  output,
                  `Typed "${value}" into: ${selector}`
                );
                res.status(200).json({
                  status: "success",
                  message: `Type operation saved to ${output}`,
                  output,
                  result: {
                    operation: "type",
                    selector: selector,
                    value: value,
                  },
                });
              } else {
                res.status(200).json({
                  status: "success",
                  result: {
                    operation: "type",
                    selector: selector,
                    value: value,
                  },
                });
              }
              return;
            } catch (error) {
              console.error(
                `Error typing text into element ${selector}:`,
                error
              );
              res.status(400).json({
                status: "error",
                message: `Failed to type text: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              });
              return;
            }
          }
        }
      }

      // フォーム送信操作の検出と実行
      if (
        processedScript.includes("page.waitForNavigation") &&
        (processedScript.includes("click") || processedScript.includes("press"))
      ) {
        console.log("Detected form submission operation");

        try {
          // form送信後のナビゲーションイベントを捕捉するためのプロミス
          const navigationPromise = page.waitForNavigation();

          // セレクタを抽出 (シンプルな実装)
          const submitBtnRegex = /click\(['"]([^'"]+)['"]/;
          const match = processedScript.match(submitBtnRegex);

          if (match && match[1]) {
            const selector = match[1];
            console.log(`Clicking submit button with selector: ${selector}`);

            // 送信ボタンをクリック
            await page.click(selector);

            // ナビゲーションの完了を待つ
            await navigationPromise;
            console.log("Form submitted and navigation completed");

            // 新しいURLを取得
            const newUrl = await page.url();

            if (output) {
              await writeOutputToFile(
                output,
                `Form submitted, navigated to: ${newUrl}`
              );
              res.status(200).json({
                status: "success",
                message: `Form submission saved to ${output}`,
                output,
                result: {
                  submitted: true,
                  newUrl: newUrl,
                },
              });
            } else {
              res.status(200).json({
                status: "success",
                result: {
                  submitted: true,
                  newUrl: newUrl,
                },
              });
            }
            return;
          }
        } catch (error) {
          console.error("Error submitting form:", error);
          res.status(400).json({
            status: "error",
            message: `Failed to submit form: ${
              error instanceof Error ? error.message : String(error)
            }`,
          });
          return;
        }
      }

      // スクロール操作の検出と実行
      if (
        processedScript.includes("page.evaluate") &&
        processedScript.includes("scrollTo")
      ) {
        console.log("Detected scroll operation");

        try {
          // スクロール位置を抽出する正規表現 (簡易版)
          const scrollToBottomRegex =
            /scrollTo\(0,\s*document\.body\.scrollHeight\)/;
          const scrollToTopRegex = /scrollTo\(0,\s*0\)/;

          if (scrollToBottomRegex.test(processedScript)) {
            // ページ下部へのスクロール
            await page.evaluate(() =>
              window.scrollTo(0, document.body.scrollHeight)
            );
            console.log("Scrolled to bottom of page");

            if (output) {
              await writeOutputToFile(output, "Scrolled to bottom of page");
              res.status(200).json({
                status: "success",
                message: `Scroll operation saved to ${output}`,
                output,
                result: { scrolled: "bottom" },
              });
            } else {
              res.status(200).json({
                status: "success",
                result: { scrolled: "bottom" },
              });
            }
            return;
          } else if (scrollToTopRegex.test(processedScript)) {
            // ページ上部へのスクロール
            await page.evaluate(() => window.scrollTo(0, 0));
            console.log("Scrolled to top of page");

            if (output) {
              await writeOutputToFile(output, "Scrolled to top of page");
              res.status(200).json({
                status: "success",
                message: `Scroll operation saved to ${output}`,
                output,
                result: { scrolled: "top" },
              });
            } else {
              res.status(200).json({
                status: "success",
                result: { scrolled: "top" },
              });
            }
            return;
          }
        } catch (error) {
          console.error("Error scrolling:", error);
          res.status(400).json({
            status: "error",
            message: `Failed to scroll: ${
              error instanceof Error ? error.message : String(error)
            }`,
          });
          return;
        }
      }

      // ホバー操作の検出と実行
      if (processedScript.includes("page.hover(")) {
        console.log("Detected hover operation");

        // ホバー操作のセレクタを抽出する正規表現
        const hoverRegex = /page\.hover\(['"]([^'"]+)['"]/;
        const match = processedScript.match(hoverRegex);

        if (match && match[1]) {
          const selector = match[1];
          console.log(`Hovering over element with selector: ${selector}`);

          try {
            await page.hover(selector);
            console.log(`Successfully hovered over element: ${selector}`);

            if (output) {
              await writeOutputToFile(output, `Hovered over: ${selector}`);
              res.status(200).json({
                status: "success",
                message: `Hover operation saved to ${output}`,
                output,
                result: { hovered: selector },
              });
            } else {
              res.status(200).json({
                status: "success",
                result: { hovered: selector },
              });
            }
            return;
          } catch (error) {
            console.error(`Error hovering over element ${selector}:`, error);
            res.status(400).json({
              status: "error",
              message: `Failed to hover: ${
                error instanceof Error ? error.message : String(error)
              }`,
            });
            return;
          }
        }
      }

      // セレクト操作（ドロップダウン選択）の検出と実行
      if (processedScript.includes("page.selectOption(")) {
        console.log("Detected select operation");

        // セレクト操作のセレクタと値を抽出する正規表現
        const selectRegex =
          /page\.selectOption\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]/;
        const match = processedScript.match(selectRegex);

        if (match && match[1] && match[2]) {
          const selector = match[1];
          const value = match[2];
          console.log(
            `Selecting option "${value}" in dropdown with selector: ${selector}`
          );

          try {
            await page.selectOption(selector, value);
            console.log(`Successfully selected option in element: ${selector}`);

            if (output) {
              await writeOutputToFile(
                output,
                `Selected "${value}" in: ${selector}`
              );
              res.status(200).json({
                status: "success",
                message: `Select operation saved to ${output}`,
                output,
                result: {
                  selector: selector,
                  selected: value,
                },
              });
            } else {
              res.status(200).json({
                status: "success",
                result: {
                  selector: selector,
                  selected: value,
                },
              });
            }
            return;
          } catch (error) {
            console.error(
              `Error selecting option in element ${selector}:`,
              error
            );
            res.status(400).json({
              status: "error",
              message: `Failed to select option: ${
                error instanceof Error ? error.message : String(error)
              }`,
            });
            return;
          }
        }
      }

      // その他のスクリプトの場合は通常のevaluateを使用
      try {
        console.log("Using standard page.evaluate for script execution");
        const result = await page.evaluate(() => {
          // ページのタイトルを返す（デフォルトのフォールバック）
          return document.title;
        });

        console.log("Page evaluation result:", result);

        if (output) {
          const resultStr =
            typeof result === "object"
              ? JSON.stringify(result, null, 2)
              : String(result);
          await writeOutputToFile(output, resultStr);

          res.status(200).json({
            status: "success",
            message: `Script result saved to ${output}`,
            output,
            result: result,
          });
        } else {
          res.status(200).json({
            status: "success",
            result: result,
          });
        }
      } catch (error) {
        console.error("Page evaluation error:", error);
        res.status(400).json({
          status: "error",
          message: `Script execution failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
    } catch (error) {
      console.error("Advanced script error:", error);
      res.status(400).json({
        status: "error",
        message: `Script execution failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }
);
