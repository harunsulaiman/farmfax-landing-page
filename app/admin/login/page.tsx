import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { MarketingShell } from "@/components/layout/marketing-shell";
import styles from "@/styles/modules/auth.module.css";

export const metadata: Metadata = {
  title: "Admin Log In · FarmFax",
  description: "FarmFax platform administration.",
};

export default function AdminLoginPage(): React.JSX.Element {
  return (
    <MarketingShell>
      <main className={`${styles.authPage} ${styles.authPageAdmin}`}>
        <div className={styles.authPanel}>
          <LoginForm role="admin" />
        </div>
      </main>
    </MarketingShell>
  );
}
