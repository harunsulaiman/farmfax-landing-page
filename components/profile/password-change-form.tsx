"use client";

import { useState } from "react";
import { readApiError } from "@/lib/api-errors";
import { validatePassword } from "@/lib/auth-validation";
import styles from "@/styles/modules/farmer-dashboard.module.css";

export function PasswordChangeForm(): React.JSX.Element {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const passwordError = validatePassword(newPassword, true);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, "Password change failed."));
      }
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Change password</h2>
      <p className={styles.panelBody}>
        Use a strong password you do not use on other sites.
      </p>
      {message ? <p className={styles.flashSuccess}>{message}</p> : null}
      {error ? <p className={styles.flashError}>{error}</p> : null}
      <form className={styles.requestForm} onSubmit={handleSubmit} noValidate>
        <label className={styles.formLabel}>
          Current password
          <input
            className={styles.formInput}
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label className={styles.formLabel}>
          New password
          <input
            className={styles.formInput}
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label className={styles.formLabel}>
          Confirm new password
          <input
            className={styles.formInput}
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className={styles.buttonPillWide}
          disabled={loading}
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </section>
  );
}
