import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import { ThemeProvider } from "@/components/theme-provider";
import AdminApp from "@/apps/admin/App";
import "@/index.css";

setBaseUrl(import.meta.env.VITE_API_URL || null);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AdminApp />
  </ThemeProvider>,
);
