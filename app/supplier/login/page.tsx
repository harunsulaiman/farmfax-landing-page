import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { MarketingShell } from "@/components/layout/marketing-shell";
import styles from "@/styles/modules/auth.module.css";

export const metadata: Metadata = {
  title: "Supplier Log In · FarmFax",
  description: "Sign in to your FarmFax supplier dashboard.",
};

export default function SupplierLoginPage(): React.JSX.Element {
  return (
    <MarketingShell>
      <main className={`${styles.authPage} ${styles.authPageSupplier}`}>
        <div className={styles.authPanel}>
          <LoginForm role="supplier" />
        </div>
      </main>
    </MarketingShell>
  );
}
