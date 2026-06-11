import Link from "next/link";
import styles from "@/styles/modules/landing.module.css";

export function CtaSection(): React.JSX.Element {
  return (
    <section
      id="get-started"
      className={styles.sectionDark}
      aria-labelledby="cta-heading"
    >
      <div className={styles.inner}>
        <div className={styles.ctaPanel}>
          <div className={styles.ctaCopy}>
            <p className={styles.eyebrow}>Call to action</p>
            <h2 id="cta-heading" className={styles.heading}>
              Ready to finance ponds with harvest-grade controls?
            </h2>
            <p className={styles.lead}>
              Onboard your first fish farmer, feed supplier, or cooperative.
              Every credit event stays traceable from stocking to sale.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link href="/farmer/dashboard" className={styles.buttonOnDark}>
              Farmer portal
            </Link>
            <Link href="/supplier/dashboard" className={styles.buttonSecondary}>
              Supplier portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
