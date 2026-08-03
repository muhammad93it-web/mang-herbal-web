import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import path from "node:path";
import { inspect } from "node:util";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { redactSecrets } from "./lib/redact";

const app: Express = express();

// When STATIC_DIR is set (self-hosted/production package), the server also
// serves the built storefront. Unset in the Replit dev environment.
const staticDir = process.env.STATIC_DIR
  ? path.resolve(process.cwd(), process.env.STATIC_DIR)
  : null;

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes are mounted first so nothing can ever shadow them.
app.use("/api", router);

if (staticDir) {
  // redirect:false — /products is both a public/ subfolder and an SPA route;
  // the static dir-redirect would break client-side routing.
  app.use(express.static(staticDir, { redirect: false }));

  // SPA fallback: any non-API GET serves the storefront's index.html.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(staticDir, "index.html"));
  });
} else {
  // Root probe (preview/monitoring tools hit "/"); keep logs free of 404 noise.
  app.get("/", (_req, res) => {
    res.json({ status: "ok", service: "mang-herbal-api" });
  });
}

// Final error handler: logs the FULL cause chain (drizzle wraps the real pg
// error in err.cause, which the default handler never printed) and answers
// JSON instead of Express's HTML error page.
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("Unhandled error:", redactSecrets(inspect(err, { depth: 6 })));
  if (!res.headersSent) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
app.use(errorHandler);

export default app;
