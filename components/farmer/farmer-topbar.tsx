import styles from "@/styles/modules/farmer-dashboard.module.css";

interface FarmerTopbarProps {
  farmerName: string;
  notificationCount: number;
}

export function FarmerTopbar({
  farmerName,
  notificationCount,
}: FarmerTopbarProps): React.JSX.Element {
  return (
    <header className={styles.topbar}>
      <p className={styles.welcomeText}>
        Welcome back, <strong>{farmerName}</strong> 👋
      </p>
      <div className={styles.topbarActions}>
        <button
          type="button"
          className={styles.notifBtn}
          aria-label={`${notificationCount} notifications`}
        >
          <span className={styles.notifIcon} aria-hidden>
            🔔
          </span>
          {notificationCount > 0 ? (
            <span className={styles.notifBadge}>{notificationCount}</span>
          ) : null}
        </button>
        <div className={styles.profileChip} aria-label="Profile">
          <span className={styles.profileAvatar} aria-hidden>
            {farmerName.charAt(0)}
          </span>
          <span className={styles.profileLabel}>Profile</span>
        </div>
      </div>
    </header>
  );
}
