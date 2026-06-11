import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import pageStyles from "@/styles/modules/marketing-pages.module.css";

export const metadata: Metadata = {
  title: "Partners · FarmFax",
  description: "Partner with FarmFax as a feed supplier or cooperative.",
};

export default function PartnersPage(): React.JSX.Element {
  return (
    <StaticPage
      title="Partners"
      subtitle="Feed mills, hatcheries, and cooperatives growing with FarmFax."
      activeNav="service"
    >
      <p className={pageStyles.sectionLead}>
        Suppliers list products on FarmFax after admin verification. Farmers order on
        credit; you fulfill with OTP-confirmed delivery.
      </p>
      <h2 className={pageStyles.sectionHeading}>Become a supplier partner</h2>
      <ul className={pageStyles.bulletList}>
        <li>Verified business profile and warehouse details</li>
        <li>Products reviewed before going live in the catalog</li>
        <li>Orders routed after admin approves farmer credit</li>
      </ul>
      <p>
        Email{" "}
        <a href="mailto:partners@farmfax.com.ng">partners@farmfax.com.ng</a> to get
        started.
      </p>
    </StaticPage>
  );
}
