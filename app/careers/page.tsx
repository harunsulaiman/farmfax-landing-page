import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import pageStyles from "@/styles/modules/marketing-pages.module.css";

export const metadata: Metadata = {
  title: "Careers · FarmFax",
  description: "Join the FarmFax team building aquaculture finance in Nigeria.",
};

export default function CareersPage(): React.JSX.Element {
  return (
    <StaticPage
      title="Careers"
      subtitle="Help us scale fair credit for pond farmers across Nigeria."
      activeNav="contact"
    >
      <p className={pageStyles.sectionLead}>
        We are growing our operations, credit, and field teams. If you care about
        agriculture and financial inclusion, we would like to hear from you.
      </p>
      <h2 className={pageStyles.sectionHeading}>Open roles</h2>
      <ul className={pageStyles.bulletList}>
        <li>Field officer — Borno &amp; North-East cooperatives</li>
        <li>Credit operations analyst — Maiduguri / remote</li>
        <li>Supplier partnerships — Lagos</li>
      </ul>
      <p>
        Send your CV to{" "}
        <a href="mailto:careers@farmfax.com.ng">careers@farmfax.com.ng</a>.
      </p>
    </StaticPage>
  );
}
