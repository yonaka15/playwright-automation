// src/utils/fetcher.ts

import { chromium } from "playwright";

export async function fetchPageContent(url: string): Promise<string> {
  const browser = await chromium.launch({ headless: false });
  try {
    const page = await browser.newPage();
    await page.goto(url);
    const content = await page.content();
    return content;
  } finally {
    await browser.close();
  }
}
