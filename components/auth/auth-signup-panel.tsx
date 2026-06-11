"use client";

import type { SignupRole } from "@/lib/auth-routes";
import { SignupForm } from "@/components/auth/signup-form";
import styles from "@/styles/modules/auth.module.css";

interface AuthSignupPanelProps {
  role: SignupRole;
}

export function AuthSignupPanel({ role }: AuthSignupPanelProps): React.JSX.Element {
  return (
    <div className={styles.authPanel}>
      <SignupForm role={role} />
    </div>
  );
}
