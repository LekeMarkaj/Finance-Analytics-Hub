import { LegalLayout, LegalSection } from "./LegalLayout";
import { COMPANY_NAME, PRODUCT_NAME, SUPPORT_EMAIL } from "@/lib/company";
import { Link } from "wouter";

export default function Terms() {
  return (
    <LegalLayout title="Terms & Conditions" lastUpdated="July 13, 2026">
      <LegalSection heading="1. Agreement">
        <p>
          These Terms &amp; Conditions ("Terms") are an agreement between you and {COMPANY_NAME}{" "}
          ("we", "us", "our"), the operator of the {PRODUCT_NAME} (the "Service"). By creating an
          account or using the Service, you agree to be bound by these Terms. If you do not agree,
          please do not use the Service.
        </p>
      </LegalSection>

      <LegalSection heading="2. The Service">
        <p>
          The Service lets you upload financial PDF reports, extract and analyse the data they
          contain, and explore the results through interactive dashboards, charts, and reports. We
          may improve, change, or discontinue features of the Service at any time; where a change
          materially reduces functionality of a paid plan, we will provide reasonable notice.
        </p>
      </LegalSection>

      <LegalSection heading="3. Accounts">
        <p>
          You must provide accurate information when creating an account and keep your credentials
          secure. You are responsible for all activity that occurs under your account. You must be
          at least 18 years old, or the age of majority in your jurisdiction, to use the Service.
        </p>
      </LegalSection>

      <LegalSection heading="4. Plans, billing, and payments">
        <p>
          The Service offers a Free plan and paid subscription plans (Basic and Pro) with monthly or
          yearly billing. Each plan includes usage limits (for example, the number of reports you
          can create and PDFs you can upload per month) as shown on our pricing page at the time of
          purchase.
        </p>
        <p>
          Our order process is conducted by our online reseller Paddle.com. Paddle.com is the
          Merchant of Record for all our orders. Paddle provides all customer service inquiries
          related to payments and handles returns. Paddle's{" "}
          <a
            href="https://www.paddle.com/legal/checkout-buyer-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Buyer Terms
          </a>{" "}
          also apply to your purchase.
        </p>
        <p>
          Subscriptions renew automatically at the end of each billing period until cancelled. You
          can cancel at any time from your profile's billing settings; your plan remains active
          until the end of the current billing period. Prices are shown at checkout and may change
          for future billing periods with prior notice.
        </p>
      </LegalSection>

      <LegalSection heading="5. Refunds">
        <p>
          Refunds are handled according to our <Link href="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your content">
        <p>
          You retain all rights to the documents and data you upload. You grant us a limited licence
          to store and process your content solely to provide the Service to you. You are
          responsible for ensuring you have the right to upload the documents you submit and that
          doing so does not violate any law or third-party rights.
        </p>
      </LegalSection>

      <LegalSection heading="7. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>use the Service for any unlawful purpose;</li>
          <li>attempt to gain unauthorised access to the Service or other users' data;</li>
          <li>interfere with or disrupt the integrity or performance of the Service;</li>
          <li>resell or sublicense the Service without our written consent.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="8. Disclaimer">
        <p>
          The Service provides analytical tooling only and does not constitute financial, tax,
          accounting, or investment advice. Automated data extraction may contain errors — always
          verify important figures against your source documents. The Service is provided "as is"
          without warranties of any kind, to the maximum extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection heading="9. Limitation of liability">
        <p>
          To the maximum extent permitted by law, {COMPANY_NAME} shall not be liable for any
          indirect, incidental, special, or consequential damages, or for loss of profits, data, or
          business, arising from your use of the Service. Our total liability for any claim shall
          not exceed the amount you paid us in the twelve months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection heading="10. Termination">
        <p>
          You may stop using the Service and cancel your subscription at any time. We may suspend or
          terminate your access if you materially breach these Terms. Upon termination, your right
          to use the Service ceases; provisions that by their nature should survive (such as
          limitations of liability) will survive.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to these Terms">
        <p>
          We may update these Terms from time to time. If we make material changes, we will notify
          you by email or through the Service before the changes take effect. Continued use of the
          Service after changes take effect constitutes acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection heading="12. Contact">
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
