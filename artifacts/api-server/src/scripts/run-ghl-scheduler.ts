import "dotenv/config";
import { runGhlScheduler } from "../lib/ghl/ghl-scheduler";
import { logger } from "../lib/logger";

runGhlScheduler()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, "ghl scheduler failed");
    process.exit(1);
  });
