// src/scripts/fetch.ts
import { Command } from "commander";
import { fetchPageContent } from "../utils/fetcher";

const program = new Command();

program
  .requiredOption("-u, --url <url>", "target URL to fetch")
  .option("-m, --markdown", "convert to markdown", false)
  .parse();

const options = program.opts();

console.log(`Fetching ${options.url}...`);

fetchPageContent(options.url, options.markdown)
  .then((content) => {
    console.log(content);
  })
  .catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
