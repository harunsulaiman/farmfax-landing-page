import styles from "@/styles/modules/farmer-dashboard.module.css";

type MetricTone = "default" | "warning" | "success";

interface FarmerMetric {
  id: string;
  label: string;
  value: string;
  subtext: string;
  tone: MetricTone;
}

const FARMER_METRICS: readonly FarmerMetric[] = [
  {
    id: "balance",
    label: "Current Loan Balance",
    value: "₦450,000",
    subtext: "↓ ₦50,000 paid this month",
    tone: "success",
  },
  {
    id: "repayment",
    label: "Next Repayment Due",
    value: "₦85,000",
    subtext: "Due Nov 22, 2026",
    tone: "default",
  },
  {
    id: "yield",
    label: "Total Yield (2026)",
    value: "8.4 tonnes",
    subtext: "+23% vs last season",
    tone: "success",
  },
  {
    id: "pending",
    label: "Pending Requests",
    value: "2",
    subtext: "1 feed, 1 medication",
    tone: "warning",
  },
] as const;

function subtextClass(tone: MetricTone): string {
  if (tone === "success") return styles.metricSubSuccess as string;
  if (tone === "warning") return styles.metricSubWarning as string;
  return styles.metricSubMuted as string;
}

export function FarmerMetrics(): React.JSX.Element {
  return (
    <div className={styles.metricsGrid} role="region" aria-label="Summary metrics">
      {FARMER_METRICS.map((metric) => (
        <article key={metric.id} className={styles.metricCard}>
          <p className={styles.metricLabel}>{metric.label}</p>
          <p className={styles.metricValue}>{metric.value}</p>
          <p className={subtextClass(metric.tone)}>{metric.subtext}</p>
        </article>
      ))}
    </div>
  );
}
