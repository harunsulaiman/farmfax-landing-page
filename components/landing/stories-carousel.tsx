import type { CarouselSlide } from "@/components/ui/image-carousel";
import { ImageCarousel } from "@/components/ui/image-carousel";
import styles from "@/styles/modules/landing.module.css";

const FARMER_STORIES: readonly CarouselSlide[] = [
  {
    id: "ponds",
    src: "/images/farmer-ponds.png",
    alt: "Fish farmer feeding catfish in lined ponds under shade nets in Nigeria",
    title: "Empowering local pond farmers",
    caption:
      "Abdullahi runs 12 catfish ponds in Borno State. FarmFax helped him get feed on credit and repay after harvest — no cash stress at the pond.",
  },
  {
    id: "landscape",
    src: "/images/hero-landscape.png",
    alt: "Smallholder fish ponds and green landscape near a Nigerian farming community",
    title: "Credit that fits your land",
    caption:
      "From village ponds to cooperative clusters, we match loans to real farm size — ponds, birds, or hectares.",
  },
  {
    id: "feed",
    src: "https://images.unsplash.com/photo-1544552866-5bd6ec0f0fba?auto=format&fit=crop&w=1200&q=80",
    alt: "Fresh fish harvest from aquaculture production",
    title: "Repay when you sell your fish",
    caption:
      "Your repayment date lines up with harvest. Sell your stock, clear your balance, and apply again for the next cycle.",
  },
] as const;

export function StoriesCarousel(): React.JSX.Element {
  return (
    <section
      id="about"
      className={styles.sectionStories}
      aria-labelledby="stories-heading"
    >
      <div className={styles.inner}>
        <div className={styles.sectionTitleBlock}>
          <p className={styles.eyebrowBold}>Stories from the pond</p>
          <h2 id="stories-heading" className={styles.headingCenterBold}>
            Empowering local farmers
          </h2>
          <span className={styles.titleUnderlineWide} aria-hidden />
          <p className={styles.leadCenter}>
            Real stories from fish farmers getting feed and inputs when they need
            them — simple loans, clear repayment, trusted suppliers.
          </p>
        </div>
        <ImageCarousel slides={FARMER_STORIES} autoAdvanceMs={7000} />
      </div>
    </section>
  );
}
