"use client";

import { useTheme } from "@/components/theme/theme-provider";
import styles from "@/styles/modules/theme-toggle.module.css";

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps): React.JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={compact ? styles.toggleCompact : styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className={styles.icon} aria-hidden>
        {isDark ? "☀" : "☾"}
      </span>
      {!compact ? (
        <span className={styles.label}>{isDark ? "Light" : "Dark"}</span>
      ) : null}
    </button>
  );
}
