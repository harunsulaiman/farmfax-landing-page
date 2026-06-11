import type { Metadata } from "next";
import { SupplierDashboardView } from "@/components/supplier/supplier-dashboard-view";

export const metadata: Metadata = {
  title: "Supplier Dashboard · FarmFax",
  description: "Manage catalog, orders, and fulfillment for FarmFax farmers.",
};

export default function SupplierDashboardPage(): React.JSX.Element {
  return <SupplierDashboardView />;
}
