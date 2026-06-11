import Link from "next/link";
import styles from "@/styles/modules/farmer-dashboard.module.css";

export type FarmerNavId =
  | "dashboard"
  | "apply"
  | "history"
  | "repayment"
  | "inputs"
  | "yield"
  | "messages"
  | "profile";

interface FarmerNavItem {
  id: FarmerNavId;
  label: string;
  href: string;
}

const NAV_ITEMS: readonly FarmerNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/farmer/dashboard" },
  { id: "apply", label: "Apply for Loan", href: "/farmer/dashboard#apply" },
  { id: "history", label: "Loan History", href: "/farmer/dashboard#history" },
  { id: "repayment", label: "Repayment Schedule", href: "/farmer/dashboard#repayment" },
  { id: "inputs", label: "Input Requests", href: "/farmer/dashboard#inputs" },
  { id: "yield", label: "Yield Tracker", href: "/farmer/dashboard#yield" },
  { id: "messages", label: "Messages", href: "/farmer/dashboard#messages" },
  { id: "profile", label: "Profile", href: "/farmer/dashboard#profile" },
] as const;

interface FarmerSidebarProps {
  activeNav: FarmerNavId;
}

function NavIcon({ id }: { id: FarmerNavId }): React.JSX.Element {
  const cls = styles.navIcon;

  switch (id) {
    case "dashboard":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
  }
}

export function FarmerSidebar({
  activeNav,
}: FarmerSidebarProps): React.JSX.Element {
  return (
    <aside className={styles.sidebar} aria-label="Farmer navigation">
      <Link href="/" className={styles.sidebarLogo}>
        FARMFAX
      </Link>
      <ul className={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeNav;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={isActive ? styles.navLinkActive : styles.navLink}
                aria-current={isActive ? "page" : undefined}
              >
                <NavIcon id={item.id} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
