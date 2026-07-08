import {
  LegalH2,
  LegalH3,
  LegalP,
  LegalUl,
  formatLegalInline,
} from "@/components/legal/legal-text";

export function PrivacyPolicyBody() {
  return (
    <>
      <LegalP>
        This Privacy Policy explains how APrly (&quot;APrly,&quot; &quot;we,&quot;
        &quot;us,&quot; or &quot;our&quot;) collects, uses, discloses, and protects
        information when you use our website and web application located at aprly.ai
        and any related services (collectively, the &quot;Service&quot;). By
        accessing or using the Service, you agree to the collection and use of
        information in accordance with this Privacy Policy.
      </LegalP>
      <LegalP>
        APrly is a debt audit and optimization tool. Our Service is not legal advice,
        financial advice, tax advice, or a credit reporting service, and we are not a
        credit bureau.
      </LegalP>

      <LegalH2>1. INFORMATION WE COLLECT</LegalH2>

      <LegalH3>1.1 Account Information</LegalH3>
      <LegalP>
        When you register for an account, we collect your email address and password
        (stored as a secure, one-way hash — we never store your password in plain
        text). You may optionally provide your first and last name after
        registration.
      </LegalP>

      <LegalH3>1.2 Financial and Debt Information</LegalH3>
      <LegalP>
        To provide our debt audit and optimization service, we collect information
        about your credit cards and debt, including card issuer/brand, account
        balance, interest rate (APR), and estimated savings. This information may be
        entered manually by you or imported through our banking data partner, Plaid
        Inc. (&quot;Plaid&quot;), as described in Section 3 below.
      </LegalP>

      <LegalH3>1.3 Guest Information</LegalH3>
      <LegalP>
        If you use the debt optimizer tool on our landing page without creating an
        account, we assign your browser an anonymous guest session identifier.
        Information you enter during this guest session (such as an estimated debt
        snapshot) is temporarily stored in your browser and may be associated with a
        lead record if you later choose to submit your contact information or
        register for an account.
      </LegalP>

      <LegalH3>1.4 Payment Information</LegalH3>
      <LegalP>
        When you pay our one-time Audit Access Fee or subscribe to a paid plan, your
        payment is processed by our payment processor, Stripe Inc. (&quot;Stripe&quot;),
        as described in Section 4 below. We do not receive or store your full
        payment card number.
      </LegalP>

      <LegalH3>1.5 Communications</LegalH3>
      <LegalP>
        If you contact us, or if we send you transactional or account-related emails,
        we retain records of that correspondence and related metadata (such as
        delivery status).
      </LegalP>

      <LegalH3>1.6 Automatically Collected Information</LegalH3>
      <LegalP>
        Our servers automatically log limited technical information for security and
        operational purposes, including request method and URL path, timestamps, and
        similar diagnostic data. We do not use third-party analytics or advertising
        tracking cookies, and we do not perform device fingerprinting or collect
        precise geolocation data.
      </LegalP>

      <LegalH3>1.7 Information We Do Not Collect</LegalH3>
      <LegalP>
        We do not collect or store: your phone number; your Social Security number or
        other government tax identification number; your online banking username or
        password; your full bank account or card number (only a masked identifier,
        such as &quot;···1234,&quot; is stored); or your Plaid access token (Plaid
        tokens are used only at the moment of the request and are never persisted in
        our systems).
      </LegalP>

      <LegalH2>2. HOW WE USE YOUR INFORMATION</LegalH2>
      <LegalP>
        We use the information we collect to: create and manage your account; connect
        to your financial accounts and generate your debt audit and savings plan;
        process payments; communicate with you about your account, your audit
        results, and service-related updates; provide customer support; refer your
        information to a lending or debt-relief partner when you choose to submit a
        lead; maintain the security and integrity of the Service; and comply with our
        legal obligations.
      </LegalP>

      <LegalH2>3. PLAID — CONNECTING YOUR BANK ACCOUNTS</LegalH2>
      <LegalP>
        APrly uses Plaid to let you securely connect your credit card accounts. When
        you choose to link an account, you are redirected into Plaid&apos;s secure
        interface, where you authenticate directly with your financial institution.
        APrly never sees or stores your online banking username or password.
      </LegalP>
      <LegalP>
        Once you authorize the connection, Plaid returns account and liability data
        to us — including card issuer/brand (with a masked account number), balance,
        and interest rate — which we use to generate your debt analysis and savings
        plan. The temporary access token issued by Plaid is used only to complete
        this request and is not stored in our database.
      </LegalP>
      <LegalP>
        Plaid&apos;s use of your information is also governed by Plaid&apos;s own
        privacy policy, available at plaid.com/legal. Our use of Plaid is currently
        limited to accounts held with U.S. financial institutions.
      </LegalP>

      <LegalH2>4. STRIPE — PAYMENT PROCESSING</LegalH2>
      <LegalP>
        Payments for the Audit Access Fee (and any optional subscription) are handled
        entirely by Stripe through Stripe&apos;s hosted checkout page. Stripe
        processes and stores your payment card details in accordance with its own
        security standards and privacy policy (available at stripe.com/privacy). APrly
        retains only a reference to your Stripe customer and subscription records
        (not your card number) in order to confirm your payment status and manage
        your subscription, if applicable.
      </LegalP>

      <LegalH2>5. COOKIES AND LOCAL STORAGE</LegalH2>

      <LegalH3>5.1 Authentication Cookies</LegalH3>
      <LegalP>
        We use two essential, HTTP-only cookies to keep you securely signed in: an
        access token cookie (short-lived, approximately 15 minutes) and a refresh
        token cookie (approximately 30 days). Both are set with secure and same-site
        protections in production and cannot be read by client-side scripts.
      </LegalP>

      <LegalH3>5.2 Browser Local Storage</LegalH3>
      <LegalP>
        We use your browser&apos;s local storage to remember your anonymous guest
        session identifier (for visitors using the optimizer without an account) and
        to remember whether you have dismissed certain in-app notifications.
      </LegalP>

      <LegalH3>5.3 Browser Session Storage</LegalH3>
      <LegalP>
        We use your browser&apos;s session storage to temporarily hold optimizer
        results (such as estimated savings) as you move between steps of the landing
        page flow. This data is cleared when your browser session ends.
      </LegalP>

      <LegalH3>5.4 No Third-Party Advertising Cookies</LegalH3>
      <LegalP>
        We do not use third-party analytics, advertising, or tracking cookies, and we
        do not currently operate a cookie-consent banner because we do not deploy
        non-essential tracking cookies. If this changes, we will update this Policy
        and implement appropriate consent mechanisms.
      </LegalP>

      <LegalH2>6. HOW WE SHARE YOUR INFORMATION</LegalH2>
      <LegalP>We do not sell your personal information. We share information only in the following circumstances:</LegalP>
      <LegalUl
        items={[
          {
            label: "Service providers:",
            body: "with vendors who perform services on our behalf, as described in Section 7 below, under contractual confidentiality obligations.",
          },
          {
            label: "Debt-relief and lending partners:",
            body: "if you choose to submit your debt information for review after completing a paid audit, we internally assign your lead to one of our business partners. This is a manual, internal process through our admin system; we do not automatically transmit your data to an external partner API. Your name, contact information, and relevant financial details (card balances, rates, and estimated savings) are shared with the assigned partner in order to pursue the debt-relief or refinancing opportunity you requested.",
          },
          {
            label: "Business transfers:",
            body: "if APrly is involved in a merger, acquisition, financing, or sale of assets, your information may be transferred as part of that transaction, subject to standard confidentiality protections.",
          },
          {
            label: "Legal requirements:",
            body: "if required to do so by law, subpoena, or other legal process, or to protect the rights, property, or safety of APrly, our users, or others.",
          },
          {
            label: "With your consent:",
            body: "in any other circumstances where you have given us explicit permission.",
          },
        ]}
      />

      <LegalH2>7. THIRD-PARTY SERVICE PROVIDERS</LegalH2>
      <LegalP>
        We work with the following categories of service providers to operate the
        Service:
      </LegalP>
      <LegalP>
        Plaid Inc. — bank account connection and liability/balance data retrieval.
      </LegalP>
      <LegalP>Stripe Inc. — payment processing for the Audit Access Fee and subscriptions.</LegalP>
      <LegalP>
        SendGrid (Twilio) — transactional emails, including password reset and
        account security notifications.
      </LegalP>
      <LegalP>
        GoHighLevel — customer relationship management and lifecycle/marketing email
        communications (see Section 8).
      </LegalP>
      <LegalP>Google Fonts — used to serve web fonts on our site.</LegalP>
      <LegalP>DigitalOcean — cloud hosting for our servers and database.</LegalP>
      <LegalP>
        OpenAI — used on an optional basis to power a voice-based interaction feature.
      </LegalP>
      <LegalP>
        Each of these providers is contractually or by policy restricted from using
        your information for purposes other than providing services to APrly, except
        as required to comply with the law.
      </LegalP>

      <LegalH2>8. EMAIL COMMUNICATIONS</LegalH2>
      <LegalP>We send two categories of email:</LegalP>
      <LegalP>
        Transactional emails (via SendGrid), including password reset links and
        administrative security codes. These are necessary to operate your account and
        are not promotional.
      </LegalP>
      <LegalP>
        Lifecycle and marketing emails (via GoHighLevel), including welcome messages,
        reminders to complete or review your audit, payment confirmations, partner
        referral updates, and re-engagement messages if your account becomes inactive.
        You may opt out of marketing emails at any time using the unsubscribe link
        included in these messages. Opting out of marketing emails does not affect
        transactional emails necessary for your account and security.
      </LegalP>

      <LegalH2>9. DATA RETENTION AND DELETION</LegalH2>

      <LegalH3>9.1 Deleting Your Account</LegalH3>
      <LegalP>
        You may delete your account at any time from your account settings. When you
        do, we will: cancel any active subscription; remove your account and
        associated records (including your saved cards, debt leads, session tokens,
        and sync records) from our production database; and notify our CRM provider to
        remove your contact record.
      </LegalP>

      <LegalH3>9.2 Retention for Inactive Accounts</LegalH3>
      <LegalP>
        If your account has been inactive for approximately 6 months, we will send you
        a notice by email. If you do not log in within 14 days of that notice, your
        account and associated data will be automatically deleted using the same
        process described above.
      </LegalP>

      <LegalH3>9.3 Guest Data</LegalH3>
      <LegalP>
        Information collected during a guest session (before you register) is retained
        only long enough to connect it to your account if you subsequently register,
        or is otherwise not retained on an ongoing, identifiable basis.
      </LegalP>

      <LegalH3>9.4 Backups and Legal Retention</LegalH3>
      <LegalP>
        Residual copies of deleted data may persist for a limited period in encrypted
        backups or as required to comply with our legal, tax, or accounting
        obligations, after which they are permanently purged in the ordinary course of
        our backup rotation.
      </LegalP>

      <LegalH2>10. DATA SECURITY</LegalH2>
      <LegalP>
        We take reasonable technical and organizational measures to protect your
        information, including: encryption of data in transit via HTTPS/TLS;
        passwords stored using industry-standard one-way hashing; session tokens
        stored as hashed values in our database rather than in plain text; secure,
        HTTP-only cookies with same-site protections; access rate limiting on
        sensitive endpoints; and redaction of sensitive headers in our server logs.
        No method of transmission or storage is 100% secure, and we cannot guarantee
        absolute security.
      </LegalP>

      <LegalH2>11. YOUR CHOICES</LegalH2>
      <LegalP>
        You can review and update your account information at any time by logging
        into your dashboard. You can delete your account as described in Section 9.1.
        You can unsubscribe from marketing emails as described in Section 8. If you
        would like to request a copy of your data, or have questions about how your
        information is handled, you may contact us using the information in Section
        15.
      </LegalP>

      <LegalH2>12. CHILDREN&apos;S PRIVACY</LegalH2>
      <LegalP>
        The Service is not directed to, and is not intended for use by, anyone under
        the age of 18. We do not knowingly collect personal information from anyone
        under 18. If we learn that we have collected information from a person under
        18, we will take steps to delete it.
      </LegalP>

      <LegalH2>13. INTERNATIONAL USERS</LegalH2>
      <LegalP>
        APrly is designed for use by residents of the United States, and our
        bank-connection functionality through Plaid currently supports only U.S.
        financial institutions. If you access the Service from outside the United
        States, your information will be transferred to and processed in the United
        States, where data protection laws may differ from those in your
        jurisdiction.
      </LegalP>

      <LegalH2>14. CHANGES TO THIS POLICY</LegalH2>
      <LegalP>
        We may update this Privacy Policy from time to time. If we make material
        changes, we will update the &quot;Last Updated&quot; date above and, where
        appropriate, provide additional notice (such as by email or an in-app
        notice). Your continued use of the Service after a change becomes effective
        constitutes your acceptance of the revised Policy.
      </LegalP>

      <LegalH2>15. CONTACT US</LegalH2>
      <LegalP>
        If you have questions about this Privacy Policy or our data practices, please
        contact us at:
      </LegalP>
      <p className="text-base leading-relaxed text-foreground/85">
        APrly
        <br />
        Email: {formatLegalInline("hello@aprly.ai")}
        <br />
        Support: {formatLegalInline("support@aprly.ai")}
      </p>
    </>
  );
}
