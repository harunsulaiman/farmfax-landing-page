import styles from "@/styles/modules/farmer-dashboard.module.css";

export function DashboardFlash({
  message,
  error,
}: {
  message: string | null;
  error: string | null;
}): React.JSX.Element | null {
  if (!message && !error) return null;
  return (
    <>
      {message ? <p className={styles.flashSuccess}>{message}</p> : null}
      {error ? <p className={styles.flashError}>{error}</p> : null}
    </>
  );
}

export function DashboardPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}): React.JSX.Element {
  return (
    <header className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>{title}</h1>
      {subtitle ? <p className={styles.pageSubtitle}>{subtitle}</p> : null}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  footnote,
  footnoteTone = "muted",
}: {
  label: string;
  value: string;
  footnote?: string;
  footnoteTone?: "muted" | "success" | "warn";
}): React.JSX.Element {
  const footClass =
    footnoteTone === "success"
      ? styles.metricSubSuccess
      : footnoteTone === "warn"
        ? styles.metricSubWarn
        : styles.metricSubMuted;

  return (
    <article className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
      {footnote ? <p className={footClass}>{footnote}</p> : null}
    </article>
  );
}

export function DashboardEmpty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className={styles.emptyState}>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.panelBody}>{body}</p>
      {action ? <div className={styles.emptyAction}>{action}</div> : null}
    </div>
  );
}

export function ProfileHero({
  name,
  email,
  badges,
}: {
  name: string;
  email: string;
  badges: string[];
}): React.JSX.Element {
  return (
    <section className={styles.profileHero}>
      <span className={styles.profileHeroAvatar} aria-hidden>
        {name.charAt(0)}
      </span>
      <div className={styles.profileHeroBody}>
        <h2 className={styles.profileHeroName}>{name}</h2>
        <p className={styles.profileHeroEmail}>{email}</p>
        <div className={styles.profileBadgeRow}>
          {badges.map((b) => (
            <span key={b} className={styles.profileBadge}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OverviewPanel({
  title,
  body,
  children,
  action,
}: {
  title: string;
  body?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeaderRow}>
        <div>
          <h2 className={styles.panelTitle}>{title}</h2>
          {body ? <p className={styles.panelBody}>{body}</p> : null}
        </div>
        {action ? <div className={styles.panelHeaderAction}>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function MessagesPanel({
  notifications,
  onRead,
  onNavigate,
  formatDate,
  formatStatus,
}: {
  notifications: NotificationRow[];
  onRead: (id: string) => void;
  onNavigate?: (notification: NotificationRow) => void;
  formatDate: (iso: string) => string;
  formatStatus: (s: string) => string;
}): React.JSX.Element {
  if (notifications.length === 0) {
    return (
      <DashboardEmpty
        title="No messages yet"
        body="Updates about orders, loans, and deliveries will appear here."
      />
    );
  }

  return (
    <ul className={styles.messageList}>
      {notifications.map((n) => (
        <li key={n.id}>
          <button
            type="button"
            className={n.read ? styles.messageItem : styles.messageItemUnread}
            onClick={() => {
              onRead(n.id);
              onNavigate?.(n);
            }}
          >
            <strong>{n.title}</strong>
            <span>{n.body}</span>
            <span className={styles.messageMeta}>
              {formatDate(n.createdAt)} · {formatStatus(n.type)}
            </span>
            <span className={styles.messageGo}>View →</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function DashboardLoading(): React.JSX.Element {
  return (
    <div className={styles.loadingWrap} role="status" aria-live="polite">
      <div className={styles.loadingSpinner} aria-hidden />
      <p className={styles.panelBody}>Loading dashboard…</p>
    </div>
  );
}
