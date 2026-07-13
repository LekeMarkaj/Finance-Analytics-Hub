import { LegalLayout, LegalSection } from "./LegalLayout";
import { COMPANY_NAME, PRODUCT_NAME, SUPPORT_EMAIL } from "@/lib/company";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="July 13, 2026">
      <LegalSection heading="1. Who we are">
        <p>
          This Privacy Policy explains how {COMPANY_NAME} ("we", "us", "our") collects, uses, and
          protects your personal data when you use the {PRODUCT_NAME} (the "Service"). If you have
          any questions, contact us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="2. Data we collect">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <span className="text-foreground font-medium">Account data</span> — your name, email
            address, and authentication details, collected when you sign up.
          </li>
          <li>
            <span className="text-foreground font-medium">Uploaded content</span> — the PDF
            documents you upload and the financial data extracted from them.
          </li>
          <li>
            <span className="text-foreground font-medium">Billing data</span> — subscription plan,
            billing status, and transaction references. Full payment details (such as card numbers)
            are collected and processed by our payment provider, Paddle — we never see or store
            them.
          </li>
          <li>
            <span className="text-foreground font-medium">Usage data</span> — basic technical logs
            (such as IP address and browser type) needed to operate and secure the Service.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. How we use your data">
        <ul className="list-disc pl-6 space-y-1">
          <li>to provide the Service, including processing and analysing your uploaded documents;</li>
          <li>to manage your account, subscription, and billing;</li>
          <li>to respond to support requests;</li>
          <li>to maintain the security and reliability of the Service;</li>
          <li>to comply with legal obligations.</li>
        </ul>
        <p>We do not sell your personal data, and we do not use your documents for advertising.</p>
      </LegalSection>

      <LegalSection heading="4. Service providers">
        <p>We share data only with the providers needed to run the Service:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <span className="text-foreground font-medium">Paddle.com</span> — our merchant of
            record, which processes payments and manages subscriptions (see Paddle's privacy
            policy at paddle.com/legal/privacy);
          </li>
          <li>
            <span className="text-foreground font-medium">Clerk</span> — our authentication
            provider, which manages sign-in and account security;
          </li>
          <li>
            <span className="text-foreground font-medium">Hosting and AI processing providers</span>{" "}
            — used to store data and to extract text and figures from the documents you upload.
            Document content is processed only to provide the analysis features you request.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Data retention">
        <p>
          We keep your account data and uploaded content for as long as your account is active. You
          can delete individual reports and uploads at any time from within the Service. If you ask
          us to delete your account, we will remove your personal data within 30 days, except where
          we must retain records to meet legal or accounting obligations.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your rights">
        <p>
          Depending on your location, you may have the right to access, correct, export, or delete
          your personal data, and to object to or restrict certain processing. To exercise any of
          these rights, email us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          and we will respond within 30 days.
        </p>
      </LegalSection>

      <LegalSection heading="7. Security">
        <p>
          All data is transmitted over encrypted connections (HTTPS). Access to your data is
          restricted to your authenticated account, and payment webhooks are cryptographically
          verified. No method of storage or transmission is 100% secure, but we work to protect
          your data using industry-standard measures.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be announced
          by email or within the Service before they take effect. The "Last updated" date above
          reflects the latest revision.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
