// src/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { apiRouter } from "./routes/api";

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
    message: "Playwright Automation API is running",
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

// サーバーの起動
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
