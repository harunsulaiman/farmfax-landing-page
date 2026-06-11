import type { SiteNavId } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import styles from "@/styles/modules/landing.module.css";

interface MarketingShellProps {
  children: React.ReactNode;
  activeNav?: SiteNavId;
}

export function MarketingShell({
  children,
  activeNav,
}: MarketingShellProps): React.JSX.Element {
  return (
    <div className={styles.page}>
      <SiteHeader activeNav={activeNav} />
      {children}
      <SiteFooter />
    </div>
  );
}
