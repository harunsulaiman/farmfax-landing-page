import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/modules/landing.module.css";

export function Hero(): React.JSX.Element {
  return (
    <section className={styles.heroMint} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.gridHero6040}>
          <div className={styles.heroCopy}>
            <h1 id="hero-heading" className={styles.headingHeroLarge}>
              Agricultural financing{" "}
              <span className={styles.textHighlight}>made easy</span>
            </h1>
            <p className={styles.heroTagline}>
              Easy, fast loans for feed and farm inputs — built for local fish
              farmers in Nigeria and West Africa.
            </p>
            <p className={styles.lead}>
              We connect you with the right feed, fingerlings, and pond supplies.
              Apply in minutes, get verified, and receive inputs through trusted
              suppliers — repay when you harvest.
            </p>
            <Link href="/farmer/signup" className={styles.buttonPillLarge}>
              Apply Now
            </Link>
          </div>
          <figure className={styles.heroPhotoCard}>
            <div className={styles.heroPhotoFrame}>
              <Image
                src="/images/farmer-ponds.jpg"
                alt="Fish farmer at pond side in a green Nigerian farming landscape"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 42vw"
                className={styles.heroPhoto}
              />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
