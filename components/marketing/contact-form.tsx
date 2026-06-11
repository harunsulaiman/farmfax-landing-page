"use client";

import { useState } from "react";
import styles from "@/styles/modules/auth.module.css";
import pageStyles from "@/styles/modules/marketing-pages.module.css";

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const INITIAL: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export function ContactForm(): React.JSX.Element {
  const [form, setForm] = useState<ContactFormState>(INITIAL);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSent(true);
    setForm(INITIAL);
  };

  if (sent) {
    return (
      <div className={pageStyles.valueCard}>
        <h3>Message sent</h3>
        <p>
          Thank you. Our team in Maiduguri will reply within 2 working days.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="contact-name" className={styles.label}>
          Your name
        </label>
        <input
          id="contact-name"
          className={styles.input}
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="contact-email" className={styles.label}>
          Email
        </label>
        <input
          id="contact-email"
          className={styles.input}
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="contact-phone" className={styles.label}>
          Phone (optional)
        </label>
        <input
          id="contact-phone"
          className={styles.input}
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="contact-message" className={styles.label}>
          Message
        </label>
        <textarea
          id="contact-message"
          className={styles.input}
          required
          rows={4}
          style={{ minHeight: "6rem", resize: "vertical" }}
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
        />
      </div>
      <button type="submit" className={styles.submitBtn}>
        Send message
      </button>
    </form>
  );
}
