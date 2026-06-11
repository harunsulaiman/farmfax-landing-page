import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import pageStyles from "@/styles/modules/marketing-pages.module.css";

export const metadata: Metadata = {
  title: "Our Mission · FarmFax",
  description: "FarmFax mission — credit and inputs aligned to the pond calendar.",
};

export default function MissionPage(): React.JSX.Element {
  return (
    <StaticPage
      title="Our mission"
      subtitle="Credit that respects the pond calendar — grow first, repay after harvest."
      activeNav="about"
    >
      <p className={pageStyles.sectionLead}>
        FarmFax exists so fish farmers can access feed and inputs when they need them,
        not when banks are ready. We align loan cycles to real harvest timelines and
        verify every delivery at the pond.
      </p>
      <h2 className={pageStyles.sectionHeading}>What we believe</h2>
      <ul className={pageStyles.bulletList}>
        <li>Farmers deserve transparent credit with no hidden fees.</li>
        <li>Suppliers should reach verified buyers without middlemen.</li>
        <li>Technology should work on mobile networks farmers already use.</li>
      </ul>
    </StaticPage>
  );
}
