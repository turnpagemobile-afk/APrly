import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import { ThemeProvider } from "@/components/theme-provider";
import MonoApp from "@/apps/mono/App";
import "@/index.css";

setBaseUrl(import.meta.env.VITE_API_URL || null);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <MonoApp />
  </ThemeProvider>,
);
