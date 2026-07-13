import { LegalLayout, LegalSection } from "./LegalLayout";
import { COMPANY_NAME, SUPPORT_EMAIL } from "@/lib/company";

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="July 13, 2026">
      <LegalSection heading="1. Overview">
        <p>
          We want you to be happy with {COMPANY_NAME}. Every paid plan starts alongside a Free plan,
          so you can try the core product before paying. If a paid subscription still isn't right
          for you, this policy explains how refunds work.
        </p>
      </LegalSection>

      <LegalSection heading="2. 14-day refund window">
        <p>
          If you are not satisfied with your purchase, you may request a full refund within{" "}
          <span className="text-foreground font-medium">14 days</span> of the initial payment of a
          new subscription. Refund requests within this window are honoured without question.
        </p>
      </LegalSection>

      <LegalSection heading="3. Renewals">
        <p>
          Subscription renewals are charged automatically. If you forgot to cancel and did not use
          the Service since the renewal, contact us within 14 days of the renewal charge and we
          will refund it.
        </p>
      </LegalSection>

      <LegalSection heading="4. How to request a refund">
        <p>
          Email us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          from the address associated with your account, including the date of the charge. You can
          also request a refund directly through Paddle, our merchant of record, by replying to
          your Paddle receipt email.
        </p>
        <p>
          Approved refunds are issued by Paddle to your original payment method, typically within
          5–10 business days depending on your bank.
        </p>
      </LegalSection>

      <LegalSection heading="5. Cancelling instead">
        <p>
          You can cancel your subscription at any time from your profile's billing settings.
          Cancelling stops future charges; your plan stays active until the end of the current
          billing period. Cancellation alone does not trigger a refund for the current period —
          request one separately if you are within the refund window.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
