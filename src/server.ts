// src/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { apiRouter } from "./routes/api";
import { BrowserManager } from "./utils/browser/BrowserManager";

// サーバーの設定
const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(helmet()); // セキュリティヘッダーの設定
app.use(cors()); // CORS対応
app.use(express.json()); // JSONリクエストボディのパース
app.use(morgan("dev")); // ロギング

// ルートの設定
app.use("/api", apiRouter);

// 基本的なヘルスチェックエンドポイント
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Playwright Automation API is running in agent mode",
    version: "1.0.0",
  });
});

// エラーハンドリング
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      status: "error",
      message: err.message || "Internal Server Error",
    });
  }
);

// ブラウザマネージャーのインスタンスを取得
const browserManager = BrowserManager.getInstance();

// サーバーの起動
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // サーバー起動時にブラウザを初期化
  try {
    await browserManager.initialize({ 
      headless: process.env.HEADLESS === 'true',
      viewportWidth: parseInt(process.env.VIEWPORT_WIDTH || '1280', 10),
      viewportHeight: parseInt(process.env.VIEWPORT_HEIGHT || '800', 10)
    });
    console.log('Browser agent initialized successfully');
  } catch (error) {
    console.error('Failed to initialize browser agent:', error);
  }
});

// プロセス終了時のクリーンアップ
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  await browserManager.shutdown();
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  await browserManager.shutdown();
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });
});

export default app;
