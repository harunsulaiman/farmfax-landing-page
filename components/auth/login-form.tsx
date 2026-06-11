"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UserRole } from "@/lib/auth-routes";
import {
  getDashboardPath,
  getLoginPath,
  getSignupPath,
  ROLE_LABELS,
} from "@/lib/auth-routes";
import { readApiError } from "@/lib/api-errors";
import { validateEmail, validatePassword } from "@/lib/auth-validation";
import { AuthRoleTabs } from "@/components/auth/auth-role-tabs";
import styles from "@/styles/modules/auth.module.css";

interface LoginFormProps {
  role: UserRole;
}

export function LoginForm({ role }: LoginFormProps): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleLabel = ROLE_LABELS[role];
  const cardClass =
    role === "farmer"
      ? styles.authCardFarmer
      : role === "supplier"
        ? styles.authCardSupplier
        : styles.authCardAdmin;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email: email.trim(), password }),
      });
      if (!res.ok) {
        throw new Error(
          await readApiError(res, "Login failed. Check your email and password."),
        );
      }
      router.push(getDashboardPath(role));
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  const subtitle =
    role === "farmer"
      ? "Your loans, feed orders, repayments and pond activity."
      : role === "supplier"
        ? "Your catalog, farmer orders and delivery workflow."
        : "Platform operations — credit, users and catalog oversight.";

  return (
    <div className={`${styles.authCard} ${cardClass}`}>
      <AuthRoleTabs mode="login" active={role} />
      <div className={styles.authHeader}>
        <span className={styles.authBadge}>
          {role === "farmer"
            ? "🐟 Farmer portal"
            : role === "supplier"
              ? "📦 Supplier portal"
              : "🛡️ Admin portal"}
        </span>
        <h1 className={styles.authTitle}>Welcome back</h1>
        <p className={styles.authSubtitle}>{subtitle}</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className={styles.errorMessage} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.field}>
          <label htmlFor="login-email" className={styles.label}>
            Email address
          </label>
          <input
            id="login-email"
            className={styles.input}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="login-password" className={styles.label}>
            Password
          </label>
          <input
            id="login-password"
            className={styles.input}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Signing in…" : `Log in to ${roleLabel} dashboard`}
        </button>
      </form>

      {role === "admin" ? (
        <p className={styles.authFooterMuted}>
          Admin accounts are created by the development team. Contact your
          platform operator if you need access.
        </p>
      ) : (
        <p className={styles.authFooter}>
          New {roleLabel.toLowerCase()}?{" "}
          <Link href={getSignupPath(role)}>Create an account</Link>
          {" · "}
          <Link href={getSignupPath(role === "farmer" ? "supplier" : "farmer")}>
            {role === "farmer" ? "Supplier signup" : "Farmer signup"}
          </Link>
          {" · "}
          <Link href={getLoginPath("admin")}>Admin login</Link>
        </p>
      )}
    </div>
  );
}
