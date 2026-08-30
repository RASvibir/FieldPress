import { imagesRouter } from "./routes/images";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use("/api", imagesRouter);
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
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const defaultStaticDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../fieldpress-desktop/dist/public",
);
const staticDir = process.env.STATIC_DIR
  ? path.resolve(process.cwd(), process.env.STATIC_DIR)
  : defaultStaticDir;
const indexHtml = path.join(staticDir, "index.html");

if (!process.env.VERCEL && fs.existsSync(indexHtml)) {
  app.use(express.static(staticDir));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(indexHtml);
  });
  logger.info({ staticDir }, "Serving FieldPress desktop UI");
} else {
  logger.warn({ staticDir }, "Desktop UI not built; API-only mode");
}


export default app;
