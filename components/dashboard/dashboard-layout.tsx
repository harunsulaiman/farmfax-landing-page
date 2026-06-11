"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardNavIcon } from "@/components/dashboard/dashboard-nav-icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import styles from "@/styles/modules/farmer-dashboard.module.css";

export interface DashboardNavItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
}

interface DashboardLayoutProps {
  portalLabel?: string;
  userName: string;
  avatarUrl?: string | null;
  activeNavId: string;
  navItems: readonly DashboardNavItem[];
  onProfileClick?: () => void;
  logoutPath?: string;
  children: React.ReactNode;
}

export function DashboardLayout({
  userName,
  avatarUrl = null,
  activeNavId,
  navItems,
  onProfileClick,
  logoutPath = "/login",
  children,
}: DashboardLayoutProps): React.JSX.Element {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async (): Promise<void> => {
    await fetch("/api/demo-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push(logoutPath);
    router.refresh();
  };

  return (
    <div className={styles.shell}>
      {sidebarOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={
          sidebarOpen ? `${styles.sidebar} ${styles.sidebarOpen}` : styles.sidebar
        }
        aria-label="Dashboard navigation"
      >
        <Link href="/" className={styles.sidebarLogo}>
          FARMFAX
        </Link>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = item.id === activeNavId;
            const className = isActive ? styles.navLinkActive : styles.navLink;
            const content = (
              <>
                <DashboardNavIcon id={item.id} />
                <span className={styles.navLabel}>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className={styles.navBadge}>{item.badge}</span>
                ) : null}
              </>
            );

            return (
              <li key={item.id}>
                {item.onClick ? (
                  <button
                    type="button"
                    className={className}
                    onClick={() => {
                      item.onClick?.();
                      setSidebarOpen(false);
                    }}
                  >
                    {content}
                  </button>
                ) : (
                  <Link
                    href={item.href ?? "#"}
                    className={className}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className={styles.logoutLink}
          onClick={() => void handleLogout()}
        >
          Log out
        </button>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={sidebarOpen}
            aria-label="Open menu"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            ☰
          </button>
          <p className={styles.welcomeText}>
            Welcome back, <strong>{userName}</strong> 👋
          </p>
          <div className={styles.topbarActions}>
            <ThemeToggle compact />
            <button
              type="button"
              className={styles.profileChip}
              onClick={onProfileClick}
              aria-label="Open profile"
            >
              <span className={styles.profileAvatar} aria-hidden>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className={styles.profileAvatarImg}
                  />
                ) : (
                  userName.charAt(0)
                )}
              </span>
              <span className={styles.profileLabel}>Profile</span>
            </button>
          </div>
        </header>
        <div className={styles.main}>{children}</div>
      </div>
    </div>
  );
}
