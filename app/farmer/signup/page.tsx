import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import { MarketingShell } from "@/components/layout/marketing-shell";
import styles from "@/styles/modules/auth.module.css";

export const metadata: Metadata = {
  title: "Farmer Sign Up · FarmFax",
  description: "Create your FarmFax farmer account and apply for feed loans.",
};

export default function FarmerSignupPage(): React.JSX.Element {
  return (
    <MarketingShell>
      <main className={`${styles.authPage} ${styles.authPageFarmer}`}>
        <div className={styles.authPanel}>
          <SignupForm role="farmer" />
        </div>
      </main>
    </MarketingShell>
  );
}
