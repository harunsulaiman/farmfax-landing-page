import Image from "next/image";
import styles from "@/styles/modules/landing.module.css";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  role: string;
  imageSrc: string;
  imageAlt: string;
}

const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "abdullahi",
    quote:
      "Before FarmFax I delayed feed purchases every cycle. Now I stock my ponds on time and repay after I sell. My harvest went up 23% last season.",
    name: "Abdullahi Umaru",
    location: "Maiduguri, Borno",
    role: "Catfish farmer · 12 ponds",
    imageSrc: "/images/farmer-ponds.png",
    imageAlt: "Abdullahi at his fish ponds",
  },
  {
    id: "fatima",
    quote:
      "As a cooperative leader, I onboarded 40 women farmers. FarmFax made credit clear — everyone knows what they owe and when.",
    name: "Fatima Bello",
    location: "Lagos State",
    role: "Cooperative lead",
    imageSrc: "/images/hero-landscape.png",
    imageAlt: "Fish ponds in a green farming community",
  },
  {
    id: "chidi",
    quote:
      "We supply floating feed across the network. OTP delivery confirmation cut disputes with farmers. Fulfillment is faster and cleaner.",
    name: "Chidi Okafor",
    location: "Ibadan",
    role: "Feed supplier partner",
    imageSrc: "https://images.unsplash.com/photo-1544552866-5bd6ec0f0fba?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Fresh fish harvest",
  },
] as const;

export function Testimonials(): React.JSX.Element {
  return (
    <section
      className={styles.sectionTestimonials}
      aria-labelledby="testimonials-heading"
    >
      <div className={styles.inner}>
        <div className={styles.sectionTitleBlock}>
          <p className={styles.eyebrowBold}>Real voices from the field</p>
          <h2 id="testimonials-heading" className={styles.headingCenterBold}>
            Farmers & partners trust FarmFax
          </h2>
          <span className={styles.titleUnderlineWide} aria-hidden />
        </div>
        <div className={styles.testimonialGrid}>
          {TESTIMONIALS.map((item) => (
            <article key={item.id} className={styles.testimonialCard}>
              <div className={styles.testimonialPhoto}>
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  sizes="120px"
                  className={styles.testimonialImage}
                />
              </div>
              <blockquote className={styles.testimonialQuote}>
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <footer className={styles.testimonialMeta}>
                <cite className={styles.testimonialName}>{item.name}</cite>
                <span className={styles.testimonialRole}>{item.role}</span>
                <span className={styles.testimonialLocation}>{item.location}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
