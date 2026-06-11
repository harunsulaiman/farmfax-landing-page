"use client";

import type { UserRole } from "@/lib/auth-routes";
import { LoginForm } from "@/components/auth/login-form";
import styles from "@/styles/modules/auth.module.css";

interface AuthLoginPanelProps {
  role: UserRole;
}

export function AuthLoginPanel({ role }: AuthLoginPanelProps): React.JSX.Element {
  return (
    <div className={styles.authPanel}>
      <LoginForm role={role} />
    </div>
  );
}
