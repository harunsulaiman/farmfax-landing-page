import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/marketing/static-page";
import pageStyles from "@/styles/modules/marketing-pages.module.css";

export const metadata: Metadata = {
  title: "Support · FarmFax",
  description: "Get help with FarmFax loans, orders, and your account.",
};

export default function SupportPage(): React.JSX.Element {
  return (
    <StaticPage
      title="Support"
      subtitle="We are here for farmers, suppliers, and partners."
      activeNav="contact"
    >
      <p className={pageStyles.sectionLead}>
        For account issues, loan questions, or delivery problems, contact our support
        team. Farmers can also check <strong>Messages</strong> in the dashboard for
        order updates.
      </p>
      <ul className={pageStyles.bulletList}>
        <li>Phone: +234 802 218 8861</li>
        <li>Email: info@farmfax.com.ng</li>
        <li>Hours: Mon–Sat, 8am–6pm WAT</li>
      </ul>
      <p>
        <Link href="/contact">Contact form</Link> ·{" "}
        <Link href="/faq">FAQ</Link>
      </p>
    </StaticPage>
  );
}
