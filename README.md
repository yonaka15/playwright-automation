# playwright-automation

Simple command line tool to fetch web page source using Playwright, with optional Markdown conversion.

## Features

- Fetch web page source
- Fetch web page source and convert to Markdown
- Simple command line interface

## Usage

### Basic HTML Fetch

Fetch page source in HTML format from specified URL:

```bash
npm run fetch -- --url <url>

# Example
npm run fetch -- --url https://example.com
```

### Markdown Conversion

Fetch page source and convert to Markdown:

```bash
npm run fetch -- --url <url> --markdown

# Example
npm run fetch -- --url https://example.com --markdown
```

### Options

- `-u, --url <url>`: Target URL to fetch (required)
- `-m, --markdown`: Convert output to Markdown format (optional)

## Example Output

### HTML Format

```html
<h1>Example Domain</h1>
<p>This domain is for use in illustrative examples in documents...</p>
```

### Markdown Format

```markdown
# Example Domain

This domain is for use in illustrative examples in documents...
```
