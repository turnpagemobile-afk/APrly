import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import { ThemeProvider } from "@/components/theme-provider";
import LandingApp from "@/apps/landing/App";
import { applyLandingLightDocumentTheme } from "@/lib/landing-document-theme";
import { unregisterLegacyServiceWorkers } from "@/lib/pwa/unregister-legacy-service-workers";
import "@/index.css";

setBaseUrl(import.meta.env.VITE_API_URL || null);
applyLandingLightDocumentTheme();

async function bootstrap() {
  await unregisterLegacyServiceWorkers();
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider forcedTheme="light">
      <LandingApp />
    </ThemeProvider>,
  );
}

void bootstrap();
