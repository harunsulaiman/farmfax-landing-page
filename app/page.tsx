import type { Metadata } from "next";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { FaqSection } from "@/components/landing/faq-section";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ImpactGallery } from "@/components/landing/impact-gallery";
import { StoriesCarousel } from "@/components/landing/stories-carousel";
import { Testimonials } from "@/components/landing/testimonials";
import { ThreeSteps } from "@/components/landing/three-steps";

export const metadata: Metadata = {
  title: "FarmFax — Feed & Input Loans for Local Farmers",
  description:
    "Easy agricultural financing for fish farmers in Nigeria. Get feed and pond inputs on credit — repay after harvest.",
};

export default function HomePage(): React.JSX.Element {
  return (
    <MarketingShell activeNav="home">
      <main>
        <Hero />
        <ThreeSteps />
        <HowItWorks />
        <ImpactGallery />
        <StoriesCarousel />
        <Testimonials />
        <FaqSection />
      </main>
    </MarketingShell>
  );
}
