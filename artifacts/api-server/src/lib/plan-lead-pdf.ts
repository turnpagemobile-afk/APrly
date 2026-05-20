import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import type { PlanLead } from "@workspace/db";
import { buildHardshipPortal } from "./build-hardship-portal";
import { HARDSHIP_STEPS_TOTAL } from "./hardship-steps";
import {
  resolveAdminUserPlanDisplayStatus,
  type AdminUserPlanDisplayStatus,
} from "./plan-lead-display-status";
import { isValidImportCardForPlanLead } from "./plan-lead-validation";

const BRAND_ORANGE = "#FF3C00";
const MARGIN = 50;
const PAGE_BOTTOM = 720;
const ROW_PADDING = 8;
const LOGO_FIT_WIDTH = 120;
const LOGO_FIT_HEIGHT = 40;

const DISPLAY_STATUS_LABELS: Record<AdminUserPlanDisplayStatus, string> = {
  not_sent: "Not sent",
  on_review: "On review",
  in_progress: "In progress",
  won: "Won",
  rejected: "Rejected",
};

const MAIN_STATUS_LABELS: Record<PlanLead["status"], string> = {
  recommended: "Recommended",
  in_progress: "In progress",
  won: "Won",
  denied: "Denied",
};

type PdfInput = {
  lead: PlanLead;
  user: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  partner: { id: number; name: string } | null;
};

function formatUserName(first: string | null, last: string | null): string {
  const a = (first ?? "").trim();
  const b = (last ?? "").trim();
  return `${a} ${b}`.trim() || "—";
}

function formatDateTime(value: Date | null | undefined): string {
  if (!value) return "—";
  return value.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

type PdfDoc = InstanceType<typeof PDFDocument>;

function resolveAprlyLogoPath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    process.env.APRLY_PDF_LOGO_PATH,
    path.join(cwd, "assets", "aprly-logo.png"),
    path.join(cwd, "artifacts", "api-server", "assets", "aprly-logo.png"),
    path.resolve(cwd, "..", "..", "artifacts", "api-server", "assets", "aprly-logo.png"),
  ].filter((p): p is string => Boolean(p?.trim()));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function drawPdfHeader(doc: PdfDoc, lead: PlanLead) {
  const logoPath = resolveAprlyLogoPath();
  let contentTop = MARGIN;

  if (logoPath) {
    doc.image(logoPath, MARGIN, MARGIN, {
      fit: [LOGO_FIT_WIDTH, LOGO_FIT_HEIGHT],
    });
    contentTop = MARGIN + LOGO_FIT_HEIGHT + 12;
  } else {
    doc.fillColor(BRAND_ORANGE).fontSize(22).font("Helvetica-Bold").text("APRly", MARGIN, MARGIN, {
      lineBreak: false,
    });
    contentTop = MARGIN + 28;
  }

  doc.fillColor("#111111").fontSize(16).font("Helvetica-Bold").text(
    `Lead #${lead.id} — ${lead.brand}`,
    MARGIN,
    contentTop,
  );
  doc.fontSize(9).font("Helvetica").fillColor("#666666").text(
    `Plan Lead Report · Generated ${formatDateTime(new Date())}`,
    MARGIN,
    doc.y + 4,
  );
  doc.fillColor("#111111");
  doc.moveDown(0.5);
}

function drawSectionTitle(doc: PdfDoc, title: string) {
  doc.moveDown(0.5);
  doc.fillColor(BRAND_ORANGE).fontSize(12).font("Helvetica-Bold").text(title);
  doc.fillColor("#111111").moveDown(0.25);
}

function drawKeyValue(doc: PdfDoc, label: string, value: string) {
  doc.fontSize(10).font("Helvetica-Bold").text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(value);
}

type RequiredRow = {
  field: string;
  value: string;
  required: string;
  ok: boolean;
};

function buildRequiredRows(input: PdfInput): RequiredRow[] {
  const { lead, partner } = input;
  const balance = Number(lead.balance);
  const currentApr = Number(lead.currentApr);
  const sent = lead.status === "in_progress" || lead.status === "won";

  const source =
    lead.plaidAccountId != null
      ? `Plaid account ${lead.plaidAccountId}`
      : lead.userCardId != null
        ? `Linked card #${lead.userCardId}`
        : "Manual entry";

  const rows: RequiredRow[] = [
    {
      field: "Brand",
      value: lead.brand,
      required: "Non-empty",
      ok: lead.brand.trim().length > 0,
    },
    {
      field: "Balance",
      value: formatCurrency(balance),
      required: "> 0",
      ok: balance > 0,
    },
    {
      field: "Current APR",
      value: `${currentApr.toFixed(2)}%`,
      required: "> 0",
      ok: currentApr > 0,
    },
    {
      field: "Target APR",
      value: `${Number(lead.targetApr).toFixed(1)}%`,
      required: "Set",
      ok: Number.isFinite(Number(lead.targetApr)),
    },
    {
      field: "Est. annual savings",
      value: formatCurrency(Number(lead.estimatedAnnualSavings)),
      required: "Set",
      ok: Number.isFinite(Number(lead.estimatedAnnualSavings)),
    },
    {
      field: "Main status",
      value: MAIN_STATUS_LABELS[lead.status],
      required: "Set",
      ok: true,
    },
    {
      field: "Created at",
      value: formatDateTime(lead.createdAt),
      required: "Set",
      ok: true,
    },
    {
      field: "Data source",
      value: source,
      required: "Identified",
      ok: true,
    },
    {
      field: "Import validation",
      value: isValidImportCardForPlanLead({
        brand: lead.brand,
        balance,
        rate: currentApr,
      })
        ? "Pass"
        : "Fail",
      required: "brand, balance > 0, rate > 0",
      ok: isValidImportCardForPlanLead({ brand: lead.brand, balance, rate: currentApr }),
    },
  ];

  if (sent) {
    rows.push(
      {
        field: "Partner ID",
        value: lead.partnerId != null ? String(lead.partnerId) : "—",
        required: "After send",
        ok: lead.partnerId != null,
      },
      {
        field: "Partner name",
        value: partner?.name ?? "—",
        required: "After send",
        ok: Boolean(partner?.name),
      },
      {
        field: "Sent to partner at",
        value: formatDateTime(lead.sentToPartnerAt),
        required: "After send",
        ok: lead.sentToPartnerAt != null,
      },
    );
  }

  return rows;
}

const TABLE_COLS = {
  field: { x: MARGIN, width: 120 },
  value: { x: MARGIN + 130, width: 140 },
  required: { x: MARGIN + 280, width: 110 },
  ok: { x: MARGIN + 400, width: 40 },
} as const;

function cellHeight(doc: PdfDoc, text: string, width: number): number {
  return doc.heightOfString(text, { width });
}

function drawTableRow(
  doc: PdfDoc,
  y: number,
  cells: { field: string; value: string; required: string; ok: boolean },
): number {
  const h = Math.max(
    cellHeight(doc, cells.field, TABLE_COLS.field.width),
    cellHeight(doc, cells.value, TABLE_COLS.value.width),
    cellHeight(doc, cells.required, TABLE_COLS.required.width),
    cellHeight(doc, cells.ok ? "Yes" : "No", TABLE_COLS.ok.width),
  );
  doc.fillColor("#111111").text(cells.field, TABLE_COLS.field.x, y, {
    width: TABLE_COLS.field.width,
  });
  doc.text(cells.value, TABLE_COLS.value.x, y, { width: TABLE_COLS.value.width });
  doc.text(cells.required, TABLE_COLS.required.x, y, {
    width: TABLE_COLS.required.width,
  });
  doc.fillColor(cells.ok ? "#15803d" : "#b91c1c").text(
    cells.ok ? "Yes" : "No",
    TABLE_COLS.ok.x,
    y,
    { width: TABLE_COLS.ok.width },
  );
  doc.fillColor("#111111");
  return h + ROW_PADDING;
}

function drawRequiredTable(doc: PdfDoc, rows: RequiredRow[]) {
  let y = doc.y;

  doc.fontSize(9).font("Helvetica-Bold");
  const headerH = drawTableRow(doc, y, {
    field: "Field",
    value: "Value",
    required: "Required",
    ok: true,
  });
  y += headerH - ROW_PADDING + 2;
  doc.moveTo(MARGIN, y).lineTo(545, y).strokeColor("#cccccc").stroke();
  y += 6;

  doc.font("Helvetica").fontSize(9);
  for (const row of rows) {
    if (y > PAGE_BOTTOM) {
      doc.addPage();
      y = MARGIN;
    }
    y += drawTableRow(doc, y, row);
  }
  doc.y = y + 4;
}

export function buildPlanLeadPdfBuffer(input: PdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { lead, user, partner } = input;
    const displayStatus = resolveAdminUserPlanDisplayStatus({
      status: lead.status,
      partnerId: lead.partnerId,
      partnerAcceptedAt: lead.partnerAcceptedAt,
    });

    const hardshipPortal =
      lead.partnerAcceptedAt != null && lead.status === "in_progress"
        ? buildHardshipPortal(lead.hardshipStepsCompleted)
        : lead.status === "won"
          ? buildHardshipPortal(HARDSHIP_STEPS_TOTAL)
          : null;

    const activeStep = hardshipPortal?.steps.find((s) => s.status === "active");

    drawPdfHeader(doc, lead);

    drawSectionTitle(doc, "Partner");
    if (partner) {
      drawKeyValue(doc, "Name", partner.name);
      drawKeyValue(doc, "ID", String(partner.id));
    } else {
      doc.fontSize(10).font("Helvetica").text("Not assigned");
    }

    drawSectionTitle(doc, "User (lead owner)");
    drawKeyValue(doc, "Name", formatUserName(user.firstName, user.lastName));
    drawKeyValue(doc, "Email", user.email);
    drawKeyValue(doc, "User ID", String(user.id));

    drawSectionTitle(doc, "Status");
    drawKeyValue(doc, "Main status", MAIN_STATUS_LABELS[lead.status]);
    drawKeyValue(doc, "Lifecycle status", DISPLAY_STATUS_LABELS[displayStatus]);

    drawSectionTitle(doc, "Timeline");
    drawKeyValue(doc, "Lead created", formatDateTime(lead.createdAt));
    drawKeyValue(doc, "Sent to partner", formatDateTime(lead.sentToPartnerAt));
    drawKeyValue(doc, "Partner started working", formatDateTime(lead.partnerAcceptedAt));
    drawKeyValue(
      doc,
      "Current lifecycle status since",
      formatDateTime(lead.displayStatusChangedAt),
    );
    drawKeyValue(doc, "Last updated", formatDateTime(lead.updatedAt));

    drawSectionTitle(doc, "Lead financials");
    drawKeyValue(doc, "Brand", lead.brand);
    drawKeyValue(doc, "Debt balance", formatCurrency(Number(lead.balance)));
    drawKeyValue(doc, "Current APR", `${Number(lead.currentApr).toFixed(2)}%`);
    drawKeyValue(doc, "Target APR", `${Number(lead.targetApr).toFixed(1)}%`);
    drawKeyValue(
      doc,
      "Est. annual savings",
      formatCurrency(Number(lead.estimatedAnnualSavings)),
    );
    drawKeyValue(
      doc,
      "Hardship steps",
      `${lead.hardshipStepsCompleted} / ${HARDSHIP_STEPS_TOTAL}`,
    );
    if (activeStep) {
      drawKeyValue(doc, "Active hardship step", activeStep.name);
    } else if (hardshipPortal) {
      drawKeyValue(doc, "Hardship portal stage", hardshipPortal.stage);
    }

    drawSectionTitle(doc, "Partner packet / required data");
    drawRequiredTable(doc, buildRequiredRows(input));

    doc.end();
  });
}
