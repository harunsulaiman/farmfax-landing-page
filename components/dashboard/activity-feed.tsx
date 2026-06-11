"use client";

import { formatDate, formatStatus } from "@/lib/format";
import styles from "@/styles/modules/farmer-dashboard.module.css";

export interface ActivityItem {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
  hint?: string;
  limit?: number;
  onItemClick?: (item: ActivityItem) => void;
}

export function ActivityFeed({
  items,
  title = "Recent activity",
  hint,
  limit = 5,
  onItemClick,
}: ActivityFeedProps): React.JSX.Element {
  const visible = items.slice(0, limit);

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {hint ? <p className={styles.panelBody}>{hint}</p> : null}
      {visible.length === 0 ? (
        <p className={styles.panelBodyMuted}>No recent activity yet.</p>
      ) : (
        <ul className={styles.activityList}>
          {visible.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={
                  item.read ? styles.activityItem : styles.activityItemUnread
                }
                onClick={() => onItemClick?.(item)}
              >
                <span className={styles.activityDot} aria-hidden />
                <div className={styles.activityContent}>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                  <span className={styles.messageMeta}>
                    {formatDate(item.createdAt)} · {formatStatus(item.type)}
                  </span>
                </div>
                <span className={styles.activityChevron} aria-hidden>
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
