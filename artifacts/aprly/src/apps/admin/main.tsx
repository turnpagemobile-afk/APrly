import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import { ThemeProvider } from "@/components/theme-provider";
import AdminApp from "@/apps/admin/App";
import { normalizeAdminUrl } from "@/lib/app-navigation";
import "@/index.css";

setBaseUrl(import.meta.env.VITE_API_URL || null);

const currentUrl =
  window.location.pathname + window.location.search + window.location.hash;
const normalizedUrl = normalizeAdminUrl(currentUrl);
if (normalizedUrl !== currentUrl) {
  window.location.replace(normalizedUrl);
} else {
  bootAdminApp();
}

function bootAdminApp(): void {
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider forcedTheme="light">
      <AdminApp />
    </ThemeProvider>,
  );
}
