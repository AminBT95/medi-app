import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerPharmacyRoutes } from "./pharmacy-routes";
import { setupVite, serveStatic, log } from "./vite";
import { testConnection } from "./database";
import path from "path";

const app = express();

// Native/mobile clients use an external API origin. Keep CORS strict in production
// by setting CORS_ORIGINS=https://dashboard.example.com,capacitor://localhost,http://localhost
app.use((req, res, next) => {
  const configured = (process.env.CORS_ORIGINS || "").split(",").map(v => v.trim()).filter(Boolean);
  const origin = req.headers.origin;
  const allowed = !origin || configured.length === 0 || configured.includes(origin) || origin === "capacitor://localhost" || origin === "http://localhost";
  if (origin && allowed) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "medi-rappel-api", timestamp: new Date().toISOString() }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add route for pharmacy ERP interface
app.get("/legacy/pharmacy", (req, res) => {
  res.sendFile(path.join(process.cwd(), "client", "pharmacy-erp.html"));
});

// Add route for doctor quick interface
app.get("/legacy/doctor", (req, res) => {
  res.sendFile(path.join(process.cwd(), "client", "doctor-quick.html"));
});

// Add route for patient registration interface
app.get("/register", (req, res) => {
  res.sendFile(path.join(process.cwd(), "client", "register-patient.html"));
});

// Add route for demo interface
app.get("/demo", (req, res) => {
  res.sendFile(path.join(process.cwd(), "client", "demo.html"));
});

// Add route for medical ERP interface
app.get("/erp", (req, res) => {
  res.sendFile(path.join(process.cwd(), "client", "erp-medical.html"));
});

// Compatibility alias: the patient Role button must open the original Pro dashboard
app.get("/roles", (_req, res) => {
  res.redirect(302, "/pro");
});

// Add route for medical Pro interface
app.get("/pro", (req, res) => {
  res.sendFile(path.join(process.cwd(), "client", "pro.html"));
});

(async () => {
  // Test database connection
  await testConnection();

  // Production data must never be silently re-seeded on every restart.
  if (process.env.SEED_DATABASE === "true") {
    try {
      const { seedDatabase } = await import("./seed-data.js");
      await seedDatabase();
    } catch (error) {
      console.log("Database seeding failed:", error);
    }
  }
  
  const server = await registerRoutes(app);
  
  // Register pharmacy routes
  await registerPharmacyRoutes(app);
  
  // Register medical routes
  const medicalRoutes = await import("./medical-routes.js");
  app.use("/api/medical", medicalRoutes.default);
  
  // Register simple pharmacy API routes
  const { registerSimpleAPI } = await import("./simple-api.js");
  registerSimpleAPI(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = Number(process.env.PORT || 5000);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
