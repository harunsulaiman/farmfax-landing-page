import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { ContactForm } from "@/components/marketing/contact-form";
import { PageHero } from "@/components/marketing/page-hero";
import pageStyles from "@/styles/modules/marketing-pages.module.css";

export const metadata: Metadata = {
  title: "Contact Us · FarmFax",
  description: "Contact FarmFax support in Maiduguri, Nigeria.",
};

export default function ContactPage(): React.JSX.Element {
  return (
    <MarketingShell activeNav="contact">
      <main className={pageStyles.pageMain}>
        <PageHero
          title="Contact us"
          subtitle="Questions about loans, suppliers, or your account? We are here to help."
        />

        <section className={pageStyles.section}>
          <div className={pageStyles.inner}>
            <div className={pageStyles.contactLayout}>
              <div className={pageStyles.contactFormWrap}>
                <h2 className={pageStyles.sectionHeading}>Send a message</h2>
                <p className={pageStyles.leadSmall}>
                  We reply within 2 working days. For urgent pond issues, call
                  our Maiduguri line.
                </p>
                <ContactForm />
              </div>
              <div className={pageStyles.contactSide}>
                <div className={pageStyles.infoCardBold}>
                  <h3>FarmFax Nigeria</h3>
                  <p>
                    <strong>Office</strong>
                    <br />
                    DH-1069 Maiduguri, Borno State
                  </p>
                  <p>
                    <strong>Phone</strong>
                    <br />
                    +234 802 218 8861
                  </p>
                  <p>
                    <strong>Email</strong>
                    <br />
                    info@farmfax.com.ng
                  </p>
                  <p>
                    <strong>Hours</strong>
                    <br />
                    Mon – Fri, 8:00am – 5:00pm (WAT)
                  </p>
                </div>
                <div className={pageStyles.imageCardShort}>
                  <Image
                    src="/images/hero-landscape.png"
                    alt="Farm landscape in Nigeria"
                    fill
                    className={pageStyles.imageFill}
                    sizes="400px"
                  />
                </div>
                <p className={pageStyles.faqLink}>
                  Quick answers? See our{" "}
                  <Link href="/#faq">FAQ on the home page</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={pageStyles.ctaBand}>
          <h2>Prefer to apply online?</h2>
          <p>Create your farmer account and submit a feed request in minutes.</p>
          <Link href="/farmer/signup">Sign up free</Link>
        </section>
      </main>
    </MarketingShell>
  );
}
