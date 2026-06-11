"use client";

import Image from "next/image";
import { formatNgn } from "@/lib/format";
import styles from "@/styles/modules/farmer-dashboard.module.css";

export interface ProductCardData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  unitPrice: string;
  quantityInStock: number;
  imageUrl: string | null;
  imageUrls?: string[];
  supplierName: string;
}

interface ProductCardProps {
  product: ProductCardData;
  selected?: boolean;
  onSelect?: () => void;
  mode?: "select" | "display";
  variant?: "full" | "compact";
  badge?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&h=400&fit=crop";

export function ProductCard({
  product,
  selected = false,
  onSelect,
  mode = "select",
  variant = "full",
  badge,
}: ProductCardProps): React.JSX.Element {
  const imageSrc = product.imageUrl ?? FALLBACK_IMAGE;
  const isRemote = imageSrc.startsWith("http");

  const inner = (
    <>
      <div className={styles.ecomImageWrap}>
        {isRemote ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className={styles.ecomImage}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSrc} alt={product.name} className={styles.ecomImageNative} />
        )}
        <div className={styles.ecomImageOverlay} aria-hidden />
        {variant === "full" && badge ? (
          <span className={styles.ecomBadge}>{badge}</span>
        ) : null}
      </div>
      <div className={styles.ecomBody}>
        <h3 className={styles.ecomTitle}>{product.name}</h3>
        {variant === "full" ? (
          <>
            <span className={styles.productSupplier}>{product.supplierName}</span>
            {product.description ? (
              <p className={styles.ecomDescription}>{product.description}</p>
            ) : null}
          </>
        ) : null}
        <div className={styles.ecomFooter}>
          <span className={styles.ecomPrice}>{formatNgn(product.unitPrice)}</span>
          {variant === "full" ? (
            <span className={styles.ecomStock}>{product.quantityInStock} in stock</span>
          ) : null}
        </div>
      </div>
    </>
  );

  if (mode === "display") {
    return <article className={styles.ecomCard}>{inner}</article>;
  }

  const cardClass =
    variant === "compact"
      ? selected
        ? styles.ecomCardCompactActive
        : styles.ecomCardCompact
      : selected
        ? styles.ecomCardActive
        : styles.ecomCard;

  return (
    <button
      type="button"
      className={cardClass}
      onClick={onSelect}
      aria-pressed={selected}
    >
      {inner}
    </button>
  );
}
