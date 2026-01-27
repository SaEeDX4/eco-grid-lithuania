// ✅ Load environment variables explicitly from apps/api/.env
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ This ensures the correct .env file is loaded no matter where npm is run (root or api)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";

import aiRoutes from "./routes/ai.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import deviceRoutes from "./routes/devices.js";
import optimizerRoutes from "./routes/optimizer.js";
import reportsRoutes from "./routes/reports.js";
import teamRoutes from "./routes/team.js";
import partnersRoutes from "./routes/partners.js";
import contactRoutes from "./routes/contact.js";
import chatRoutes from "./routes/chat.js";

// ⭐ ADDED FOR MOD 15 FAQ
import faqRoutes from "./routes/faq.js";
import faqAdminRoutes from "./routes/faqAdmin.js";

// ✅ Added new pricing & subscription routes
import pricingRoutes from "./routes/pricing.js";
import subscriptionRoutes from "./routes/subscriptions.js";

// ✅ Added metrics and system routes + service
import metricsRoutes from "./routes/metrics.js";
import systemRoutes from "./routes/system.js";
import { startMetricsCollection } from "./services/metricsService.js";

// ✅ Added Blog & Content Routes
import articlesRoutes from "./routes/articles.js";
import newsletterRoutes from "./routes/newsletter.js";
import aiWriterRoutes from "./routes/aiWriter.js";

// ✅ Added Testimonials & Case Studies Routes
import testimonialsRoutes from "./routes/testimonials.js";
import caseStudiesRoutes from "./routes/caseStudies.js";

// ✅ Added Pilots Routes
import pilotsRoutes from "./routes/pilots.js";

// ⭐ Roadmap Routes
import roadmapRoutes from "./routes/roadmap.js";

// ⭐ VPP
import vppRoutes from "./routes/vpp.js";

// ⭐ HUB
import hubRoutes from "./routes/hub.js";

// ✅ NEW — P2P
import p2pRoutes from "./routes/p2pRoutes.js";

import { connectDB } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Check if env loaded properly
if (!process.env.MONGODB_URI) {
  console.warn(
    "⚠️  Warning: MONGODB_URI is missing. Make sure it's set in Render environment variables.",
  );
}

// ✅ Security middleware
app.use(helmet());

// =============================
// ✅ FIXED CORS CONFIG (ONLY CHANGE)
// =============================
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  // ✅ Render frontend
  "https://eco-grid.onrender.com",

  // ✅ Vercel
  "https://eco-grid-lithuania-web.vercel.app",

  // ✅ PRODUCTION DOMAINS (FIX)
  "https://eco-grid.co",
  "https://www.eco-grid.co",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // Exact match
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ✅ Allow future subdomains safely
      if (/^https:\/\/.*\.eco-grid\.co$/.test(origin)) {
        return callback(null, true);
      }

      console.warn(`🚫 Blocked CORS request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
connectDB();

// ✅ Start background metrics after DB connection
mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connected successfully");
  startMetricsCollection();
});

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Eco-Grid API is running",
    timestamp: new Date().toISOString(),
  });
});

// =============================
// 📌 API ROUTES
// =============================
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/optimizer", optimizerRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/partners", partnersRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chat", chatRoutes);

app.use("/api/faq", faqRoutes);
app.use("/api/faq/admin", faqAdminRoutes);

app.use("/api/pricing", pricingRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

app.use("/api/metrics", metricsRoutes);
app.use("/api/system", systemRoutes);

app.use("/api/articles", articlesRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/ai-writer", aiWriterRoutes);

app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/case-studies", caseStudiesRoutes);

app.use("/api/pilots", pilotsRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/vpp", vppRoutes);
app.use("/api/hub", hubRoutes);
app.use("/api/p2p", p2pRoutes);

// =============================
// 📌 ROOT DOC
// =============================
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to Eco-Grid API" });
});

// =============================
// 📌 404 HANDLER
// =============================
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.url} not found`,
  });
});

// =============================
// 📌 Global Error Handler
// =============================
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// =============================
// 📌 Start server
// =============================
app.listen(PORT, () => {
  console.log(`✅ Eco-Grid API running on port ${PORT}`);
});
