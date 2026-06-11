import { IconChevronDown } from "@/components/landing/landing-icons";
import styles from "@/styles/modules/landing.module.css";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: "models",
    question: "What financing models do you offer?",
    answer:
      "We offer in-kind loans for aquaculture — mainly feed, fingerlings, and pond inputs. You borrow supplies, not cash, and repay after harvest in Naira.",
  },
  {
    id: "apply",
    question: "Can I apply?",
    answer:
      "Yes, if you run fish ponds (catfish, tilapia, or similar) in Nigeria or West Africa and can share basic farm details. Cooperatives are welcome too.",
  },
  {
    id: "repay",
    question: "When do I repay?",
    answer:
      "Repayment is tied to your harvest window. When you sell fish, you clear your balance — we send reminders before your due date.",
  },
  {
    id: "suppliers",
    question: "Who delivers the feed?",
    answer:
      "Verified local suppliers on FarmFax. You confirm delivery at your pond with a simple OTP code.",
  },
] as const;

export function FaqSection(): React.JSX.Element {
  return (
    <section
      id="faq"
      className={styles.sectionFaq}
      data-section="faq"
      aria-labelledby="faq-heading"
    >
      <div className={styles.innerNarrow}>
        <div className={styles.sectionTitleBlock}>
          <h2 id="faq-heading" className={styles.headingCenter}>
            FAQ
          </h2>
          <span className={styles.titleUnderline} aria-hidden />
        </div>
        <div className={styles.faqListGreen}>
          {FAQ_ITEMS.map((item) => (
            <details key={item.id} className={styles.faqItemGreen}>
              <summary className={styles.faqSummaryGreen}>
                <span>{item.question}</span>
                <span className={styles.faqChevron}>
                  <IconChevronDown />
                </span>
              </summary>
              <div className={styles.faqAnswerGreen}>
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
