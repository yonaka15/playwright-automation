# Playwright Automation API

Web content fetching tool and API using Playwright.

## CLI Usage

```bash
# Save page as HTML
npm run fetch -- -u https://example.com -o output/output.html

# Save as Markdown
npm run fetch -- -u https://example.com -o output/output.md -m

# Custom viewport size
npm run fetch -- -u https://example.com -o output/output.html -w 1024 -h 768
```

## CLI Options

- `-u, --url <url>`: Target URL to fetch (required)
- `-o, --output <file>`: Output file path (required)
- `-m, --markdown`: Convert to markdown format
- `-w, --width <number>`: Viewport width in pixels (default: 800)
- `-h, --height <number>`: Viewport height in pixels (default: 600)

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
  "headless": true,
  "viewportWidth": 800,
  "viewportHeight": 600
}
```

- `url` (required): Target URL to fetch
- `output` (optional): Path to save the content (if not provided, content is returned in the response)
- `headless` (optional): Run in headless mode (default: true)
- `viewportWidth` (optional): Viewport width in pixels (default: 800)
- `viewportHeight` (optional): Viewport height in pixels (default: 600)

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
  "output": "output/result.md",
  "viewportWidth": 800,
  "viewportHeight": 600
}
```

- `url` (required): Target URL to fetch
- `output` (optional): Path to save the content (if not provided, content is returned in the response)
- `headless` (optional): Run in headless mode (default: true)
- `viewportWidth` (optional): Viewport width in pixels (default: 800)
- `viewportHeight` (optional): Viewport height in pixels (default: 600)

**Response:** Similar to `/api/html` endpoint, but content is converted to markdown format.

#### 3. Take Screenshot

**Endpoint:** `POST /api/screenshot`

**Request Body:**

```json
{
  "url": "https://example.com",
  "output": "output/screenshot.png",
  "headless": true,
  "viewportWidth": 800,
  "viewportHeight": 600
}
```

- `url` (required): Target URL to screenshot
- `output` (optional): Path to save the screenshot (if not provided, screenshot is returned as base64 in the response)
- `headless` (optional): Run in headless mode (default: true)
- `viewportWidth` (optional): Viewport width in pixels (default: 800)
- `viewportHeight` (optional): Viewport height in pixels (default: 600)

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
