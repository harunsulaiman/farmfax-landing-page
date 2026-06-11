import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/modules/landing.module.css";

const IMPACT_ITEMS = [
  {
    id: "feed",
    title: "Feed when you need it",
    text: "No more empty ponds waiting for cash. Draw credit and get feed delivered to your farm gate.",
    src: "/images/farmer-ponds.png",
    alt: "Farmer feeding fish in ponds",
  },
  {
    id: "harvest",
    title: "Repay after harvest",
    text: "Sell your fish first. Your repayment date follows your real production calendar.",
    src: "https://images.unsplash.com/photo-1544552866-5bd6ec0f0fba?auto=format&fit=crop&w=800&q=80",
    alt: "Fresh fish ready for market",
  },
  {
    id: "trust",
    title: "Suppliers you can trust",
    text: "Verified mills and hatcheries. Every bag tracked from warehouse to pond.",
    src: "/images/hero-landscape.png",
    alt: "Aquaculture landscape in Nigeria",
  },
] as const;

export function ImpactGallery(): React.JSX.Element {
  return (
    <section className={styles.sectionImpact} aria-labelledby="impact-heading">
      <div className={styles.inner}>
        <div className={styles.impactIntro}>
          <div>
            <p className={styles.eyebrowBold}>Why FarmFax wins</p>
            <h2 id="impact-heading" className={styles.headingBold}>
              Built for African aquaculture — not generic banking
            </h2>
            <p className={styles.leadBold}>
              We understand pond cycles, feed timing, and harvest cash flow. That
              is why local farmers stay — and grow with us.
            </p>
            <Link href="/farmer/signup" className={styles.buttonPillLarge}>
              Start as a farmer
            </Link>
          </div>
          <div className={styles.impactStats}>
            <div className={styles.statBubble}>
              <span className={styles.statNumber}>500K+</span>
              <span className={styles.statLabel}>NGN credit lines</span>
            </div>
            <div className={styles.statBubble}>
              <span className={styles.statNumber}>3 min</span>
              <span className={styles.statLabel}>Average apply time</span>
            </div>
            <div className={styles.statBubble}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>OTP-verified delivery</span>
            </div>
          </div>
        </div>
        <div className={styles.impactGrid}>
          {IMPACT_ITEMS.map((item) => (
            <article key={item.id} className={styles.impactCard}>
              <div className={styles.impactCardImage}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.impactImage}
                />
                <div className={styles.impactCardOverlay} />
              </div>
              <div className={styles.impactCardBody}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
