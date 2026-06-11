import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import pageStyles from "@/styles/modules/marketing-pages.module.css";

export const metadata: Metadata = {
  title: "About Us · FarmFax",
  description:
    "FarmFax supports African fish farmers with feed and input credit across Nigeria.",
};

const VALUES = [
  {
    title: "Built for pond farmers",
    text: "We start with catfish and tilapia — credit sized to real pond cycles, not generic bank forms.",
  },
  {
    title: "Fair, clear loans",
    text: "See what you borrow, what you receive, and when you repay. No hidden fees.",
  },
  {
    title: "Trusted suppliers",
    text: "Verified feed mills and hatcheries. OTP confirms every delivery at your farm.",
  },
] as const;

const TIMELINE = [
  { year: "2024", text: "Pilot with cooperatives in Borno State." },
  { year: "2025", text: "Expanded supplier network across Lagos and the North." },
  { year: "2026", text: "Full order workflow — farmer, admin, and supplier portals." },
] as const;

export default function AboutPage(): React.JSX.Element {
  return (
    <MarketingShell activeNav="about">
      <main className={pageStyles.pageMain}>
        <PageHero
          title="About FarmFax"
          subtitle="We help local fish farmers get feed and inputs on credit — grow first, pay after harvest."
        />

        <section className={pageStyles.sectionBand}>
          <div className={`${pageStyles.inner} ${pageStyles.splitFeature}`}>
            <div className={pageStyles.proseBlock}>
              <p className={pageStyles.kicker}>Our mission</p>
              <h2 className={pageStyles.sectionHeading}>
                Credit that respects the pond calendar
              </h2>
              <p>
                Cash is tight before harvest. Farmers delay feed. Stock suffers.
                FarmFax bridges that gap with in-kind loans tied to when you
                actually sell fish.
              </p>
              <p>
                Admin approves every request. Suppliers fulfill with proof.
                Everyone sees the same truth — farmers, partners, and lenders.
              </p>
            </div>
            <div className={pageStyles.imageCardTall}>
              <Image
                src="/images/farmer-ponds.png"
                alt="Fish farmer at catfish ponds in Nigeria"
                fill
                className={pageStyles.imageFill}
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
          </div>
        </section>

        <section className={pageStyles.section}>
          <div className={pageStyles.inner}>
            <h2 className={pageStyles.sectionHeadingCenter}>What we stand for</h2>
            <div className={pageStyles.gridThree}>
              {VALUES.map((item) => (
                <article key={item.title} className={pageStyles.valueCardBold}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={pageStyles.sectionMint}>
          <div className={pageStyles.inner}>
            <h2 className={pageStyles.sectionHeadingCenter}>Our journey</h2>
            <ul className={pageStyles.timeline}>
              {TIMELINE.map((step) => (
                <li key={step.year} className={pageStyles.timelineItem}>
                  <span className={pageStyles.timelineYear}>{step.year}</span>
                  <p>{step.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="team" className={pageStyles.section}>
          <div className={`${pageStyles.inner} ${pageStyles.splitFeature}`}>
            <div className={pageStyles.imageCardTall}>
              <Image
                src="/images/hero-landscape.png"
                alt="Green landscape with fish ponds"
                fill
                className={pageStyles.imageFill}
                sizes="45vw"
              />
            </div>
            <div className={pageStyles.proseBlock}>
              <p className={pageStyles.kicker}>The team</p>
              <h2 className={pageStyles.sectionHeading}>People who know the field</h2>
              <p>
                Field officers in Maiduguri. Credit analysts in Lagos. Supplier
                partners across the country — all focused on making pond credit
                simple and honest.
              </p>
              <Link href="/contact" className={pageStyles.inlineCta}>
                Talk to our team
              </Link>
            </div>
          </div>
        </section>

        <section className={pageStyles.ctaBand}>
          <h2>Join thousands of farmers on the path to better harvests</h2>
          <p>Sign up free and request your first feed loan today.</p>
          <Link href="/farmer/signup">Sign up now</Link>
        </section>
      </main>
    </MarketingShell>
  );
}
