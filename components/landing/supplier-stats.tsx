import styles from "@/styles/modules/landing.module.css";

interface NetworkStatPlaceholder {
  id: string;
  label: string;
  hint: string;
}

const NETWORK_STAT_PLACEHOLDERS: readonly NetworkStatPlaceholder[] = [
  {
    id: "active-suppliers",
    label: "Active suppliers",
    hint: "Verified warehouses on the network",
  },
  {
    id: "catalog-skus",
    label: "Catalog SKUs",
    hint: "Live input items available for credit drawdown",
  },
  {
    id: "fulfillment-rate",
    label: "Fulfillment rate",
    hint: "OTP-confirmed deliveries vs. pending orders",
  },
  {
    id: "credit-deployed",
    label: "Credit deployed (NGN)",
    hint: "Aggregate in-kind credit outstanding",
  },
] as const;

export function SupplierStats(): React.JSX.Element {
  return (
    <section
      id="network"
      className={styles.section}
      aria-labelledby="network-heading"
    >
      <div className={styles.inner}>
        <div className={styles.statsHeader}>
          <div>
            <p className={styles.eyebrow}>Supplier network</p>
            <h2 id="network-heading" className={styles.heading}>
              Network statistics
            </h2>
            <p className={styles.lead}>
              Feed mills, hatcheries, and aquaculture input suppliers across the
              network — metrics will stream live from the API layer at launch.
            </p>
          </div>
          <span className={styles.emptyStateBadge} role="status">
            Awaiting live data feed
          </span>
        </div>
        <div className={styles.gridTwo}>
          {NETWORK_STAT_PLACEHOLDERS.map((stat) => (
            <article
              key={stat.id}
              className={styles.statCard}
              aria-labelledby={`${stat.id}-label`}
            >
              <p
                id={`${stat.id}-label`}
                className={styles.statLabel}
              >
                {stat.label}
              </p>
              <p className={styles.statValuePlaceholder} aria-hidden>
                ———
              </p>
              <p className={styles.statHint}>{stat.hint}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
