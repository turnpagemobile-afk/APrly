function apiBaseUrl(): string {
  const base = import.meta.env.VITE_API_URL as string | undefined;
  if (!base) return "";
  return base.replace(/\/$/, "");
}

export async function openAdminPlanLeadPdf(planId: number): Promise<void> {
  const url = `${apiBaseUrl()}/api/admin/plan-leads/${planId}/pdf`;
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`PDF export failed (${response.status})`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const opened = window.open(objectUrl, "_blank", "noopener,noreferrer");
  if (!opened) {
    URL.revokeObjectURL(objectUrl);
    throw new Error("Popup blocked");
  }
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}
