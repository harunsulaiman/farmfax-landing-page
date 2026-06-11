"use client";

import { useCallback, useEffect, useId, useState } from "react";
import styles from "@/styles/modules/farmer-dashboard.module.css";

export type FarmType =
  | "catfish"
  | "tilapia"
  | "mixed"
  | "poultry"
  | "crop";

interface CreditApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreditFormState {
  farmType: FarmType | "";
  pondCount: string;
  feedBags: string;
  feedBrand: string;
  deliveryDate: string;
}

const INITIAL_FORM: CreditFormState = {
  farmType: "catfish",
  pondCount: "",
  feedBags: "",
  feedBrand: "coppens",
  deliveryDate: "",
};

const FARM_TYPES: readonly { value: FarmType; label: string }[] = [
  { value: "catfish", label: "Fish farming (catfish)" },
  { value: "tilapia", label: "Fish farming (tilapia)" },
  { value: "mixed", label: "Mixed aquaculture" },
  { value: "poultry", label: "Poultry" },
  { value: "crop", label: "Crop / other" },
];

const FEED_BRANDS: readonly { value: string; label: string }[] = [
  { value: "coppens", label: "Coppens" },
  { value: "aller", label: "Aller Aqua" },
  { value: "skretting", label: "Skretting" },
  { value: "local", label: "Local mill" },
];

export function CreditApplicationModal({
  isOpen,
  onClose,
}: CreditApplicationModalProps): React.JSX.Element | null {
  const titleId = useId();
  const [form, setForm] = useState<CreditFormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleClose = (): void => {
    setForm(INITIAL_FORM);
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.modalHeader}>
          <h2 id={titleId} className={styles.modalTitle}>
            Apply for feed loan
          </h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {submitted ? (
          <div className={styles.successBox} role="status">
            <p className={styles.successTitle}>Request sent!</p>
            <p className={styles.successBody}>
              We will review your {form.feedBags || "feed"} bag request for{" "}
              {form.pondCount || "your"} ponds and contact you within 2 working
              days.
            </p>
            <button
              type="button"
              className={styles.buttonPill}
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="farm-type" className={styles.label}>
                Farm type
              </label>
              <p className={styles.fieldHint}>
                Tell us what you produce so we match the right loan.
              </p>
              <select
                id="farm-type"
                className={styles.select}
                value={form.farmType}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    farmType: e.target.value as FarmType,
                  }))
                }
              >
                {FARM_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="pond-count" className={styles.label}>
                Number of ponds / birds / hectares
              </label>
              <p className={styles.fieldHint}>e.g. 12 ponds</p>
              <input
                id="pond-count"
                className={styles.input}
                type="text"
                required
                placeholder="e.g. 12 ponds"
                value={form.pondCount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pondCount: e.target.value }))
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="feed-bags" className={styles.label}>
                Feed required (bags)
              </label>
              <p className={styles.fieldHint}>
                How many 15kg or 25kg bags do you need this cycle?
              </p>
              <input
                id="feed-bags"
                className={styles.input}
                type="number"
                min={1}
                required
                placeholder="50"
                value={form.feedBags}
                onChange={(e) =>
                  setForm((p) => ({ ...p, feedBags: e.target.value }))
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="feed-brand" className={styles.label}>
                Preferred feed brand
              </label>
              <select
                id="feed-brand"
                className={styles.select}
                value={form.feedBrand}
                onChange={(e) =>
                  setForm((p) => ({ ...p, feedBrand: e.target.value }))
                }
              >
                {FEED_BRANDS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="delivery-date" className={styles.label}>
                Preferred delivery date
              </label>
              <input
                id="delivery-date"
                className={styles.input}
                type="date"
                required
                value={form.deliveryDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, deliveryDate: e.target.value }))
                }
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.buttonPill}>
                Submit application
              </button>
              <button
                type="button"
                className={styles.buttonGhost}
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
