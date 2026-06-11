import {
  IconFeedCredit,
  IconPondProfile,
  IconVerifiedDelivery,
} from "@/components/landing/landing-icons";
import styles from "@/styles/modules/landing.module.css";

interface ServiceStep {
  id: string;
  title: string;
  description: string;
  icon: React.JSX.Element;
}

const SERVICE_STEPS: readonly ServiceStep[] = [
  {
    id: "signup",
    title: "Sign up and apply",
    description:
      "Create your account and share basic details about your farm. We keep it simple — no stress, no long forms.",
    icon: <IconPondProfile />,
  },
  {
    id: "verified",
    title: "Get verified",
    description:
      "Our team reviews your profile and confirms if you qualify for feed loans and input support.",
    icon: <IconFeedCredit />,
  },
  {
    id: "access",
    title: "Access inputs",
    description:
      "Once approved, receive the right farm inputs — feed, fingerlings, or pond essentials — through our network.",
    icon: <IconVerifiedDelivery />,
  },
] as const;

export function HowItWorks(): React.JSX.Element {
  return (
    <section
      id="how-it-works"
      className={styles.sectionAlt}
      aria-labelledby="how-it-works-heading"
    >
      <div className={styles.inner}>
        <div className={styles.sectionTitleBlock}>
          <h2 id="how-it-works-heading" className={styles.headingCenter}>
            How it works
          </h2>
          <span className={styles.titleUnderline} aria-hidden />
        </div>
        <div className={styles.stepsGrid}>
          {SERVICE_STEPS.map((step) => (
            <article key={step.id} className={styles.serviceCard}>
              <span className={styles.serviceIconCircle}>{step.icon}</span>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardBody}>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
