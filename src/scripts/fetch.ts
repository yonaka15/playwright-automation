// src/scripts/fetch.ts
import { Command } from "commander";
import { fetchPageContent } from "../utils/fetcher";
import fs from "fs/promises";
import path from "path";

const program = new Command();

program
  .requiredOption("-u, --url <url>", "target URL to fetch")
  .option("-m, --markdown", "convert to markdown", false)
  .option("-o, --output <file>", "output file path")
  .parse();

const options = program.opts();

console.log(`Fetching ${options.url}...`);

async function main() {
  try {
    const content = await fetchPageContent(options.url, options.markdown);

    if (options.output) {
      // Ensure the directory exists
      const dir = path.dirname(options.output);
      await fs.mkdir(dir, { recursive: true });

      // Write content to file
      await fs.writeFile(options.output, content);
      console.log(`Content saved to ${options.output}`);
    } else {
      // Output to console if no file specified
      console.log(content);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
    process.exit(1);
  }
}

main();
