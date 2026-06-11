import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import pageStyles from "@/styles/modules/marketing-pages.module.css";

export const metadata: Metadata = {
  title: "FAQ · FarmFax",
  description: "Frequently asked questions about FarmFax loans and orders.",
};

const FAQS = [
  {
    q: "Who can apply for a feed loan?",
    a: "Verified fish farmers with an active FarmFax account and available credit limit.",
  },
  {
    q: "How long does approval take?",
    a: "Admin review is typically within one business day after you submit an input request.",
  },
  {
    q: "How do I confirm delivery?",
    a: "Share your OTP with the supplier when inputs arrive at your pond.",
  },
  {
    q: "When do I repay?",
    a: "Repayment is due on the schedule shown in your dashboard, usually aligned to harvest.",
  },
] as const;

export default function FaqPage(): React.JSX.Element {
  return (
    <StaticPage
      title="FAQ"
      subtitle="Answers to common questions about loans, orders, and repayments."
    >
      <div className={pageStyles.faqList}>
        {FAQS.map((item) => (
          <article key={item.q} className={pageStyles.faqItem}>
            <h2 className={pageStyles.faqQuestion}>{item.q}</h2>
            <p className={pageStyles.faqAnswer}>{item.a}</p>
          </article>
        ))}
      </div>
    </StaticPage>
  );
}
