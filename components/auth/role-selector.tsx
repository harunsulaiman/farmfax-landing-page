import Link from "next/link";
import type { UserRole } from "@/lib/auth-routes";
import { ROLE_LABELS } from "@/lib/auth-routes";
import styles from "@/styles/modules/auth.module.css";

interface RoleSelectorProps {
  activeRole: UserRole;
  mode: "login" | "signup";
}

const ROLES: readonly UserRole[] = ["farmer", "supplier", "admin"];

export function RoleSelector({
  activeRole,
  mode,
}: RoleSelectorProps): React.JSX.Element {
  const basePath = mode === "login" ? "/login" : "/signup";

  return (
    <div className={styles.roleTabs} role="tablist" aria-label="Account type">
      {ROLES.map((role) => (
        <Link
          key={role}
          href={`${basePath}?role=${role}`}
          role="tab"
          aria-selected={role === activeRole}
          className={
            role === activeRole ? styles.roleTabActive : styles.roleTab
          }
        >
          {ROLE_LABELS[role]}
        </Link>
      ))}
    </div>
  );
}
