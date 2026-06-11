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
            Easy, fast, and sustainable agricultural financing
             — built for local farmers
            </p>
            <p className={styles.lead}>
            Connecting farmers with the right resources, loans, and insights to grow smarter, faster, and more sustainably.
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
