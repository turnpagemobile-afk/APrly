import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Repo-root env files when running `pnpm --filter @workspace/db run seed` locally
config({ path: path.resolve(__dirname, "../../../.env.prod") });
config({ path: path.resolve(__dirname, "../../../.env") });
config({ path: path.resolve(process.cwd(), ".env.prod") });
config({ path: path.resolve(process.cwd(), ".env") });
