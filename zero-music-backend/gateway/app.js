import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import "dotenv/config";
import { authenticateToken } from "./utils/auth.js";
import { gatewayCache } from "./middlewares/cacheMiddleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";

const app = express();

app.use(express.json());
app.use(cors());

// optional
app.use("/api", apiLimiter);

// ======== Service mapping ========
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  music: process.env.MUSIC_SERVICE_URL || "http://localhost:4002",
  post: process.env.POST_SERVICE_URL || "http://localhost:4003",
  message: process.env.MESSAGE_SERVICE_URL || "http://localhost:4004",
  user: process.env.USER_SERVICE_URL || "http://localhost:4005",
};

// ✅ Auth Service (login, register, verify)
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: SERVICES.auth,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
    logLevel: "debug", // 👈 thêm dòng này
    onError: (err, req, res) => {
      console.error("[Gateway Error]", err.message);
      res.status(500).json({ error: "Gateway cannot reach Auth service" });
    },
  })
);

const PORT = process.env.PORT || 4000;

// Logging middleware
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.originalUrl}`);
  next();
});

// Proxy
const proxyMusic = createProxyMiddleware({
  target: SERVICES.music,
  changeOrigin: true,
  bodyParser: false,
  pathRewrite: { "^/api/music": "" },
  logLevel: "debug",
});
const proxyPost = createProxyMiddleware({
  target: SERVICES.post,
  changeOrigin: true,
  pathRewrite: { "^/api/posts": "" },
});
const proxyUser = createProxyMiddleware({
  target: SERVICES.user,
  changeOrigin: true,
  pathRewrite: { "^/api/users": "" },
});

// Gateway cache
// User profiles
app.use("/api/users/:id", authenticateToken, gatewayCache(60), proxyUser);

// Playlist info
app.use("/api/playlists/:id", authenticateToken, gatewayCache(30), proxyMusic);

// Track info
app.use("/api/tracks/:id", authenticateToken, gatewayCache(60), proxyMusic);

// Search
app.use("/api/search", authenticateToken, gatewayCache(20), proxyMusic);

// Feed
app.use("/api/posts", authenticateToken, gatewayCache(15), proxyPost);

// ======== Proxy routes ========

// 🎵 Music Service (tracks, playlists, drive, favorites)
app.use("/api/music", authenticateToken, proxyMusic);

// 📝 Post Service
app.use("/api/posts", authenticateToken, proxyPost);

// 💬 Message Service
app.use(
  "/api/messages",
  authenticateToken,
  createProxyMiddleware({
    target: SERVICES.message,
    changeOrigin: true,
    pathRewrite: { "^/api/messages": "" },
  })
);

// 👤 User Service
app.use("/api/users", authenticateToken, proxyUser);

// ======== Default route ========
app.get("/", (req, res) => {
  res.send("🎧 ZeroMusic API Gateway is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 Gateway running on port ${PORT}`);
  console.table(SERVICES);
});
