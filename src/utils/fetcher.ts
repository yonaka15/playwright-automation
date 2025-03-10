// src/utils/fetcher.ts
import { chromium, Page, ChromiumBrowser } from "playwright";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

interface FetchOptions {
  headless?: boolean;
  waitForNetworkIdle?: boolean;
  timeout?: number;
}

const DEFAULT_OPTIONS: FetchOptions = {
  headless: false,
  timeout: 30000,
};

/**
 * Fetch content from a web page using Playwright
 *
 * @param url URL to fetch
 * @param asMarkdown Convert HTML to Markdown
 * @param asReadability use Mozilla Readability to extract content
 * @param options Additional fetch options
 * @returns Page content as HTML or Markdown
 */
export async function fetchPageContent(
  url: string,
  asMarkdown = false,
  asReadability = false,
  options: FetchOptions = {}
): Promise<string> {
  // Merge default options with provided options
  const settings: FetchOptions = { ...DEFAULT_OPTIONS, ...options };

  let browser: ChromiumBrowser | null = null;

  try {
    // Launch browser
    browser = await chromium.launch({
      headless: settings.headless,
    });

    // Create new page
    const page = await browser.newPage();

    // Navigate to URL with timeout
    await page.goto(url, {
      timeout: settings.timeout,
      waitUntil: "domcontentloaded",
    });

    // Get page content
    const content = await (async () => {
      const content = await page.content();
      if (asReadability) {
        const dom = new JSDOM(content, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        return article?.content || content;
      }
      return content;
    })();

    // Convert to markdown if requested
    if (asMarkdown) {
      const nhm = new NodeHtmlMarkdown();
      return nhm.translate(content);
    }

    return content;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw new Error(
      `Failed to fetch page content: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  } finally {
    // Always close browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Take a screenshot of a webpage
 *
 * @param url URL to screenshot
 * @param options Screenshot options
 * @returns Buffer containing the screenshot image
 */
export async function takeScreenshot(
  url: string,
  options: FetchOptions = {}
): Promise<Buffer> {
  const settings: FetchOptions = { ...DEFAULT_OPTIONS, ...options };
  let browser: ChromiumBrowser | null = null;

  try {
    browser = await chromium.launch({
      headless: settings.headless,
    });

    const page = await browser.newPage();

    await page.goto(url, {
      timeout: settings.timeout,
      waitUntil: "load",
    });

    // Take screenshot of full page
    return await page.screenshot({ fullPage: true });
  } catch (error) {
    console.error(`Error taking screenshot of ${url}:`, error);
    throw new Error(
      `Failed to take screenshot: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
