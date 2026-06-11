import styles from "@/styles/modules/farmer-dashboard.module.css";

interface DashboardNavIconProps {
  id: string;
}

export function DashboardNavIcon({ id }: DashboardNavIconProps): React.JSX.Element {
  const cls = styles.navIcon;

  switch (id) {
    case "dashboard":
    case "overview":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "apply":
    case "products":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "history":
    case "all-orders":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "repayment":
    case "loans":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "inputs":
    case "orders":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M5 6h10l-1 9H6L5 6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "yield":
    case "track":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 14l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "fulfill":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "messages":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 5.5h12v7H7l-3 2.5V5.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "profile":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 16c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="7" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="13.5" cy="9" r="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3 16c0-2.2 1.8-4 4-4M11 16c.3-1.8 1.8-3 3.5-3 1.2 0 2.3.5 3 1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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
