import { useEffect } from "react";
import { LegalDocumentLayout } from "@/components/legal/LegalDocumentLayout";
import { TermsOfServiceBody } from "@/content/terms-of-service-body";

const LAST_UPDATED = "July 8, 2026";

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service — APrly.ai";
  }, []);

  return (
    <LegalDocumentLayout title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <TermsOfServiceBody />
    </LegalDocumentLayout>
  );
}
