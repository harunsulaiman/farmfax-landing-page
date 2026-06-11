import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import pageStyles from "@/styles/modules/marketing-pages.module.css";

export const metadata: Metadata = {
  title: "Our Services · FarmFax",
  description:
    "Feed loans, fingerlings, supplier delivery, and dashboards for farmers in Nigeria.",
};

const SERVICES = [
  {
    icon: "🐟",
    title: "Feed & fingerling credit",
    text: "Draw credit against verified catalog items — one supplier per request.",
  },
  {
    icon: "✅",
    title: "Admin approval",
    text: "Every order is reviewed before suppliers see it.",
  },
  {
    icon: "🚚",
    title: "OTP delivery proof",
    text: "Confirm inputs at your pond with a simple code.",
  },
  {
    icon: "📊",
    title: "Farmer dashboard",
    text: "Shop, track requests, and see your credit limit live.",
  },
  {
    icon: "🏪",
    title: "Supplier network",
    text: "Multiple verified mills and hatcheries to choose from.",
  },
  {
    icon: "📱",
    title: "SMS reminders",
    text: "Friendly repayment nudges before your due date.",
  },
] as const;

export default function ServicePage(): React.JSX.Element {
  return (
    <MarketingShell activeNav="service">
      <main className={pageStyles.pageMain}>
        <PageHero
          title="Our services"
          subtitle="Everything you need to run your ponds — financing, inputs, and delivery in one place."
          ctaLabel="Apply as farmer"
          ctaHref="/farmer/signup"
        />

        <section className={pageStyles.sectionBand}>
          <div className={`${pageStyles.inner} ${pageStyles.splitFeature}`}>
            <div className={pageStyles.imageCardTall}>
              <Image
                src="/images/farmer-ponds.png"
                alt="Farmer feeding catfish"
                fill
                className={pageStyles.imageFill}
                sizes="45vw"
              />
            </div>
            <div className={pageStyles.proseBlock}>
              <p className={pageStyles.kicker}>How it works</p>
              <h2 className={pageStyles.sectionHeading}>From shop to pond in 4 steps</h2>
              <ol className={pageStyles.stepsList}>
                <li>Sign up and get verified</li>
                <li>Pick products from any supplier in the shop</li>
                <li>Admin approves your request</li>
                <li>Supplier delivers — you confirm with OTP</li>
              </ol>
              <Link href="/farmer/signup" className={pageStyles.inlineCta}>
                Start your application
              </Link>
            </div>
          </div>
        </section>

        <section className={pageStyles.section}>
          <div className={pageStyles.inner}>
            <h2 className={pageStyles.sectionHeadingCenter}>What you get</h2>
            <div className={pageStyles.gridThree}>
              {SERVICES.map((s) => (
                <article key={s.title} className={pageStyles.serviceCardBold}>
                  <span className={pageStyles.serviceIconLarge} aria-hidden>
                    {s.icon}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={pageStyles.sectionDarkBand}>
          <div className={pageStyles.innerCenter}>
            <h2>Also for suppliers & cooperatives</h2>
            <p>
              Suppliers manage catalogs and approved orders. Admins oversee credit
              for the whole network.
            </p>
            <div className={pageStyles.dualCta}>
              <Link href="/supplier/signup" className={pageStyles.ctaLight}>
                Join as supplier
              </Link>
              <Link href="/admin/login" className={pageStyles.ctaOutline}>
                Staff log in
              </Link>
            </div>
          </div>
        </section>

        <section className={pageStyles.ctaBand}>
          <h2>Ready for your next stocking cycle?</h2>
          <p>Create a free farmer account in under 3 minutes.</p>
          <Link href="/farmer/signup">Create free account</Link>
        </section>
      </main>
    </MarketingShell>
  );
}
