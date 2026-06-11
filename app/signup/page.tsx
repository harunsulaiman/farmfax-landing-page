import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isSignupRole } from "@/lib/auth-routes";
import { AUTH_LOGIN_PATHS, AUTH_SIGNUP_PATHS } from "@/lib/auth-routes";
import { MarketingShell } from "@/components/layout/marketing-shell";
import styles from "@/styles/modules/auth.module.css";

export const metadata: Metadata = {
  title: "Sign Up · FarmFax",
  description: "Create a FarmFax farmer or supplier account.",
};

interface SignupPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function SignupPage({
  searchParams,
}: SignupPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const role = params.role;

  if (role === "admin") {
    redirect("/admin/login");
  }

  if (role && isSignupRole(role)) {
    redirect(`/${role}/signup`);
  }

  return (
    <MarketingShell>
      <main className={styles.authPage}>
        <div className={styles.authCardWide}>
          <div className={styles.authHeader}>
            <span className={styles.authBadge}>Create an account</span>
            <h1 className={styles.authTitle}>Who are you signing up as?</h1>
            <p className={styles.authSubtitle}>
              Choose farmer or supplier to register. Staff use the admin portal to
              sign in.
            </p>
          </div>
          <div className={styles.portalGrid}>
            <Link href={AUTH_SIGNUP_PATHS.farmer} className={styles.portalCardFarmer}>
              <strong>Farmer account</strong>
              <span>Apply for feed & input loans on credit</span>
              <em>Sign up →</em>
            </Link>
            <Link
              href={AUTH_SIGNUP_PATHS.supplier}
              className={styles.portalCardSupplier}
            >
              <strong>Supplier account</strong>
              <span>List products and fulfill farmer orders</span>
              <em>Register →</em>
            </Link>
            <Link href={AUTH_LOGIN_PATHS.admin} className={styles.portalCardAdmin}>
              <strong>Admin portal</strong>
              <span>Platform staff — credit approvals & operations</span>
              <em>Staff log in →</em>
            </Link>
          </div>
          <p className={styles.authFooter}>
            Already registered? <Link href="/login">Log in to your portal</Link>
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}
