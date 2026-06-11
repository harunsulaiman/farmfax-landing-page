"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DashboardLayout,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-layout";
import type { CreditRequestDto } from "@/lib/order-workflow";
import type {
  SupplierCatalogItemDto,
  SupplierProfileDto,
  SupplierSummaryDto,
} from "@/lib/platform-workflow";
import { formatDate, formatNgn, formatStatus } from "@/lib/format";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PasswordChangeForm } from "@/components/profile/password-change-form";
import { ProfilePictureUpload } from "@/components/profile/profile-picture-upload";
import { readApiError, throwIfNotOk } from "@/lib/api-errors";
import { AUTH_LOGIN_PATHS } from "@/lib/auth-routes";
import { getSupplierNotificationTab } from "@/lib/notification-navigation";
import { DEMO_DISPLAY_NAMES } from "@/lib/demo-users";
import { useDashboardUser } from "@/hooks/use-dashboard-user";
import styles from "@/styles/modules/farmer-dashboard.module.css";

type SupplierTab =
  | "dashboard"
  | "products"
  | "orders"
  | "fulfill"
  | "messages"
  | "profile";

interface FulfillmentRow {
  id: string;
  creditRequestId: string;
  status: string;
  verificationOtp: string;
  deliveredAt: string | null;
}

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function SupplierDashboardView(): React.JSX.Element {
  const [tab, setTab] = useState<SupplierTab>("dashboard");
  const [summary, setSummary] = useState<SupplierSummaryDto | null>(null);
  const [products, setProducts] = useState<SupplierCatalogItemDto[]>([]);
  const [orders, setOrders] = useState<CreditRequestDto[]>([]);
  const [fulfillments, setFulfillments] = useState<FulfillmentRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [profile, setProfile] = useState<SupplierProfileDto | null>(null);
  const { userName, avatarUrl, refreshUser } = useDashboardUser(
    DEMO_DISPLAY_NAMES.supplier,
  );
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "",
    unitPrice: "",
    quantityInStock: "",
    sku: "",
    imageUrl: "",
  });
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    businessName: "",
    tin: "",
    warehouseAddress: "",
    phoneNumber: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const nav: DashboardNavItem[] = [
    { id: "dashboard", label: "Dashboard", onClick: () => setTab("dashboard") },
    { id: "products", label: "Add products", onClick: () => setTab("products") },
    { id: "orders", label: "View orders", onClick: () => setTab("orders") },
    { id: "fulfill", label: "Fulfill orders", onClick: () => setTab("fulfill") },
    {
      id: "messages",
      label: "Messages",
      onClick: () => setTab("messages"),
      badge: unreadCount,
    },
    { id: "profile", label: "Profile", onClick: () => setTab("profile") },
  ];

  const load = useCallback(async () => {
    const [sumRes, prodRes, ordRes, notifRes, profRes] = await Promise.all([
      fetch("/api/supplier/summary"),
      fetch("/api/supplier/products"),
      fetch("/api/supplier/orders"),
      fetch("/api/notifications"),
      fetch("/api/supplier/profile"),
    ]);

    if (sumRes.ok) {
      const d = (await sumRes.json()) as { summary: SupplierSummaryDto | null };
      setSummary(d.summary);
    }
    if (prodRes.ok) {
      const d = (await prodRes.json()) as { products: SupplierCatalogItemDto[] };
      setProducts(d.products);
    }
    if (ordRes.ok) {
      const d = (await ordRes.json()) as {
        orders: CreditRequestDto[];
        fulfillments: FulfillmentRow[];
      };
      setOrders(d.orders);
      setFulfillments(d.fulfillments);
    }
    if (notifRes.ok) {
      const d = (await notifRes.json()) as { notifications: NotificationRow[] };
      setNotifications(d.notifications);
    }
    if (profRes.ok) {
      const d = (await profRes.json()) as { profile: SupplierProfileDto | null };
      if (d.profile) {
        setProfile(d.profile);
        setProfileForm({
          fullName: d.profile.fullName ?? "",
          businessName: d.profile.businessName,
          tin: d.profile.tin ?? "",
          warehouseAddress: d.profile.warehouseAddress,
          phoneNumber: d.profile.phoneNumber,
        });
      }
    }
  }, []);

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(t);
  }, [load]);

  const acceptOrder = async (fulfillmentId: string): Promise<void> => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/supplier/fulfillments/${fulfillmentId}/accept`, {
        method: "POST",
      });
      await throwIfNotOk(res, "Could not accept order");
      setMessage("Order accepted — prepare items for delivery.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not accept order");
    } finally {
      setBusy(false);
    }
  };

  const markReady = async (fulfillmentId: string): Promise<void> => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/supplier/fulfillments/${fulfillmentId}/ready`, {
        method: "POST",
      });
      await throwIfNotOk(res, "Update failed");
      setMessage("Marked ready — farmer notified.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const markFulfilled = async (fulfillmentId: string): Promise<void> => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(
        `/api/supplier/fulfillments/${fulfillmentId}/fulfilled`,
        { method: "POST" },
      );
      await throwIfNotOk(res, "Update failed");
      setMessage("Order marked as delivered — farmer notified.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/supplier/products/upload", {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(await readApiError(res, "Image upload failed"));
    const data = (await res.json()) as { url?: string };
    if (!data.url) throw new Error("Image upload failed. No file URL returned.");
    return data.url;
  };

  const handlePrimaryImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setProductForm((f) => ({ ...f, imageUrl: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const handleExtraImages = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const files = event.target.files;
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, 5 - extraImages.length)) {
        urls.push(await uploadImage(file));
      }
      setExtraImages((prev) => [...prev, ...urls].slice(0, 5));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const addProduct = async (): Promise<void> => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/supplier/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description || undefined,
          category: productForm.category,
          unitPrice: productForm.unitPrice,
          quantityInStock: Number(productForm.quantityInStock) || 0,
          sku: productForm.sku || undefined,
          imageUrl: productForm.imageUrl || undefined,
          imageUrls: extraImages,
        }),
      });
      await throwIfNotOk(res, "Failed to add product");
      setMessage("Product submitted for admin approval.");
      setProductForm({
        name: "",
        description: "",
        category: "",
        unitPrice: "",
        quantityInStock: "",
        sku: "",
        imageUrl: "",
      });
      setExtraImages([]);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add product");
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (): Promise<void> => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/supplier/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      await throwIfNotOk(res, "Save failed");
      setMessage("Profile updated.");
      await load();
      await refreshUser();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
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
    setTab(getSupplierNotificationTab(notification.type));
  };

  const activeFulfillments = fulfillments.filter(
    (f) => f.status !== "FULFILLED" && f.status !== "CANCELLED",
  );

  return (
    <DashboardLayout
      userName={userName}
      avatarUrl={avatarUrl ?? profile?.profilePictureUrl}
      activeNavId={tab}
      navItems={nav}
      onProfileClick={() => setTab("profile")}
      logoutPath={AUTH_LOGIN_PATHS.supplier}
    >
      <h1 className={styles.pageTitle}>Supplier Dashboard</h1>

      {message ? <p className={styles.flashSuccess}>{message}</p> : null}
      {error ? <p className={styles.flashError}>{error}</p> : null}

      {tab === "dashboard" && summary ? (
        <>
          <div className={styles.metricsGrid}>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Business</p>
              <p className={styles.metricValue}>{summary.businessName}</p>
              <p className={summary.isVerified ? styles.metricSub : styles.metricSubWarn}>
                {summary.isVerified ? "Verified supplier" : "Awaiting verification"}
              </p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Live products</p>
              <p className={styles.metricValue}>{summary.activeProducts}</p>
              {summary.pendingProducts > 0 ? (
                <p className={styles.metricSubWarn}>
                  {summary.pendingProducts} pending approval
                </p>
              ) : null}
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Approved orders</p>
              <p className={styles.metricValue}>{summary.approvedOrders}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>To fulfill</p>
              <p className={styles.metricValue}>{summary.pendingFulfillment}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Delivered</p>
              <p className={styles.metricValue}>{summary.fulfilledOrders}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Total sales</p>
              <p className={styles.metricValue}>
                {formatNgn(summary.totalSalesRevenue)}
              </p>
              <p className={styles.metricSubMuted}>
                {summary.unitsSold} units sold
              </p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>Accepted orders</p>
              <p className={styles.metricValue}>{summary.acceptedOrders}</p>
            </article>
          </div>

          <div className={styles.hintBanner}>
            <strong>Sales snapshot:</strong> {formatNgn(summary.totalSalesRevenue)} from{" "}
            {summary.fulfilledOrders} delivered orders · {summary.activeProducts} live
            products · {summary.pendingFulfillment} awaiting fulfillment.
          </div>

          <div className={styles.twoColGrid}>
            <ActivityFeed
              items={notifications}
              hint="Tap a notification to jump to orders, catalog, or fulfillment."
              onItemClick={handleNotification}
            />
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Quick actions</h2>
              <p className={styles.panelBody}>
                Add products for admin approval, prepare approved farmer orders, and
                share OTP at the pond on delivery.
              </p>
              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={styles.buttonPillWide}
                  onClick={() => setTab("products")}
                >
                  Add product
                </button>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setTab("fulfill")}
                >
                  Fulfill orders
                </button>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Recent orders</h2>
              {orders.length === 0 ? (
                <p className={styles.panelBody}>No approved orders yet.</p>
              ) : (
                <ul className={styles.requestList}>
                  {orders.slice(0, 3).map((r) => (
                    <li key={r.id} className={styles.requestRow}>
                      <div>
                        <strong>{r.farmerName}</strong>
                        <p className={styles.panelBody}>
                          {r.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                        </p>
                      </div>
                      <p className={styles.metricValue}>{formatNgn(r.totalAmount)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Listed products</h2>
              {products.length === 0 ? (
                <p className={styles.panelBody}>No products listed yet.</p>
              ) : (
                <ul className={styles.catalogSalesList}>
                  {products.slice(0, 6).map((p) => (
                    <li key={p.id} className={styles.catalogSalesRow}>
                      <div>
                        <strong>{p.name}</strong>
                        <p className={styles.metricSubMuted}>
                          {formatStatus(p.approvalStatus)} · {p.quantityInStock} in
                          stock · {formatNgn(p.unitPrice)} each
                        </p>
                      </div>
                      <div className={styles.adminActions}>
                        <p className={styles.metricValue}>{formatNgn(p.revenue)}</p>
                        <p className={styles.metricSubMuted}>{p.unitsSold} sold</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setTab("products")}
              >
                Manage catalog
              </button>
            </section>
          </div>
        </>
      ) : null}

      {tab === "products" ? (
        <>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Add a product</h2>
            <p className={styles.panelBody}>
              New products require admin approval before farmers can order them.
            </p>
            <div className={styles.requestForm}>
              <label className={styles.formLabel}>
                Product name
                <input
                  className={styles.formInput}
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </label>
              <label className={styles.formLabel}>
                Description
                <textarea
                  className={styles.formTextarea}
                  rows={3}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Ingredients, sizing, usage notes…"
                />
              </label>
              <label className={styles.formLabel}>
                Category
                <input
                  className={styles.formInput}
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="Feed, Equipment, Pond care…"
                />
              </label>
              <label className={styles.formLabel}>
                Primary image
                <input
                  className={styles.formInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => void handlePrimaryImage(e)}
                />
                {productForm.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={productForm.imageUrl}
                    alt="Product preview"
                    className={styles.productThumb}
                  />
                ) : null}
              </label>
              <label className={styles.formLabel}>
                Additional images (up to 5)
                <input
                  className={styles.formInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => void handleExtraImages(e)}
                />
                {extraImages.length > 0 ? (
                  <div className={styles.imagePreviewRow}>
                    {extraImages.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={url} src={url} alt="" className={styles.productThumbSmall} />
                    ))}
                  </div>
                ) : null}
              </label>
              <label className={styles.formLabel}>
                Unit price (₦)
                <input
                  className={styles.formInput}
                  type="number"
                  min={0}
                  step={0.01}
                  value={productForm.unitPrice}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, unitPrice: e.target.value }))
                  }
                />
              </label>
              <label className={styles.formLabel}>
                Stock quantity
                <input
                  className={styles.formInput}
                  type="number"
                  min={0}
                  value={productForm.quantityInStock}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, quantityInStock: e.target.value }))
                  }
                />
              </label>
              <label className={styles.formLabel}>
                SKU (optional)
                <input
                  className={styles.formInput}
                  value={productForm.sku}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, sku: e.target.value }))
                  }
                />
              </label>
              <button
                type="button"
                className={styles.buttonPillWide}
                disabled={busy}
                onClick={() => void addProduct()}
              >
                {busy ? "Submitting…" : "Submit for approval"}
              </button>
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Your catalog</h2>
            {products.length === 0 ? (
              <p className={styles.panelBody}>No products yet.</p>
            ) : (
              <ul className={styles.catalogSalesList}>
                {products.map((p) => (
                  <li key={p.id} className={styles.catalogSalesRow}>
                    <div>
                      <strong>{p.name}</strong>
                      <p className={styles.metricSubMuted}>
                        {p.category} · SKU {p.sku} ·{" "}
                        {formatStatus(p.approvalStatus)}
                      </p>
                      <p className={styles.panelBody}>
                        {p.quantityInStock} in stock · {formatNgn(p.unitPrice)} ·{" "}
                        {p.unitsSold} sold · {formatNgn(p.revenue)} revenue
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}

      {tab === "orders" ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Approved orders</h2>
          <p className={styles.panelBody}>
            Orders appear here after admin approves a farmer&apos;s credit request.
          </p>
          {orders.length === 0 ? (
            <p className={styles.panelBody}>No approved orders yet.</p>
          ) : (
            <ul className={styles.requestList}>
              {orders.map((r) => {
                const f = fulfillments.find((x) => x.creditRequestId === r.id);
                return (
                  <li key={r.id} className={styles.requestRow}>
                    <div>
                      <span className={styles.statusChip}>{formatStatus(r.status)}</span>
                      <strong>{r.farmerName}</strong>
                      <p className={styles.panelBody}>
                        {r.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                      </p>
                      {f ? (
                        <p className={styles.metricSubMuted}>
                          Fulfillment: {formatStatus(f.status)}
                        </p>
                      ) : null}
                    </div>
                    <div className={styles.adminActions}>
                      <p className={styles.metricValue}>{formatNgn(r.totalAmount)}</p>
                      <p className={styles.metricSubMuted}>
                        {formatDate(r.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "fulfill" ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Fulfill orders</h2>
          <p className={styles.panelBody}>
            Accept approved orders, prepare delivery, mark ready, then confirm delivery
            at the pond. The farmer confirms receipt to finalize the loan.
          </p>
          {activeFulfillments.length === 0 ? (
            <p className={styles.panelBody}>No orders awaiting fulfillment.</p>
          ) : (
            <ul className={styles.requestList}>
              {activeFulfillments.map((f) => {
                const order = orders.find((o) => o.id === f.creditRequestId);
                if (!order) return null;
                return (
                  <li key={f.id} className={styles.requestRow}>
                    <div>
                      <span className={styles.statusChip}>{formatStatus(f.status)}</span>
                      <strong>{order.farmerName}</strong>
                      <p className={styles.panelBody}>
                        {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                      </p>
                      <p className={styles.otpDisplay}>Delivery OTP: {f.verificationOtp}</p>
                    </div>
                    <div className={styles.adminActions}>
                      <p className={styles.metricValue}>{formatNgn(order.totalAmount)}</p>
                      {f.status === "PENDING" ? (
                        <button
                          type="button"
                          className={styles.btnApprove}
                          disabled={busy}
                          onClick={() => void acceptOrder(f.id)}
                        >
                          Accept order
                        </button>
                      ) : null}
                      {f.status === "ACCEPTED" ? (
                        <button
                          type="button"
                          className={styles.btnApprove}
                          disabled={busy}
                          onClick={() => void markReady(f.id)}
                        >
                          Mark ready for pickup
                        </button>
                      ) : null}
                      {f.status === "READY_FOR_PICKUP" ||
                      f.status === "PARTIALLY_FULFILLED" ? (
                        <button
                          type="button"
                          className={styles.btnApprove}
                          disabled={busy}
                          onClick={() => void markFulfilled(f.id)}
                        >
                          Confirm delivered
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "messages" ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Messages</h2>
          <p className={styles.panelBody}>
            Order approvals, product reviews, and delivery updates.
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
            displayName={profileForm.fullName || profile.businessName}
            imageUrl={profile.profilePictureUrl}
            onUploaded={(url) => {
              setProfile((p) => (p ? { ...p, profilePictureUrl: url } : p));
              void refreshUser();
            }}
          />
          <p className={styles.panelBody}>
            {profile.email} · KYC {formatStatus(profile.kycStatus)} ·{" "}
            {profile.isVerified ? "Verified" : "Not verified"}
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
              Business name
              <input
                className={styles.formInput}
                value={profileForm.businessName}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, businessName: e.target.value }))
                }
              />
            </label>
            <label className={styles.formLabel}>
              TIN
              <input
                className={styles.formInput}
                value={profileForm.tin}
                onChange={(e) => setProfileForm((f) => ({ ...f, tin: e.target.value }))}
              />
            </label>
            <label className={styles.formLabel}>
              Warehouse address
              <textarea
                className={styles.formTextarea}
                rows={2}
                value={profileForm.warehouseAddress}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, warehouseAddress: e.target.value }))
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
            <button
              type="button"
              className={styles.buttonPillWide}
              disabled={busy}
              onClick={() => void saveProfile()}
            >
              {busy ? "Saving…" : "Save profile"}
            </button>
          </div>
        </section>
        <PasswordChangeForm />
        </>
      ) : null}
    </DashboardLayout>
  );
}
