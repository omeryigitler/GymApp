import { DashboardPage } from "@/widgets/dashboard/ui/dashboard-page";
import { ProductShell } from "@/widgets/product-shell/ui/product-shell";

export default function HomePage() {
  return (
    <ProductShell>
      <DashboardPage />
    </ProductShell>
  );
}
