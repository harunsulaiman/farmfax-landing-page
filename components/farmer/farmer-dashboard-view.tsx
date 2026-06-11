"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DashboardLayout,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-layout";
import type {
  CatalogProductDto,
  CreditRequestDto,
  FarmerOrderFulfillmentDto,
  FarmerProfileDto,
  FarmerSummaryDto,
} from "@/lib/order-workflow";
import { formatDate, formatNgn, formatStatus } from "@/lib/format";
import { throwIfNotOk } from "@/lib/api-errors";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProductCard } from "@/components/dashboard/product-card";
import { ProductDetailPanel } from "@/components/dashboard/product-detail-panel";
import { PasswordChangeForm } from "@/components/profile/password-change-form";
import { ProfilePictureUpload } from "@/components/profile/profile-picture-upload";
import { useDashboardUser } from "@/hooks/use-dashboard-user";
import { DEMO_DISPLAY_NAMES } from "@/lib/demo-users";
import { getFarmerNotificationTab } from "@/lib/notification-navigation";
import { AUTH_LOGIN_PATHS } from "@/lib/auth-routes";
import {
  DashboardEmpty,
  DashboardFlash,
  DashboardLoading,
  DashboardPageHeader,
  MessagesPanel,
  MetricCard,
  OverviewPanel,
  ProfileHero,
} from "@/components/dashboard/dashboard-ui";
import styles from "@/styles/modules/farmer-dashboard.module.css";

type FarmerTab =
  | "dashboard"
  | "apply"
  | "history"
  | "repayment"
  | "inputs"
  | "yield"
  | "messages"
  | "profile";

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const ACTIVE_LOAN_STATUSES = new Set(["DISBURSED"]);
const HISTORY_STATUSES = new Set(["REPAID", "REJECTED", "DEFAULTED"]);

function loanTotalWithInterest(amount: string, rate: string): number {
  const principal = Number.parseFloat(amount);
  const interest = Number.parseFloat(rate);
  if (Number.isNaN(principal)) return 0;
  if (Number.isNaN(interest)) return principal;
  return principal * (1 + interest / 100);
}

function RequestRow({
  request,
  extra,
}: {
  request: CreditRequestDto;
  extra?: React.ReactNode;
}): React.JSX.Element {
  return (
    <li className={styles.requestRow}>
      <div>
        <span className={styles.statusChip}>{formatStatus(request.status)}</span>
        <strong>{request.supplierName}</strong>
        <p className={styles.panelBody}>
          {request.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
        </p>
        {request.dueDate ? (
          <p className={styles.metricSubMuted}>Due {formatDate(request.dueDate)}</p>
        ) : null}
        {extra}
      </div>
      <div className={styles.adminActions}>
        <p className={styles.metricValue}>{formatNgn(request.totalAmount)}</p>
        <p className={styles.metricSubMuted}>
          Ordered {formatDate(request.createdAt)}
        </p>
      </div>
    </li>
  );
}

export function FarmerDashboardView(): React.JSX.Element {
  const [tab, setTab] = useState<FarmerTab>("dashboard");
  const [summary, setSummary] = useState<FarmerSummaryDto | null>(null);
  const [products, setProducts] = useState<CatalogProductDto[]>([]);
  const [orders, setOrders] = useState<CreditRequestDto[]>([]);
  const [fulfillments, setFulfillments] = useState<FarmerOrderFulfillmentDto[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [profile, setProfile] = useState<FarmerProfileDto | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const { userName, avatarUrl, refreshUser } = useDashboardUser(
    DEMO_DISPLAY_NAMES.farmer,
  );
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    farmName: "",
    farmSizeHectares: "",
    primaryCropType: "",
    phoneNumber: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const nav: DashboardNavItem[] = [
    { id: "dashboard", label: "Dashboard", onClick: () => setTab("dashboard") },
    { id: "apply", label: "Apply for Loan", onClick: () => setTab("apply") },
    { id: "history", label: "Loan History", onClick: () => setTab("history") },
    {
      id: "repayment",
      label: "Repayment Schedule",
      onClick: () => setTab("repayment"),
    },
    { id: "inputs", label: "Input Requests", onClick: () => setTab("inputs") },
    { id: "yield", label: "Yield Tracker", onClick: () => setTab("yield") },
    {
      id: "messages",
      label: "Messages",
      onClick: () => setTab("messages"),
      badge: unreadCount,
    },
    { id: "profile", label: "Profile", onClick: () => setTab("profile") },
  ];

  const refresh = useCallback(async () => {
    const [sumRes, catRes, ordRes, notifRes, profRes] = await Promise.all([
      fetch("/api/farmer/summary"),
      fetch("/api/catalog"),
      fetch("/api/farmer/orders"),
      fetch("/api/notifications"),
      fetch("/api/farmer/profile"),
    ]);

    if (sumRes.ok) {
      const d = (await sumRes.json()) as { summary: FarmerSummaryDto | null };
      setSummary(d.summary);
    }
    if (catRes.ok) {
      const d = (await catRes.json()) as { products: CatalogProductDto[] };
      setProducts(d.products);
    }
    if (ordRes.ok) {
      const d = (await ordRes.json()) as {
        orders: CreditRequestDto[];
        fulfillments: FarmerOrderFulfillmentDto[];
      };
      setOrders(d.orders);
      setFulfillments(d.fulfillments);
    }
    if (notifRes.ok) {
      const d = (await notifRes.json()) as { notifications: NotificationRow[] };
      setNotifications(d.notifications);
    }
    if (profRes.ok) {
      const d = (await profRes.json()) as { profile: FarmerProfileDto | null };
      if (d.profile) {
        setProfile(d.profile);
        setProfileForm({
          fullName: d.profile.fullName ?? "",
          farmName: d.profile.farmName,
          farmSizeHectares: d.profile.farmSizeHectares,
          primaryCropType: d.profile.primaryCropType,
          phoneNumber: d.profile.phoneNumber,
        });
      }
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setBooting(false));
    const interval = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const selected = products.find((p) => p.id === selectedId);
  const activeLoans = orders.filter((o) => ACTIVE_LOAN_STATUSES.has(o.status));
  const openOrders = orders.filter((o) => !HISTORY_STATUSES.has(o.status));
  const historyOrders = orders.filter((o) => HISTORY_STATUSES.has(o.status));
  const trackableOrders = orders.filter(
    (o) =>
      (o.status === "APPROVED" || o.status === "DISBURSED") &&
      o.fulfillmentStatus &&
      o.fulfillmentStatus !== "CANCELLED",
  );

  const submitRequest = async (): Promise<void> => {
    if (!selectedId) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/credit-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ catalogItemId: selectedId, quantity }],
          notes,
        }),
      });
      await throwIfNotOk(res, "Request failed");
      setMessage("Order placed! Admin will review it, then the supplier will fulfill after approval.");
      setNotes("");
      setQuantity(1);
      setTab("inputs");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const repayLoan = async (requestId: string): Promise<void> => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/farmer/repayments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      await throwIfNotOk(res, "Repayment failed");
      setMessage("Loan repaid successfully. Your available credit has been restored.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Repayment failed");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (): Promise<void> => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/farmer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      await throwIfNotOk(res, "Save failed");
      setMessage("Profile updated.");
      await refresh();
      await refreshUser();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmReceipt = async (orderId: string): Promise<void> => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/farmer/orders/${orderId}/confirm-receipt`, {
        method: "POST",
      });
      await throwIfNotOk(res, "Could not confirm receipt.");
      setMessage("Receipt confirmed — amount added to your loan balance.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not confirm receipt.");
    } finally {
      setLoading(false);
    }
  };

  const markMessageRead = async (id: string): Promise<void> => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    await refresh();
  };

  const handleNotification = (notification: NotificationRow): void => {
    void markMessageRead(notification.id);
    setTab(getFarmerNotificationTab(notification.type));
  };

  return (
    <DashboardLayout
      userName={userName}
      avatarUrl={avatarUrl ?? profile?.profilePictureUrl}
      activeNavId={tab}
      navItems={nav}
      onProfileClick={() => setTab("profile")}
      logoutPath={AUTH_LOGIN_PATHS.farmer}
    >
      <h1 className={styles.pageTitle}>Farmer Dashboard</h1>

      {message ? <p className={styles.flashSuccess}>{message}</p> : null}
      {error ? <p className={styles.flashError}>{error}</p> : null}

      {tab === "dashboard" && summary ? (
        <>
          <div className={styles.metricsGrid}>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Current Loan Balance</p>
              <p className={styles.metricValue}>{formatNgn(summary.utilizedCredit)}</p>
              {Number(summary.repaidThisMonth) > 0 ? (
                <p className={styles.metricSubSuccess}>
                  ↓ {formatNgn(summary.repaidThisMonth)} paid this month
                </p>
              ) : (
                <p className={styles.metricSubMuted}>No repayments this month</p>
              )}
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Next Repayment Due</p>
              <p className={styles.metricValue}>
                {summary.nextRepaymentAmount
                  ? formatNgn(summary.nextRepaymentAmount)
                  : "—"}
              </p>
              {summary.nextDueDate ? (
                <p className={styles.metricSubMuted}>
                  Due {formatDate(summary.nextDueDate)}
                </p>
              ) : (
                <p className={styles.metricSubMuted}>No upcoming repayment</p>
              )}
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Total Yield (2025)</p>
              <p className={styles.metricValue}>{summary.estimatedYieldTonnes} tonnes</p>
              <p className={styles.metricSubSuccess}>+23% vs last season</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Pending Requests</p>
              <p className={styles.metricValue}>{summary.pendingRequests}</p>
              <p className={styles.metricSubMuted}>{summary.pendingBreakdown}</p>
            </article>
          </div>

          <div className={styles.hintBanner}>
            <strong>Tip:</strong> You have {formatNgn(summary.availableCredit)} credit
            available · {summary.availableProducts} products in the marketplace ·
            KYC {formatStatus(summary.kycStatus)}.
          </div>

          <div className={styles.twoColGrid}>
            <ActivityFeed
              items={notifications}
              hint="Tap a notification to jump to the relevant step."
              onItemClick={handleNotification}
            />
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Quick actions</h2>
              <p className={styles.panelBody}>
                Browse supplier feed and inputs, track deliveries, and repay loans
                when harvest is ready.
              </p>
              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={styles.buttonPillWide}
                  onClick={() => setTab("apply")}
                >
                  + Apply for feed loan
                </button>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setTab("inputs")}
                >
                  Track orders
                </button>
              </div>
            </section>
          </div>
        </>
      ) : null}

      {tab === "apply" ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Marketplace</h2>
          {products.length === 0 ? (
            <p className={styles.panelBody}>No products available right now.</p>
          ) : (
            <div className={styles.productShopStack}>
              {selected ? (
                <ProductDetailPanel
                  product={selected}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  notes={notes}
                  onNotesChange={setNotes}
                  loading={loading}
                  canOrder={summary?.eligibleToBorrow ?? false}
                  orderHint={
                    summary?.eligibleToBorrow
                      ? `${formatNgn(summary.availableCredit)} credit available`
                      : summary?.eligibilityMessage
                  }
                  onPlaceOrder={() => void submitRequest()}
                  onClose={() => setSelectedId("")}
                />
              ) : null}
              {selected && products.length > 1 ? (
                <p className={styles.panelBodyMuted}>More products</p>
              ) : null}
              <div className={styles.productShopGrid}>
                {(selected
                  ? products.filter((p) => p.id !== selectedId)
                  : products
                ).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    variant="compact"
                    selected={p.id === selectedId}
                    onSelect={() => setSelectedId(p.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {tab === "inputs" ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Input Requests</h2>
          <p className={styles.panelBody}>
            All open and in-progress orders awaiting approval, delivery, or repayment.
          </p>
          {openOrders.length === 0 ? (
            <p className={styles.panelBody}>No active orders. Browse products to order.</p>
          ) : (
            <ul className={styles.requestList}>
              {openOrders.map((r) => {
                const canConfirm =
                  r.status === "APPROVED" && r.fulfillmentStatus === "FULFILLED";
                return (
                  <RequestRow
                    key={r.id}
                    request={r}
                    extra={
                      <>
                        {r.fulfillmentStatus ? (
                          <p className={styles.metricSubMuted}>
                            Delivery: {formatStatus(r.fulfillmentStatus)}
                          </p>
                        ) : null}
                        {canConfirm ? (
                          <button
                            type="button"
                            className={styles.btnApprove}
                            disabled={loading}
                            onClick={() => void confirmReceipt(r.id)}
                          >
                            Confirm receipt — add to loan balance
                          </button>
                        ) : null}
                      </>
                    }
                  />
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "repayment" ? (
        <>
          {summary ? (
            <div className={styles.metricsGrid}>
              <article className={styles.metricCard}>
                <p className={styles.metricLabel}>Current Loan Balance</p>
                <p className={styles.metricValue}>{formatNgn(summary.utilizedCredit)}</p>
              </article>
              <article className={styles.metricCard}>
                <p className={styles.metricLabel}>Next Repayment Due</p>
                <p className={styles.metricValue}>
                  {summary.nextRepaymentAmount
                    ? formatNgn(summary.nextRepaymentAmount)
                    : "—"}
                </p>
                {summary.nextDueDate ? (
                  <p className={styles.metricSubMuted}>
                    Due {formatDate(summary.nextDueDate)}
                  </p>
                ) : null}
              </article>
              <article className={styles.metricCard}>
                <p className={styles.metricLabel}>Eligible to borrow</p>
                <p className={styles.metricValue}>{formatNgn(summary.availableCredit)}</p>
                <p
                  className={
                    summary.eligibleToBorrow ? styles.metricSub : styles.metricSubWarn
                  }
                >
                  {summary.eligibilityMessage}
                </p>
              </article>
            </div>
          ) : null}

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Repayment schedule</h2>
            <p className={styles.panelBody}>
              Repay approved loans to restore your available credit. Interest is shown
              at the rate set when the loan was approved.
            </p>
            {activeLoans.length === 0 ? (
              <p className={styles.panelBody}>No active loans to repay.</p>
            ) : (
              <ul className={styles.requestList}>
                {activeLoans.map((r) => {
                  const totalDue = loanTotalWithInterest(
                    r.totalAmount,
                    r.interestRate ?? "0",
                  );
                  return (
                    <li key={r.id} className={styles.requestRow}>
                      <div>
                        <span className={styles.statusChip}>{formatStatus(r.status)}</span>
                        <strong>{r.supplierName}</strong>
                        <p className={styles.panelBody}>
                          Principal {formatNgn(r.totalAmount)} · {r.interestRate}% interest
                        </p>
                        <p className={styles.metricSubWarn}>
                          Total due {formatNgn(totalDue)} · Due {formatDate(r.dueDate ?? r.createdAt)}
                        </p>
                      </div>
                      <div className={styles.adminActions}>
                        <button
                          type="button"
                          className={styles.btnApprove}
                          disabled={loading}
                          onClick={() => void repayLoan(r.id)}
                        >
                          Repay loan
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      ) : null}

      {tab === "yield" ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Yield Tracker</h2>
          <p className={styles.panelBody}>
            Track harvest performance for {summary?.primaryCropType ?? "your farm"} across
            the season.
          </p>
          <div className={styles.metricsGrid}>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>2025 estimated yield</p>
              <p className={styles.metricValue}>
                {summary?.estimatedYieldTonnes ?? "—"} tonnes
              </p>
              <p className={styles.metricSubSuccess}>+23% vs last season</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Farm size</p>
              <p className={styles.metricValue}>
                {summary?.farmSizeHectares ?? "—"} ha
              </p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Delivered orders</p>
              <p className={styles.metricValue}>
                {fulfillments.filter((f) => f.status === "FULFILLED").length}
              </p>
            </article>
          </div>
          {trackableOrders.length > 0 ? (
            <>
              <h3 className={styles.panelTitle}>Active deliveries</h3>
              <ul className={styles.requestList}>
                {trackableOrders.map((r) => {
                  const f = fulfillments.find((x) => x.creditRequestId === r.id);
                  const canConfirm =
                    r.status === "APPROVED" && r.fulfillmentStatus === "FULFILLED";
                  return (
                    <li key={r.id} className={styles.requestRow}>
                      <div>
                        <span className={styles.statusChip}>
                          {formatStatus(f?.status ?? r.fulfillmentStatus ?? "pending")}
                        </span>
                        <strong>{r.supplierName}</strong>
                        {f?.verificationOtp ?? r.verificationOtp ? (
                          <p className={styles.otpDisplay}>
                            OTP: {f?.verificationOtp ?? r.verificationOtp}
                          </p>
                        ) : null}
                      </div>
                      <div className={styles.adminActions}>
                        <p className={styles.metricValue}>{formatNgn(r.totalAmount)}</p>
                        {canConfirm ? (
                          <button
                            type="button"
                            className={styles.btnApprove}
                            disabled={loading}
                            onClick={() => void confirmReceipt(r.id)}
                          >
                            Confirm receipt
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}

      {tab === "history" ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Loan History</h2>
          <p className={styles.panelBody}>
            Past orders — repaid loans, rejected requests, and closed accounts.
          </p>
          {historyOrders.length === 0 ? (
            <p className={styles.panelBody}>No history yet.</p>
          ) : (
            <ul className={styles.requestList}>
              {historyOrders.map((r) => (
                <RequestRow
                  key={r.id}
                  request={r}
                  extra={
                    r.repaidAt ? (
                      <p className={styles.metricSub}>
                        Repaid {formatDate(r.repaidAt)}
                      </p>
                    ) : null
                  }
                />
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "messages" ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Messages</h2>
          <p className={styles.panelBody}>
            Updates on your orders, loan approvals, delivery status, and repayments.
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

      {tab === "profile" && profile ? (
        <>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Profile</h2>
          <ProfilePictureUpload
            displayName={profileForm.fullName || profile.farmName}
            imageUrl={profile.profilePictureUrl}
            onUploaded={(url) => {
              setProfile((p) => (p ? { ...p, profilePictureUrl: url } : p));
              void refreshUser();
            }}
          />
          <p className={styles.panelBody}>
            {profile.email} · KYC {formatStatus(profile.kycStatus)}
          </p>
          <div className={styles.requestForm}>
            <label className={styles.formLabel}>
              Full name
              <input
                className={styles.formInput}
                value={profileForm.fullName}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
            </label>
            <label className={styles.formLabel}>
              Farm name
              <input
                className={styles.formInput}
                value={profileForm.farmName}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, farmName: e.target.value }))
                }
              />
            </label>
            <label className={styles.formLabel}>
              Farm size (hectares)
              <input
                className={styles.formInput}
                type="number"
                min={0}
                step={0.01}
                value={profileForm.farmSizeHectares}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, farmSizeHectares: e.target.value }))
                }
              />
            </label>
            <label className={styles.formLabel}>
              Primary crop / production
              <input
                className={styles.formInput}
                value={profileForm.primaryCropType}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, primaryCropType: e.target.value }))
                }
              />
            </label>
            <label className={styles.formLabel}>
              Phone number
              <input
                className={styles.formInput}
                value={profileForm.phoneNumber}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, phoneNumber: e.target.value }))
                }
              />
            </label>
            <div className={styles.metricsGrid}>
              <article className={styles.metricCard}>
                <p className={styles.metricLabel}>Credit limit</p>
                <p className={styles.metricValue}>{formatNgn(profile.creditLimit)}</p>
              </article>
              <article className={styles.metricCard}>
                <p className={styles.metricLabel}>Loan balance</p>
                <p className={styles.metricValue}>{formatNgn(profile.utilizedCredit)}</p>
              </article>
              <article className={styles.metricCard}>
                <p className={styles.metricLabel}>Available credit</p>
                <p className={styles.metricValue}>{formatNgn(profile.availableCredit)}</p>
              </article>
            </div>
            <button
              type="button"
              className={styles.buttonPillWide}
              disabled={loading}
              onClick={() => void saveProfile()}
            >
              {loading ? "Saving…" : "Save profile"}
            </button>
          </div>
        </section>
        <PasswordChangeForm />
        </>
      ) : null}
    </DashboardLayout>
  );
}
