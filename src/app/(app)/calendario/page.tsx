import { prisma } from "@/lib/prisma";
import { CalendarClock, Building2, MapPin } from "lucide-react";
import { formatDateTime } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const meetings = await prisma.meeting.findMany({
    orderBy: { startsAt: "asc" },
    include: { client: { select: { name: true } } },
  });

  const now = new Date();
  const upcoming = meetings.filter((m) => new Date(m.startsAt) >= now);
  const past = meetings.filter((m) => new Date(m.startsAt) < now).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Calendario</h1>
        <p className="text-ink-500 text-sm mt-0.5">
          Reuniones, llamadas y eventos. Integración con Google Calendar disponible en una próxima fase.
        </p>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Próximos eventos</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-400 text-center py-6">No hay eventos programados.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-lg border border-ink-100 px-3 py-2.5 text-sm">
                <CalendarClock size={16} className="text-brand-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-900 truncate">{m.title}</p>
                  <p className="text-xs text-ink-500 flex items-center gap-3 mt-0.5">
                    {m.client && (
                      <span className="flex items-center gap-1">
                        <Building2 size={11} /> {m.client.name}
                      </span>
                    )}
                    {m.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {m.location}
                      </span>
                    )}
                  </p>
                </div>
                <Badge className="bg-ink-100 text-ink-600 shrink-0">{m.type}</Badge>
                <span className="text-xs text-ink-500 shrink-0 w-32 text-right">
                  {formatDateTime(m.startsAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {past.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Eventos pasados</h2>
          <ul className="space-y-2">
            {past.slice(0, 10).map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-500">
                <CalendarClock size={14} className="shrink-0" />
                <span className="flex-1 truncate">{m.title}</span>
                <span className="text-xs shrink-0">{formatDateTime(m.startsAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
