"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SignupRole } from "@/lib/auth-routes";
import { getDashboardPath, getLoginPath, ROLE_LABELS } from "@/lib/auth-routes";
import { readApiError } from "@/lib/api-errors";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "@/lib/auth-validation";
import { AuthRoleTabs } from "@/components/auth/auth-role-tabs";
import styles from "@/styles/modules/auth.module.css";

type FarmFocus = "catfish" | "tilapia" | "mixed" | "other";

interface SignupFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  businessName: string;
  warehouseAddress: string;
  farmFocus: FarmFocus;
  agreed: boolean;
}

const INITIAL: SignupFormState = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  businessName: "",
  warehouseAddress: "",
  farmFocus: "catfish",
  agreed: false,
};

interface SignupFormProps {
  role: SignupRole;
}

export function SignupForm({ role }: SignupFormProps): React.JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState<SignupFormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleLabel = ROLE_LABELS[role];
  const cardClass =
    role === "farmer" ? styles.authCardFarmer : styles.authCardSupplier;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);

    const emailError = validateEmail(form.email);
    if (emailError) {
      setError(emailError);
      return;
    }
    const passwordError = validatePassword(form.password, true);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (!form.agreed) {
      setError("Please accept the terms to continue.");
      return;
    }

    const nameError = validateName(form.fullName, "Full name");
    if (nameError) {
      setError(nameError);
      return;
    }

    if (role === "farmer") {
      const phoneError = validatePhone(form.phone);
      if (phoneError) {
        setError(phoneError);
        return;
      }
    } else {
      if (!form.businessName.trim()) {
        setError("Business name is required.");
        return;
      }
      if (form.phone.trim()) {
        const phoneError = validatePhone(form.phone);
        if (phoneError) {
          setError(phoneError);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          businessName: form.businessName.trim(),
          warehouseAddress: form.warehouseAddress.trim() || undefined,
          farmFocus: form.farmFocus,
        }),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, "Sign up failed. Please try again."));
      }
      router.push(getDashboardPath(role));
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign up failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.authCardWide} ${cardClass}`}>
      <AuthRoleTabs mode="signup" active={role} />
      <div className={styles.authHeader}>
        <span className={styles.authBadge}>
          {role === "farmer" ? "🐟 Farmer registration" : "📦 Supplier registration"}
        </span>
        <h1 className={styles.authTitle}>
          {role === "farmer" ? "Start your farm account" : "Join as a supplier"}
        </h1>
        <p className={styles.authSubtitle}>
          {role === "farmer"
            ? "Free account · apply for feed & input loans · track repayments from your pond."
            : "List feed, fingerlings & equipment · receive approved orders · get paid on delivery."}
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className={styles.errorMessage} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.field}>
          <label htmlFor="signup-name" className={styles.label}>
            Full name
          </label>
          <input
            id="signup-name"
            className={styles.input}
            type="text"
            autoComplete="name"
            required
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            placeholder={role === "farmer" ? "Ibrahim Musa" : "Chidi Okafor"}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="signup-email" className={styles.label}>
            Email address
          </label>
          <input
            id="signup-email"
            className={styles.input}
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="you@example.com"
          />
        </div>

        {role === "supplier" ? (
          <>
            <div className={styles.field}>
              <label htmlFor="signup-business" className={styles.label}>
                Business name
              </label>
              <input
                id="signup-business"
                className={styles.input}
                type="text"
                required
                value={form.businessName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, businessName: e.target.value }))
                }
                placeholder="AgroSupply Lagos Ltd"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-warehouse" className={styles.label}>
                Warehouse / pickup address
              </label>
              <input
                id="signup-warehouse"
                className={styles.input}
                type="text"
                value={form.warehouseAddress}
                onChange={(e) =>
                  setForm((p) => ({ ...p, warehouseAddress: e.target.value }))
                }
                placeholder="Industrial estate, city"
              />
            </div>
          </>
        ) : null}

        {role === "farmer" ? (
          <>
            <div className={styles.field}>
              <label htmlFor="signup-phone" className={styles.label}>
                Phone number
              </label>
              <p className={styles.hint}>e.g. +234 802 000 0000</p>
              <input
                id="signup-phone"
                className={styles.input}
                type="tel"
                autoComplete="tel"
                required
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+234 802 000 0000"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-farm" className={styles.label}>
                Main farm type
              </label>
              <select
                id="signup-farm"
                className={styles.select}
                value={form.farmFocus}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    farmFocus: e.target.value as FarmFocus,
                  }))
                }
              >
                <option value="catfish">Fish farming (catfish)</option>
                <option value="tilapia">Fish farming (tilapia)</option>
                <option value="mixed">Mixed aquaculture</option>
                <option value="other">Other agriculture</option>
              </select>
            </div>
          </>
        ) : (
          <div className={styles.field}>
            <label htmlFor="signup-phone-supplier" className={styles.label}>
              Phone number
            </label>
            <input
              id="signup-phone-supplier"
              className={styles.input}
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+234 802 000 0000"
            />
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="signup-password" className={styles.label}>
            Password
          </label>
          <input
            id="signup-password"
            className={styles.input}
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="At least 6 characters"
          />
        </div>

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={form.agreed}
            onChange={(e) => setForm((p) => ({ ...p, agreed: e.target.checked }))}
          />
          <span>I agree to FarmFax {roleLabel.toLowerCase()} terms.</span>
        </label>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading
            ? "Creating account…"
            : role === "farmer"
              ? "Create farmer account"
              : "Register supplier business"}
        </button>
      </form>

      <p className={styles.authFooter}>
        Already have a {roleLabel.toLowerCase()} account?{" "}
        <Link href={getLoginPath(role)}>Log in here</Link>
        {" · "}
        <Link href={getLoginPath(role === "farmer" ? "supplier" : "farmer")}>
          {role === "farmer" ? "Supplier login" : "Farmer login"}
        </Link>
        {" · "}
        <Link href={getLoginPath("admin")}>Admin login</Link>
      </p>
    </div>
  );
}
