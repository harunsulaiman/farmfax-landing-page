import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthPortal } from "@/components/auth/auth-portal";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { isUserRole } from "@/lib/auth-routes";
import styles from "@/styles/modules/auth.module.css";

export const metadata: Metadata = {
  title: "Log In · FarmFax",
  description: "Choose your FarmFax portal — farmer, supplier, or admin.",
};

interface LoginPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const role = params.role;

  if (role && isUserRole(role)) {
    redirect(`/${role}/login`);
  }

  return (
    <MarketingShell>
      <main className={styles.authPage}>
        <AuthPortal />
      </main>
    </MarketingShell>
  );
}
