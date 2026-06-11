"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "@/styles/modules/dashboard.module.css";

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsPanelProps {
  onCountChange?: (count: number) => void;
}

export function NotificationsPanel({
  onCountChange,
}: NotificationsPanelProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = (await res.json()) as {
      notifications: NotificationRow[];
      unread: number;
    };
    setItems(data.notifications);
    setUnread(data.unread);
    onCountChange?.(data.unread);
  }, [onCountChange]);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(interval);
  }, [load]);

  const markRead = async (id: string): Promise<void> => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    void load();
  };

  return (
    <div className={styles.notifWrap}>
      <button
        type="button"
        className={styles.notifBtn}
        aria-expanded={open}
        aria-label={`${unread} notifications`}
        onClick={() => setOpen((o) => !o)}
      >
        🔔
        {unread > 0 ? <span className={styles.notifBadge}>{unread}</span> : null}
      </button>
      {open ? (
        <div className={styles.notifDropdown} role="dialog" aria-label="Notifications">
          <p className={styles.notifDropdownTitle}>Notifications</p>
          {items.length === 0 ? (
            <p className={styles.notifEmpty}>No notifications yet.</p>
          ) : (
            <ul className={styles.notifList}>
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={n.read ? styles.notifItem : styles.notifItemUnread}
                    onClick={() => void markRead(n.id)}
                  >
                    <strong>{n.title}</strong>
                    <span>{n.body}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
