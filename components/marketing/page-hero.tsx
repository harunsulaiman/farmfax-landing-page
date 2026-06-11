import Link from "next/link";
import styles from "@/styles/modules/marketing-pages.module.css";

interface PageHeroProps {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function PageHero({
  title,
  subtitle,
  ctaLabel,
  ctaHref = "/farmer/signup",
}: PageHeroProps): React.JSX.Element {
  return (
    <section className={styles.pageHero}>
      <div className={styles.pageHeroInner}>
        <h1 className={styles.pageHeroTitle}>{title}</h1>
        <span className={styles.pageHeroUnderline} aria-hidden />
        <p className={styles.pageHeroSubtitle}>{subtitle}</p>
        {ctaLabel ? (
          <Link href={ctaHref} className={styles.pageHeroCta}>
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
