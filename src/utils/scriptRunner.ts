// src/utils/scriptRunner.ts
import { chromium, ChromiumBrowser, Page } from "playwright";
import { BrowserOptions, ScriptResult } from "../types";

const DEFAULT_OPTIONS: BrowserOptions = {
  headless: true,
  timeout: 30000,
  waitUntil: "load",
  viewportWidth: 800, // デフォルト値を設定
  viewportHeight: 600, // デフォルト値を設定
};

/**
 * Run a custom script on a webpage using Playwright
 *
 * @param url URL where the script will be executed
 * @param script JavaScript code to execute on the page
 * @param options Script execution options
 * @returns Result of script execution
 */
export async function runScript(
  url: string,
  script: string,
  options: BrowserOptions = {}
): Promise<ScriptResult> {
  // Merge default options with provided options
  const settings: BrowserOptions = { ...DEFAULT_OPTIONS, ...options };

  let browser: ChromiumBrowser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser
    browser = await chromium.launch({
      headless: settings.headless,
    });

    // Create new page
    page = await browser.newPage();

    // Set viewport size
    await page.setViewportSize({
      width: settings.viewportWidth || DEFAULT_OPTIONS.viewportWidth!,
      height: settings.viewportHeight || DEFAULT_OPTIONS.viewportHeight!,
    });

    // Navigate to URL with timeout
    await page.goto(url, {
      timeout: settings.timeout,
      waitUntil: settings.waitUntil,
    });

    // Execute the script in the page context
    // If the script starts with 'return', wrap it in an IIFE
    let result;
    if (script.trim().startsWith("return ")) {
      result = await page.evaluate(`(function() { ${script} })()`);
    } else {
      // If it doesn't start with return, add it
      result = await page.evaluate(`(function() { return ${script} })()`);
    }

    console.log("Script execution result:", result);

    // Take a screenshot for reference
    const screenshot = await page.screenshot({ fullPage: true });

    return {
      success: true,
      result,
      screenshot,
    };
  } catch (error) {
    console.error(`Error executing script on ${url}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    // Always close browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Run a custom script on a webpage using Playwright with isolated page context
 * Allows use of page object in the provided function
 *
 * @param url URL where the script will be executed
 * @param scriptFn Function that receives Page object and executes custom logic
 * @param options Script execution options
 * @returns Result of script execution
 */
export async function runAdvancedScript(
  url: string,
  scriptFn: (page: Page) => Promise<any>,
  options: BrowserOptions = {}
): Promise<ScriptResult> {
  // Merge default options with provided options
  const settings: BrowserOptions = { ...DEFAULT_OPTIONS, ...options };

  let browser: ChromiumBrowser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser
    browser = await chromium.launch({
      headless: settings.headless,
    });

    // Create new page
    page = await browser.newPage();

    // Set viewport size
    await page.setViewportSize({
      width: settings.viewportWidth || DEFAULT_OPTIONS.viewportWidth!,
      height: settings.viewportHeight || DEFAULT_OPTIONS.viewportHeight!,
    });

    // Navigate to URL with timeout
    await page.goto(url, {
      timeout: settings.timeout,
      waitUntil: settings.waitUntil,
    });

    // Execute the provided function with page context
    // This is where we directly call the provided function with the page object
    console.log("Executing advanced script function");
    const result = await scriptFn(page);
    console.log("Advanced script execution result:", result);

    // Take a screenshot for reference
    const screenshot = await page.screenshot({ fullPage: true });

    return {
      success: true,
      result,
      screenshot,
    };
  } catch (error) {
    console.error(`Error executing advanced script on ${url}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    // Always close browser and page
    if (browser) {
      await browser.close();
    }
  }
}
