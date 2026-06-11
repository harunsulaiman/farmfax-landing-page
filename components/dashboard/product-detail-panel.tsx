"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductCardData } from "@/components/dashboard/product-card";
import { formatNgn } from "@/lib/format";
import styles from "@/styles/modules/farmer-dashboard.module.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop";

interface ProductDetailPanelProps {
  product: ProductCardData;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onPlaceOrder: () => void;
  onClose?: () => void;
  loading?: boolean;
  canOrder?: boolean;
  orderHint?: string;
}

export function ProductDetailPanel({
  product,
  quantity,
  onQuantityChange,
  notes,
  onNotesChange,
  onPlaceOrder,
  onClose,
  loading = false,
  canOrder = true,
  orderHint,
}: ProductDetailPanelProps): React.JSX.Element {
  const images = [
    product.imageUrl ?? FALLBACK_IMAGE,
    ...(product.imageUrls ?? []).filter((u) => u !== product.imageUrl),
  ];
  const [activeImage, setActiveImage] = useState(0);
  const lineTotal = Number(product.unitPrice) * quantity;

  return (
    <section className={styles.productDetailPanel}>
      <div className={styles.productDetailHeader}>
        <div>
          <span className={styles.productSupplier}>{product.supplierName}</span>
          <h2 className={styles.productDetailTitle}>{product.name}</h2>
          <p className={styles.productDetailPrice}>{formatNgn(product.unitPrice)}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            className={styles.productDetailClose}
            onClick={onClose}
            aria-label="Close product details"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className={styles.productDetailOrder}>
        <label className={styles.formLabel}>
          Quantity
          <input
            className={styles.formInput}
            type="number"
            min={1}
            max={product.quantityInStock}
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
          />
        </label>
        <label className={styles.formLabel}>
          Delivery notes (optional)
          <textarea
            className={styles.formTextarea}
            rows={2}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Pond block, gate instructions…"
          />
        </label>
        <p className={styles.productDetailTotal}>
          Order total: <strong>{formatNgn(lineTotal)}</strong>
        </p>
        {orderHint ? <p className={styles.formHint}>{orderHint}</p> : null}
        <button
          type="button"
          className={styles.buttonPillWide}
          disabled={loading || !canOrder}
          onClick={onPlaceOrder}
        >
          {loading ? "Placing order…" : "Place order"}
        </button>
      </div>

      <div className={styles.productDetailGallery}>
        <div className={styles.productDetailHero}>
          <Image
            src={images[activeImage] ?? FALLBACK_IMAGE}
            alt={product.name}
            fill
            sizes="(max-width: 900px) 100vw, 720px"
            className={styles.productDetailHeroImg}
          />
        </div>
        {images.length > 1 ? (
          <div className={styles.productThumbStrip} role="list">
            {images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                role="listitem"
                className={
                  index === activeImage
                    ? styles.productThumbBtnActive
                    : styles.productThumbBtn
                }
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="72px"
                  className={styles.productThumbBtnImg}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {product.description ? (
        <p className={styles.productDetailDescription}>{product.description}</p>
      ) : null}
      <p className={styles.productDetailStock}>
        {product.quantityInStock} units in stock
      </p>
    </section>
  );
}
