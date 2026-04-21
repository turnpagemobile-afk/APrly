import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", 1);

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

const skipVoice = (mw: express.RequestHandler): express.RequestHandler => (req, res, next) => {
  if (req.path.startsWith("/api/voice")) return next();
  return mw(req, res, next);
};

app.use(skipVoice(express.json({ limit: "16kb" })));
app.use(skipVoice(express.urlencoded({ extended: true, limit: "16kb" })));

const leadsRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions. Please try again later." },
});

app.use("/api/leads", leadsRateLimit);
app.use(
  "/api/voice",
  express.json({ limit: "50mb" }),
  express.urlencoded({ extended: true, limit: "50mb" }),
);
app.use("/api", router);

export default app;
