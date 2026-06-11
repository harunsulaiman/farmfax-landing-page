import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import { MarketingShell } from "@/components/layout/marketing-shell";
import styles from "@/styles/modules/auth.module.css";

export const metadata: Metadata = {
  title: "Supplier Sign Up · FarmFax",
  description: "Register your agro business on the FarmFax supplier network.",
};

export default function SupplierSignupPage(): React.JSX.Element {
  return (
    <MarketingShell>
      <main className={`${styles.authPage} ${styles.authPageSupplier}`}>
        <div className={styles.authPanel}>
          <SignupForm role="supplier" />
        </div>
      </main>
    </MarketingShell>
  );
}
