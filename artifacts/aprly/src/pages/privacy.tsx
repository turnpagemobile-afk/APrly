import { useEffect } from "react";
import { LegalDocumentLayout } from "@/components/legal/LegalDocumentLayout";
import { PrivacyPolicyBody } from "@/content/privacy-policy-body";

const LAST_UPDATED = "July 8, 2026";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy — APrly.ai";
  }, []);

  return (
    <LegalDocumentLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <PrivacyPolicyBody />
    </LegalDocumentLayout>
  );
}
