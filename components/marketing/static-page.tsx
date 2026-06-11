import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import pageStyles from "@/styles/modules/marketing-pages.module.css";

interface StaticPageProps {
  title: string;
  subtitle: string;
  activeNav?: "about" | "service" | "contact";
  children: React.ReactNode;
}

export function StaticPage({
  title,
  subtitle,
  activeNav,
  children,
}: StaticPageProps): React.JSX.Element {
  return (
    <MarketingShell activeNav={activeNav}>
      <main className={pageStyles.pageMain}>
        <PageHero title={title} subtitle={subtitle} />
        <section className={pageStyles.sectionBand}>
          <div className={`${pageStyles.inner} ${pageStyles.proseBlock}`}>{children}</div>
        </section>
        <p className={pageStyles.inlineCtaWrap}>
          <Link href="/farmer/signup" className={pageStyles.inlineCta}>
            Get started with FarmFax
          </Link>
        </p>
      </main>
    </MarketingShell>
  );
}
