import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Repo-root .env when running `pnpm --filter @workspace/db run seed`
config({ path: path.resolve(__dirname, "../../../.env") });
config({ path: path.resolve(process.cwd(), ".env") });
