import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  COMUNICACION_DIGITAL: "Comunicación Digital",
  MARKETING_DIGITAL: "Marketing Digital",
  DESARROLLO_WEB: "Desarrollo Web",
  SOLUCIONES_DIGITALES: "Desarrollo y Soluciones Digitales",
};

const CATEGORY_COLORS: Record<string, string> = {
  COMUNICACION_DIGITAL: "bg-blue-50 text-blue-700",
  MARKETING_DIGITAL: "bg-emerald-50 text-emerald-700",
  DESARROLLO_WEB: "bg-violet-50 text-violet-700",
  SOLUCIONES_DIGITALES: "bg-amber-50 text-amber-700",
};

export default async function ServiciosPage() {
  const services = await prisma.service.findMany({
    include: { _count: { select: { clientServices: true, projects: true } } },
    orderBy: { name: "asc" },
  });

  const grouped = Object.keys(CATEGORY_LABELS).map((category) => ({
    category,
    services: services.filter((s) => s.category === category),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Servicios de Conectados</h1>
        <p className="text-ink-500 text-sm mt-0.5">
          Catálogo de servicios por categoría, asociables a clientes y proyectos.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="card p-16 text-center text-ink-400">
          Todavía no hay servicios cargados. Corré el seed inicial para cargar el catálogo base de
          Conectados.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(
            (g) =>
              g.services.length > 0 && (
                <div key={g.category}>
                  <Badge className={CATEGORY_COLORS[g.category] + " mb-3"}>
                    {CATEGORY_LABELS[g.category]}
                  </Badge>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {g.services.map((s) => (
                      <div key={s.id} className="card p-4">
                        <p className="font-medium text-ink-900">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-ink-500 mt-1">{s.description}</p>
                        )}
                        <p className="text-xs text-ink-400 mt-2">
                          {s._count.clientServices} clientes · {s._count.projects} proyectos
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
