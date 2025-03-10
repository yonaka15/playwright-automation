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

**Endpoint:** `POST /api/fetch`

**Request Body:**

```json
{
  "url": "https://example.com",
  "markdown": false,
  "output": "output/result.html"
}
```

- `url` (required): Target URL to fetch
- `markdown` (optional): Convert to markdown format (default: false)
- `output` (optional): Path to save the content (if not provided, content is returned in the response)

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

#### 2. Take Screenshot

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

#### 3. API Status

**Endpoint:** `GET /api/status`

**Response:**

```json
{
  "status": "operational",
  "timestamp": "2025-03-10T12:34:56.789Z"
}
```

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
