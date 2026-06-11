import type { Metadata } from "next";
import { FarmerDashboardView } from "@/components/farmer/farmer-dashboard-view";

export const metadata: Metadata = {
  title: "Farmer Dashboard · FarmFax Aquaculture",
  description:
    "Monitor pond credit, repayment schedules, and harvest activity for your aquaculture operation.",
};

export default function FarmerDashboardPage(): React.JSX.Element {
  return <FarmerDashboardView />;
}
