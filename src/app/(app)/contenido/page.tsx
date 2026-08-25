import { prisma } from "@/lib/prisma";
import { contentStatusLabels, formatDate } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUSES = Object.keys(contentStatusLabels);

export default async function ContenidoPage() {
  const items = await prisma.contentItem.findMany({
    orderBy: { scheduledAt: "asc" },
    include: { client: { select: { name: true } }, owner: { select: { firstName: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Calendario de contenido</h1>
        <p className="text-ink-500 text-sm mt-0.5">
          Planificación editorial por cliente y plataforma. Vista mensual disponible en una próxima fase.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card p-16 text-center text-ink-400">
          <FileText className="mx-auto mb-3 text-ink-300" size={28} />
          Todavía no hay contenido planificado. Usá &quot;+ Nuevo → Contenido&quot; para cargar la primera pieza.
        </div>
      ) : (
        <div className="grid md:grid-cols-4 gap-4 overflow-x-auto">
          {STATUSES.map((status) => (
            <div key={status} className="rounded-xl border border-ink-200 bg-ink-50/50 min-w-[220px]">
              <div className="p-3 border-b border-ink-200 flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-800">{contentStatusLabels[status]}</p>
                <span className="text-xs text-ink-400">
                  {items.filter((i) => i.status === status).length}
                </span>
              </div>
              <div className="p-2 space-y-2">
                {items
                  .filter((i) => i.status === status)
                  .map((i) => (
                    <div key={i.id} className="rounded-lg border border-ink-200 bg-white p-3 text-sm">
                      <p className="font-medium text-ink-900">{i.title}</p>
                      <p className="text-xs text-ink-500 mt-1">{i.client.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className="bg-ink-100 text-ink-600">{i.platform}</Badge>
                        <span className="text-[11px] text-ink-400">{formatDate(i.scheduledAt)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
