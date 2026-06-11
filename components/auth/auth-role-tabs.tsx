import Link from "next/link";
import type { UserRole } from "@/lib/auth-routes";
import {
  AUTH_LOGIN_PATHS,
  AUTH_SIGNUP_PATHS,
  ROLE_LABELS,
} from "@/lib/auth-routes";
import styles from "@/styles/modules/auth.module.css";

interface AuthRoleTabsProps {
  mode: "login" | "signup";
  active: UserRole | "farmer" | "supplier";
}

export function AuthRoleTabs({ mode, active }: AuthRoleTabsProps): React.JSX.Element {
  const farmerHref =
    mode === "login" ? AUTH_LOGIN_PATHS.farmer : AUTH_SIGNUP_PATHS.farmer;
  const supplierHref =
    mode === "login" ? AUTH_LOGIN_PATHS.supplier : AUTH_SIGNUP_PATHS.supplier;
  const adminHref = AUTH_LOGIN_PATHS.admin;

  return (
    <div className={styles.roleTabs} role="tablist" aria-label="Account type">
      <Link
        href={farmerHref}
        className={active === "farmer" ? styles.roleTabActive : styles.roleTab}
        role="tab"
        aria-selected={active === "farmer"}
      >
        {ROLE_LABELS.farmer}
      </Link>
      <Link
        href={supplierHref}
        className={active === "supplier" ? styles.roleTabActive : styles.roleTab}
        role="tab"
        aria-selected={active === "supplier"}
      >
        {ROLE_LABELS.supplier}
      </Link>
      <Link
        href={adminHref}
        className={active === "admin" ? styles.roleTabActive : styles.roleTab}
        role="tab"
        aria-selected={active === "admin"}
      >
        {ROLE_LABELS.admin}
      </Link>
    </div>
  );
}
