import styles from "@/styles/modules/landing.module.css";

interface FinancingStep {
  id: string;
  accentClass: string;
  title: string;
  description: string;
}

const FINANCING_STEPS: readonly FinancingStep[] = [
  {
    id: "apply",
    accentClass: styles.stepAccentRose as string,
    title: "Apply in minutes",
    description:
      "Create your account and tell us about your ponds. Short form — no long paperwork.",
  },
  {
    id: "approved",
    accentClass: styles.stepAccentAmber as string,
    title: "Get approved fast",
    description:
      "We check your profile and confirm how much feed and input credit you can access.",
  },
  {
    id: "receive",
    accentClass: styles.stepAccentGreen as string,
    title: "Receive inputs & start",
    description:
      "Approved farmers get feed, fingerlings, or other essentials from our supplier network.",
  },
] as const;

export function ThreeSteps(): React.JSX.Element {
  return (
    <section
      id="three-steps"
      className={styles.sectionSteps}
      aria-labelledby="three-steps-heading"
    >
      <div className={styles.inner}>
        <div className={styles.sectionTitleBlock}>
          <h2 id="three-steps-heading" className={styles.headingCenter}>
            Your financing in 3 easy steps
          </h2>
          <span className={styles.titleUnderline} aria-hidden />
        </div>
        <div className={styles.threeStepsGrid}>
          {FINANCING_STEPS.map((step, index) => (
            <article key={step.id} className={styles.stepCardColorful}>
              <span
                className={`${styles.stepOrb} ${step.accentClass}`}
                aria-hidden
              >
                {index + 1}
              </span>
              <h3 className={styles.stepCardTitle}>{step.title}</h3>
              <p className={styles.cardBody}>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
