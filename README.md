# Playwright Automation API

Web content fetching tool and API using Playwright.

## CLI Usage

```bash
# Save page as HTML
npm run fetch -- -u https://example.com -o output/output.html

# Save as Markdown
npm run fetch -- -u https://example.com -o output/output.md -m
```

## CLI Options

- `-u, --url <url>`: Target URL to fetch (required)
- `-o, --output <file>`: Output file path (required)
- `-m, --markdown`: Convert to markdown format

## API Usage

### Starting the Server

```bash
# Start the API server
npm start

# Start development server with auto-reload
npm run dev
```

The server will start on port 3000 by default (configurable via PORT environment variable).

### API Endpoints

#### 1. Fetch Web Content

**Endpoint:** `POST /api/html`

**Request Body:**

```json
{
  "url": "https://example.com",
  "output": "output/result.html",
  "headless": true
}
```

- `url` (required): Target URL to fetch
- `output` (optional): Path to save the content (if not provided, content is returned in the response)
- `headless` (optional): Run in headless mode (default: true)

**Response:**

When `output` is provided:

```json
{
  "status": "success",
  "message": "Content saved to output/result.html",
  "url": "https://example.com",
  "markdown": false,
  "output": "output/result.html"
}
```

When `output` is not provided:

```json
{
  "status": "success",
  "url": "https://example.com",
  "markdown": false,
  "content": "<!DOCTYPE html><html>..."
}
```

#### 2. Fetch Readable Content

**Endpoint:** `POST /api/read`

**Request Body:**

```json
{
  "url": "https://example.com",
  "output": "output/result.md"
}
```

- `url` (required): Target URL to fetch
- `output` (optional): Path to save the content (if not provided, content is returned in the response)
- `headless` (optional): Run in headless mode (default: true)

**Response:** Similar to `/api/html` endpoint, but content is converted to markdown format.

#### 3. Take Screenshot

**Endpoint:** `POST /api/screenshot`

**Request Body:**

```json
{
  "url": "https://example.com",
  "output": "output/screenshot.png",
  "headless": true
}
```

- `url` (required): Target URL to screenshot
- `output` (optional): Path to save the screenshot (if not provided, screenshot is returned as base64 in the response)
- `headless` (optional): Run in headless mode (default: true)

**Response:**

When `output` is provided:

```json
{
  "status": "success",
  "message": "Screenshot saved to output/screenshot.png",
  "url": "https://example.com",
  "output": "output/screenshot.png"
}
```

When `output` is not provided:

```json
{
  "status": "success",
  "url": "https://example.com",
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhE..."
}
```

#### 4. Execute Script

**Endpoint:** `POST /api/script`

Executes a JavaScript script in the context of the web page. This is useful for extracting data, manipulating the DOM, or performing calculations using the browser's JavaScript engine.

**Request Body:**

```json
{
  "url": "https://example.com",
  "script": "return document.title;",
  "output": "output/result.json",
  "headless": true,
  "timeout": 30000
}
```

- `url` (required): Target URL to execute script on
- `script` (required): JavaScript code to execute in the page context
- `output` (optional): Path to save the result (if not provided, result is returned in the response)
- `headless` (optional): Run in headless mode (default: true)
- `timeout` (optional): Timeout in milliseconds (default: 30000)
- `waitUntil` (optional): Navigation wait condition ("load", "domcontentloaded", "networkidle")

**Response:**

When `output` is provided:

```json
{
  "status": "success",
  "message": "Script result saved to output/result.json",
  "url": "https://example.com",
  "output": "output/result.json",
  "result": "Example Domain",
  "screenshot": "output/result.json.png"
}
```

When `output` is not provided:

```json
{
  "status": "success",
  "url": "https://example.com",
  "result": "Example Domain",
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhE..."
}
```

#### 5. Execute Advanced Script

**Endpoint:** `POST /api/advanced-script`

This endpoint allows running scripts that require access to the Playwright `Page` object. This enables more complex operations like clicking elements, filling forms, and other browser automation tasks.

**Request Body:**

```json
{
  "url": "https://example.com",
  "script": "async function run(page) { return await page.title(); }",
  "output": "output/result.json",
  "headless": true,
  "timeout": 30000
}
```

- `url` (required): Target URL to execute script on
- `script` (required): JavaScript function code that uses the Page object
- `output` (optional): Path to save the result (if not provided, result is returned in the response)
- `headless` (optional): Run in headless mode (default: true)
- `timeout` (optional): Timeout in milliseconds (default: 30000)
- `waitUntil` (optional): Navigation wait condition ("load", "domcontentloaded", "networkidle")

**Response:** Similar to `/api/script` endpoint.

#### 6. API Status

**Endpoint:** `GET /api/status`

**Response:**

```json
{
  "status": "operational",
  "timestamp": "2025-03-10T12:34:56.789Z"
}
```

## Script Examples

### Basic Script Examples

Basic scripts are executed in the browser's page context and can access the DOM and browser APIs.

```javascript
// Get the page title
return document.title;
```

```javascript
// Extract all links from the page
const links = Array.from(document.querySelectorAll("a")).map((a) => ({
  text: a.innerText,
  href: a.href,
}));
return links;
```

```javascript
// Get all images with their properties
const images = Array.from(document.querySelectorAll("img")).map((img) => ({
  src: img.src,
  alt: img.alt,
  width: img.width,
  height: img.height,
}));
return images;
```

```javascript
// Extract meta tags
const metadata = {};
document.querySelectorAll("meta").forEach((meta) => {
  if (meta.name) {
    metadata[meta.name] = meta.content;
  } else if (meta.property) {
    metadata[meta.property] = meta.content;
  }
});
return metadata;
```

### Advanced Script Examples

Advanced scripts have access to the Playwright `Page` object and can perform browser automation.

```javascript
// Function form with explicit return
async function run(page) {
  // Get page title
  return await page.title();
}
```

```javascript
// Fill a form and submit
async function run(page) {
  // Fill a form and submit
  await page.fill('input[name="username"]', "testuser");
  await page.fill('input[name="password"]', "password");
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForNavigation();

  // Return the result
  return {
    title: await page.title(),
    url: page.url(),
    content: await page.textContent(".main-content"),
  };
}
```

```javascript
// Get all text content from paragraphs
async function run(page) {
  const paragraphs = await page.$$eval("p", (elements) =>
    elements.map((el) => el.textContent.trim())
  );
  return paragraphs;
}
```

```javascript
// Take a screenshot of a specific element
async function run(page) {
  const elementHandle = await page.$(".hero-section");
  const screenshot = await elementHandle.screenshot();
  // Convert to base64 for returning
  return {
    base64: screenshot.toString("base64"),
  };
}
```

## Differences Between Basic and Advanced Scripts

| Feature           | Basic Script (`/api/script`) | Advanced Script (`/api/advanced-script`) |
| ----------------- | ---------------------------- | ---------------------------------------- |
| Execution Context | Browser's page context       | Node.js with access to Page object       |
| Available APIs    | DOM APIs, Browser APIs       | Playwright Page API + DOM APIs           |
| Common Uses       | Data extraction, DOM queries | Complex automation, user simulation      |
| Script Format     | JavaScript statements        | Function with Page parameter             |
| Async Support     | Limited                      | Full support for async/await             |

## Development

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration

The following environment variables can be used to configure the server:

- `PORT`: Server port (default: 3000)
