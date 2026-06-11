"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DashboardLayout,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-layout";
import type { CreditRequestDto } from "@/lib/order-workflow";
import type {
  AdminProfileDto,
  AdminSummaryDto,
  AdminUserDto,
} from "@/lib/platform-workflow";
import { formatDate, formatNgn, formatStatus } from "@/lib/format";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PasswordChangeForm } from "@/components/profile/password-change-form";
import { ProfilePictureUpload } from "@/components/profile/profile-picture-upload";
import { throwIfNotOk } from "@/lib/api-errors";
import { AUTH_LOGIN_PATHS } from "@/lib/auth-routes";
import { getAdminNotificationTab } from "@/lib/notification-navigation";
import { DEMO_DISPLAY_NAMES } from "@/lib/demo-users";
import { useDashboardUser } from "@/hooks/use-dashboard-user";
import styles from "@/styles/modules/farmer-dashboard.module.css";

type AdminTab =
  | "dashboard"
  | "products"
  | "orders"
  | "all-orders"
  | "users"
  | "messages"
  | "profile";

interface PendingProduct {
  id: string;
  name: string;
  description: string | null;
  category: string;
  sku: string;
  unitPrice: string;
  quantityInStock: number;
  imageUrl: string | null;
  supplierName: string;
  approvalStatus: string;
}

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function AdminDashboardView(): React.JSX.Element {
  const { userName, avatarUrl, refreshUser } = useDashboardUser(
    DEMO_DISPLAY_NAMES.admin,
  );
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [summary, setSummary] = useState<AdminSummaryDto | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfileDto | null>(null);
  const [pending, setPending] = useState<CreditRequestDto[]>([]);
  const [allOrders, setAllOrders] = useState<CreditRequestDto[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<PendingProduct[]>([]);
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [productRejectId, setProductRejectId] = useState<string | null>(null);
  const [productRejectReason, setProductRejectReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const nav: DashboardNavItem[] = [
    { id: "dashboard", label: "Dashboard", onClick: () => setTab("dashboard") },
    {
      id: "products",
      label: "Approve products",
      onClick: () => setTab("products"),
    },
    { id: "orders", label: "Approve orders", onClick: () => setTab("orders") },
    { id: "all-orders", label: "All orders", onClick: () => setTab("all-orders") },
    { id: "users", label: "Users & privileges", onClick: () => setTab("users") },
    {
      id: "messages",
      label: "Messages",
      onClick: () => setTab("messages"),
      badge: unreadCount,
    },
    { id: "profile", label: "Profile", onClick: () => setTab("profile") },
  ];

  const load = useCallback(async () => {
    const [sumRes, reqRes, prodRes, userRes, notifRes, profRes] = await Promise.all([
      fetch("/api/admin/summary"),
      fetch("/api/credit-requests"),
      fetch("/api/admin/products"),
      fetch("/api/admin/users"),
      fetch("/api/notifications"),
      fetch("/api/admin/profile"),
    ]);

    if (sumRes.ok) {
      const d = (await sumRes.json()) as { summary: AdminSummaryDto };
      setSummary(d.summary);
    }
    if (reqRes.ok) {
      const d = (await reqRes.json()) as {
        pending: CreditRequestDto[];
        all: CreditRequestDto[];
      };
      setPending(d.pending);
      setAllOrders(d.all);
    }
    if (prodRes.ok) {
      const d = (await prodRes.json()) as {
        pending: PendingProduct[];
        all: PendingProduct[];
      };
      setPendingProducts(d.pending);
      setCatalogProducts(d.all);
    }
    if (userRes.ok) {
      const d = (await userRes.json()) as { users: AdminUserDto[] };
      setUsers(d.users);
    }
    if (notifRes.ok) {
      const d = (await notifRes.json()) as { notifications: NotificationRow[] };
      setNotifications(d.notifications);
    }
    if (profRes.ok) {
      const d = (await profRes.json()) as { profile: AdminProfileDto | null };
      setAdminProfile(d.profile);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(t);
  }, [load]);

  const approveOrder = async (id: string): Promise<void> => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/credit-requests/${id}/approve`, {
        method: "POST",
      });
      await throwIfNotOk(res, "Approve failed");
      setMessage("Order approved — supplier and farmer notified.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setBusy(false);
    }
  };

  const rejectOrder = async (): Promise<void> => {
    if (!rejectId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/credit-requests/${rejectId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      await throwIfNotOk(res, "Reject failed");
      setMessage("Order rejected. Farmer notified.");
      setRejectId(null);
      setRejectReason("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setBusy(false);
    }
  };

  const approveProduct = async (id: string): Promise<void> => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}/approve`, {
        method: "POST",
      });
      await throwIfNotOk(res, "Approve failed");
      setMessage("Product approved — supplier notified.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setBusy(false);
    }
  };

  const rejectProduct = async (): Promise<void> => {
    if (!productRejectId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productRejectId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: productRejectReason }),
      });
      await throwIfNotOk(res, "Reject failed");
      setMessage("Product rejected. Supplier notified.");
      setProductRejectId(null);
      setProductRejectReason("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setBusy(false);
    }
  };

  const verifySupplier = async (supplierProfileId: string): Promise<void> => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/suppliers/${supplierProfileId}/verify`, {
        method: "POST",
      });
      await throwIfNotOk(res, "Verify failed");
      setMessage("Supplier verified.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verify failed");
    } finally {
      setBusy(false);
    }
  };

  const updateKyc = async (
    userId: string,
    kycStatus: "VERIFIED" | "REJECTED" | "PENDING" | "UNVERIFIED",
  ): Promise<void> => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kycStatus }),
      });
      await throwIfNotOk(res, "KYC update failed");
      setMessage(`KYC updated to ${formatStatus(kycStatus)}.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "KYC update failed");
    } finally {
      setBusy(false);
    }
  };

  const markMessageRead = async (id: string): Promise<void> => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    await load();
  };

  const handleNotification = (notification: NotificationRow): void => {
    void markMessageRead(notification.id);
    setTab(getAdminNotificationTab(notification.type));
  };

  return (
    <DashboardLayout
      userName={userName}
      avatarUrl={avatarUrl ?? adminProfile?.profilePictureUrl}
      activeNavId={tab}
      navItems={nav}
      onProfileClick={() => setTab("profile")}
      logoutPath={AUTH_LOGIN_PATHS.admin}
    >
      <h1 className={styles.pageTitle}>Admin Dashboard</h1>

      {message ? <p className={styles.flashSuccess}>{message}</p> : null}
      {error ? <p className={styles.flashError}>{error}</p> : null}

      {tab === "dashboard" && summary ? (
        <>
          <div className={styles.metricsGrid}>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Pending orders</p>
              <p className={styles.metricValue}>{summary.pendingOrders}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Pending products</p>
              <p className={styles.metricValue}>{summary.pendingProducts}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Farmers</p>
              <p className={styles.metricValue}>{summary.farmers}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Suppliers</p>
              <p className={styles.metricValue}>{summary.suppliers}</p>
              <p className={styles.metricSubMuted}>
                {summary.verifiedSuppliers} verified
              </p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Live catalog</p>
              <p className={styles.metricValue}>{summary.activeProducts}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Credit outstanding</p>
              <p className={styles.metricValue}>
                {formatNgn(summary.totalCreditOutstanding)}
              </p>
            </article>
          </div>

          <div className={styles.hintBanner}>
            <strong>Queue:</strong> {summary.pendingOrders} orders and{" "}
            {summary.pendingProducts} products need your review ·{" "}
            {formatNgn(summary.totalCreditOutstanding)} credit outstanding across farmers.
          </div>

          <div className={styles.twoColGrid}>
            <ActivityFeed
              items={notifications}
              title="Platform activity"
              hint="Tap a notification to review orders, products, or users."
              onItemClick={handleNotification}
            />
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Admin actions</h2>
              <p className={styles.panelBody}>
                Approve supplier products, review farmer credit orders, verify
                suppliers, and manage platform users.
              </p>
              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={styles.buttonPillWide}
                  onClick={() => setTab("products")}
                >
                  Review products ({summary.pendingProducts})
                </button>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setTab("orders")}
                >
                  Review orders ({summary.pendingOrders})
                </button>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Platform snapshot</h2>
              <p className={styles.panelBody}>
                {summary.totalOrders} total orders · {summary.activeProducts} active
                products · {formatNgn(summary.totalCreditOutstanding)} farmer credit
                in use.
              </p>
            </section>
          </div>
        </>
      ) : null}

      {tab === "products" ? (
        <>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Approve supplier products</h2>
            <p className={styles.panelBody}>
              Review new catalog submissions before they appear to farmers.
            </p>
            {pendingProducts.length === 0 ? (
              <p className={styles.panelBody}>No products awaiting approval.</p>
            ) : (
              <ul className={styles.requestList}>
                {pendingProducts.map((p) => (
                  <li key={p.id} className={styles.requestRow}>
                    <div className={styles.productRowBody}>
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className={styles.productThumbSmall} />
                      ) : null}
                      <div>
                        <span className={styles.statusChip}>pending</span>
                        <strong>{p.name}</strong>
                        <span className={styles.productSupplier}> · {p.supplierName}</span>
                        <p className={styles.panelBody}>
                          {p.category} · {p.sku} · {p.quantityInStock} in stock
                        </p>
                        {p.description ? (
                          <p className={styles.productDescription}>{p.description}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className={styles.adminActions}>
                      <p className={styles.metricValue}>{formatNgn(p.unitPrice)}</p>
                      <div className={styles.actionRow}>
                        <button
                          type="button"
                          className={styles.btnApprove}
                          disabled={busy}
                          onClick={() => void approveProduct(p.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className={styles.btnReject}
                          disabled={busy}
                          onClick={() => setProductRejectId(p.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Full catalog</h2>
            {catalogProducts.length === 0 ? (
              <p className={styles.panelBody}>No products in catalog.</p>
            ) : (
              <ul className={styles.requestList}>
                {catalogProducts.slice(0, 20).map((p) => (
                  <li key={p.id} className={styles.requestRow}>
                    <div>
                      <span className={styles.statusChip}>
                        {formatStatus(p.approvalStatus)}
                      </span>
                      <strong>{p.name}</strong>
                      <span className={styles.productSupplier}> · {p.supplierName}</span>
                    </div>
                    <p className={styles.metricValue}>{formatNgn(p.unitPrice)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {productRejectId ? (
            <div className={styles.modalInline}>
              <h3 className={styles.panelTitle}>Reject product</h3>
              <textarea
                className={styles.formTextarea}
                rows={3}
                value={productRejectReason}
                onChange={(e) => setProductRejectReason(e.target.value)}
                placeholder="Reason for supplier (optional)"
              />
              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={styles.btnReject}
                  disabled={busy}
                  onClick={() => void rejectProduct()}
                >
                  Confirm reject
                </button>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setProductRejectId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {tab === "orders" ? (
        <>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Approve farmer orders</h2>
            <p className={styles.panelBody}>
              Review credit requests from farmers before suppliers fulfill them.
            </p>
            {pending.length === 0 ? (
              <p className={styles.panelBody}>No orders awaiting approval.</p>
            ) : (
              <ul className={styles.requestList}>
                {pending.map((r) => (
                  <li key={r.id} className={styles.requestRow}>
                    <div>
                      <span className={styles.statusChip}>{formatStatus(r.status)}</span>
                      <strong>{r.farmerName}</strong>
                      <span className={styles.productSupplier}> → {r.supplierName}</span>
                      <p className={styles.panelBody}>
                        {r.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                      </p>
                    </div>
                    <div className={styles.adminActions}>
                      <p className={styles.metricValue}>{formatNgn(r.totalAmount)}</p>
                      <div className={styles.actionRow}>
                        <button
                          type="button"
                          className={styles.btnApprove}
                          disabled={busy}
                          onClick={() => void approveOrder(r.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className={styles.btnReject}
                          disabled={busy}
                          onClick={() => setRejectId(r.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {rejectId ? (
            <div className={styles.modalInline}>
              <h3 className={styles.panelTitle}>Reject order</h3>
              <textarea
                className={styles.formTextarea}
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for farmer (optional)"
              />
              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={styles.btnReject}
                  disabled={busy}
                  onClick={() => void rejectOrder()}
                >
                  Confirm reject
                </button>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setRejectId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {tab === "all-orders" ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>All orders</h2>
          <p className={styles.panelBody}>
            Complete order history across all farmers and suppliers.
          </p>
          {allOrders.length === 0 ? (
            <p className={styles.panelBody}>No orders yet.</p>
          ) : (
            <ul className={styles.requestList}>
              {allOrders.map((r) => (
                <li key={r.id} className={styles.requestRow}>
                  <div>
                    <span className={styles.statusChip}>{formatStatus(r.status)}</span>
                    <strong>{r.farmerName}</strong>
                    <span className={styles.productSupplier}> → {r.supplierName}</span>
                    <p className={styles.panelBody}>
                      {r.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                    </p>
                    <p className={styles.metricSubMuted}>{formatDate(r.createdAt)}</p>
                  </div>
                  <p className={styles.metricValue}>{formatNgn(r.totalAmount)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "users" ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Users & admin privileges</h2>
          <p className={styles.panelBody}>
            Verify suppliers, update KYC status, and oversee all platform accounts.
          </p>
          <ul className={styles.requestList}>
            {users.map((u) => (
              <li key={u.id} className={styles.requestRow}>
                <div>
                  <span className={styles.statusChip}>{formatStatus(u.role)}</span>
                  <strong>{u.displayName}</strong>
                  <p className={styles.panelBody}>
                    {u.email} · {u.phoneNumber}
                  </p>
                  <p className={styles.metricSubMuted}>
                    KYC: {formatStatus(u.kycStatus)}
                    {u.isVerified !== null
                      ? ` · Supplier verified: ${u.isVerified ? "yes" : "no"}`
                      : ""}
                  </p>
                </div>
                <div className={styles.adminActions}>
                  {u.role === "SUPPLIER" && u.supplierProfileId && !u.isVerified ? (
                    <button
                      type="button"
                      className={styles.btnApprove}
                      disabled={busy}
                      onClick={() => void verifySupplier(u.supplierProfileId!)}
                    >
                      Verify supplier
                    </button>
                  ) : null}
                  {u.role !== "ADMIN" ? (
                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        className={styles.btnGhost}
                        disabled={busy}
                        onClick={() => void updateKyc(u.id, "VERIFIED")}
                      >
                        Verify KYC
                      </button>
                      <button
                        type="button"
                        className={styles.btnReject}
                        disabled={busy}
                        onClick={() => void updateKyc(u.id, "REJECTED")}
                      >
                        Reject KYC
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "profile" && adminProfile ? (
        <>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Admin profile</h2>
          <ProfilePictureUpload
            displayName={adminProfile.displayName}
            imageUrl={adminProfile.profilePictureUrl}
            onUploaded={(url) => {
              setAdminProfile((p) => (p ? { ...p, profilePictureUrl: url } : p));
              void refreshUser();
            }}
          />
          <p className={styles.panelBody}>
            {adminProfile.displayName} · {adminProfile.email}
          </p>
          <p className={styles.panelBody}>
            Phone {adminProfile.phoneNumber} · KYC {formatStatus(adminProfile.kycStatus)}
          </p>
          <div className={styles.metricsGrid}>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Pending orders</p>
              <p className={styles.metricValue}>{adminProfile.pendingOrders}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Pending products</p>
              <p className={styles.metricValue}>{adminProfile.pendingProducts}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Platform users</p>
              <p className={styles.metricValue}>{adminProfile.totalUsers}</p>
            </article>
          </div>
        </section>
        <PasswordChangeForm />
        </>
      ) : null}

      {tab === "messages" ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Messages</h2>
          <p className={styles.panelBody}>
            Platform notifications — new orders, product submissions, and system alerts.
          </p>
          {notifications.length === 0 ? (
            <p className={styles.panelBody}>No messages yet.</p>
          ) : (
            <ul className={styles.messageList}>
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={n.read ? styles.messageItem : styles.messageItemUnread}
                    onClick={() => handleNotification(n)}
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
          )}
        </section>
      ) : null}
    </DashboardLayout>
  );
}
