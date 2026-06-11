import type { Metadata } from "next";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export const metadata: Metadata = {
  title: "Admin Dashboard · FarmFax",
  description: "FarmFax platform administration and credit oversight.",
};

export default function AdminDashboardPage(): React.JSX.Element {
  return <AdminDashboardView />;
}
