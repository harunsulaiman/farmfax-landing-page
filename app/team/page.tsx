import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";
import pageStyles from "@/styles/modules/marketing-pages.module.css";

export const metadata: Metadata = {
  title: "Team · FarmFax",
  description: "Meet the FarmFax team behind farmer credit and supplier logistics.",
};

const TEAM = [
  { name: "Operations Team", role: "Platform & credit oversight" },
  { name: "Field cooperatives", role: "Farmer onboarding & support" },
  { name: "Supplier network", role: "Verified feed & input partners" },
] as const;

export default function TeamPage(): React.JSX.Element {
  return (
    <StaticPage
      title="Our team"
      subtitle="Farmers, operators, and suppliers working together on one platform."
      activeNav="about"
    >
      <div className={pageStyles.cardGrid}>
        {TEAM.map((member) => (
          <article key={member.name} className={pageStyles.valueCard}>
            <h2 className={pageStyles.valueTitle}>{member.name}</h2>
            <p className={pageStyles.valueText}>{member.role}</p>
          </article>
        ))}
      </div>
    </StaticPage>
  );
}
