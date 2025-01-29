# Playwright Automation

Web content fetching tool using Playwright.

## Usage

```bash
# Save page as HTML
npm run fetch -- -u https://example.com -o output/output.html

# Save as Markdown
npm run fetch -- -u https://example.com -o output/output.md -m
```

## Options

- `-u, --url <url>`: Target URL to fetch (required)
- `-o, --output <file>`: Output file path (required)
- `-m, --markdown`: Convert to markdown format
