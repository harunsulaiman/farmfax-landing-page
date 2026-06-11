import Link from "next/link";
import { AUTH_LOGIN_PATHS, AUTH_SIGNUP_PATHS } from "@/lib/auth-routes";
import styles from "@/styles/modules/auth.module.css";

export function AuthPortal(): React.JSX.Element {
  return (
    <div className={styles.authCardWide}>
      <div className={styles.authHeader}>
        <span className={styles.authBadge}>FarmFax portals</span>
        <h1 className={styles.authTitle}>Choose how to sign in</h1>
        <p className={styles.authSubtitle}>
          Farmers and suppliers have separate accounts and dashboards. Pick the
          portal that matches your role.
        </p>
      </div>

      <div className={styles.portalGrid}>
        <Link href={AUTH_LOGIN_PATHS.farmer} className={styles.portalCardFarmer}>
          <strong>Farmer portal</strong>
          <span>Loans, feed orders, repayments & harvest tracking</span>
          <em>Log in →</em>
        </Link>
        <Link href={AUTH_LOGIN_PATHS.supplier} className={styles.portalCardSupplier}>
          <strong>Supplier portal</strong>
          <span>Catalog, orders, deliveries & business profile</span>
          <em>Log in →</em>
        </Link>
        <Link href={AUTH_LOGIN_PATHS.admin} className={styles.portalCardAdmin}>
          <strong>Admin portal</strong>
          <span>Credit approvals, users & platform operations</span>
          <em>Staff log in →</em>
        </Link>
      </div>

      <p className={styles.authFooter}>
        <Link href={AUTH_SIGNUP_PATHS.farmer}>Farmer signup</Link>
        {" · "}
        <Link href={AUTH_SIGNUP_PATHS.supplier}>Supplier signup</Link>
        {" · "}
        <Link href={AUTH_LOGIN_PATHS.admin}>Admin login</Link>
      </p>
    </div>
  );
}
