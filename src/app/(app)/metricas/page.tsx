import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MetricasPage() {
  const values = await prisma.metricValue.findMany({
    orderBy: { periodEnd: "desc" },
    take: 100,
    include: { client: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Métricas</h1>
        <p className="text-ink-500 text-sm mt-0.5">
          Histórico de métricas por cliente y plataforma (redes, web, SEO, publicidad). Gráficos de
          evolución e integraciones automáticas disponibles en una próxima fase.
        </p>
      </div>

      {values.length === 0 ? (
        <div className="card p-16 text-center text-ink-400">
          <BarChart3 className="mx-auto mb-3 text-ink-300" size={28} />
          Todavía no hay métricas cargadas. Se cargan manualmente desde la ficha de cada cliente.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-500">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Plataforma</th>
                <th className="px-4 py-3 font-medium">Métrica</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Período</th>
              </tr>
            </thead>
            <tbody>
              {values.map((v) => (
                <tr key={v.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-4 py-3 text-ink-800">{v.client.name}</td>
                  <td className="px-4 py-3 text-ink-500 capitalize">{v.platform}</td>
                  <td className="px-4 py-3 text-ink-500 capitalize">{v.metric}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{Number(v.value)}</td>
                  <td className="px-4 py-3 text-ink-400">{formatDate(v.periodEnd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
