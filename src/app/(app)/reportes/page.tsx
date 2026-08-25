import { ComingSoon } from "@/components/ui/coming-soon";
import { PieChart } from "lucide-react";

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Reportes</h1>
        <p className="text-ink-500 text-sm mt-0.5">
          Reportes exportables por cliente, proyecto y período.
        </p>
      </div>
      <ComingSoon
        icon={PieChart}
        title="Reportes en construcción"
        description="Los reportes consolidados (facturación, performance de proyectos, métricas por cliente) se habilitarán junto con el módulo de métricas históricas."
      />
    </div>
  );
}
