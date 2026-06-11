"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/styles/modules/landing.module.css";

export type SiteNavId = "home" | "about" | "service" | "contact";

interface SiteHeaderProps {
  activeNav?: SiteNavId;
}

const NAV_ITEMS: readonly { id: SiteNavId; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About Us", href: "/about" },
  { id: "service", label: "Service", href: "/service" },
  { id: "contact", label: "Contact Us", href: "/contact" },
] as const;

export function SiteHeader({ activeNav }: SiteHeaderProps): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logoWordmark} aria-label="FarmFax home">
          FARMFAX
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="site-nav-mobile"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
          <span className={styles.srOnly}>Menu</span>
        </button>

        <nav className={styles.navCenter} aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={isActive ? styles.navLinkActive : styles.navLink}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          id="site-nav-mobile"
          className={menuOpen ? styles.mobileNavOpen : styles.mobileNav}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={styles.mobileNavLink}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/farmer/signup"
            className={styles.mobileNavCta}
            onClick={() => setMenuOpen(false)}
          >
            SIGN UP
          </Link>
          <Link
            href="/login"
            className={styles.mobileNavCtaSecondary}
            onClick={() => setMenuOpen(false)}
          >
            LOGIN
          </Link>
        </div>

        <div className={styles.headerActions}>
          <Link href="/farmer/signup" className={styles.headerSignUp}>
            SIGN UP
          </Link>
          <Link href="/login" className={styles.buttonPill}>
            LOGIN
          </Link>
        </div>
      </div>
    </header>
  );
}
