// src/utils/fetcher.ts
import { chromium } from "playwright";
import { NodeHtmlMarkdown } from "node-html-markdown";

export async function fetchPageContent(
  url: string,
  asMarkdown = false
): Promise<string> {
  const browser = await chromium.launch({ headless: false });
  try {
    const page = await browser.newPage();
    await page.goto(url);
    const content = await page.content();

    if (asMarkdown) {
      const nhm = new NodeHtmlMarkdown();
      return nhm.translate(content);
    }

    return content;
  } finally {
    await browser.close();
  }
}
