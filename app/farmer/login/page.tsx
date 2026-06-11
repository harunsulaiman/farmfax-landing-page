import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { MarketingShell } from "@/components/layout/marketing-shell";
import styles from "@/styles/modules/auth.module.css";

export const metadata: Metadata = {
  title: "Farmer Log In · FarmFax",
  description: "Sign in to your FarmFax farmer dashboard.",
};

export default function FarmerLoginPage(): React.JSX.Element {
  return (
    <MarketingShell>
      <main className={`${styles.authPage} ${styles.authPageFarmer}`}>
        <div className={styles.authPanel}>
          <LoginForm role="farmer" />
        </div>
      </main>
    </MarketingShell>
  );
}
