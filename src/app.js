import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import studentRoutes from "./routes/student.routes.js";
import publicRoutes from "./routes/public.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { fail } from "./utils/response.js";
import { corsConfig, corsErrorHandler } from "./config/corsConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors(corsConfig));
  app.use(corsErrorHandler);
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  // Handle invalid JSON parse errors from body-parser
  app.use((err, req, res, next) => {
    if (err && err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return fail(res, 400, "Invalid JSON body");
    }
    return next(err);
  });
  // 📁 Serve uploaded files statically
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.get("/", (req, res) => res.json({ ok: true, name: "HM LMS API" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/student", studentRoutes);
  app.use("/api/payment", paymentRoutes);

  app.use((req, res) => fail(res, 404, "Routeeeeeeeee not found"));
  return app;
}
