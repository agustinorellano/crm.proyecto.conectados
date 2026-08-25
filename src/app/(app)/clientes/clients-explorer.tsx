"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, Search, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { clientStatusColors, clientStatusLabels, formatCurrency } from "@/lib/labels";
import { useUI } from "@/components/layout/ui-context";

interface ClientRow {
  id: string;
  name: string;
  industry: string | null;
  status: string;
  monthlyValue: number | null;
  logoUrl: string | null;
  owner: { firstName: string; lastName: string } | null;
  _count: { projects: number; tasks: number };
}

const STATUS_FILTERS = ["TODOS", ...Object.keys(clientStatusLabels)];

export function ClientsExplorer({ clients }: { clients: ClientRow[] }) {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("TODOS");
  const { setQuickCreateOpen } = useUI();

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "TODOS" || c.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [clients, query, status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Clientes</h1>
          <p className="text-ink-500 text-sm mt-0.5">{clients.length} clientes en total</p>
        </div>
        <button onClick={() => setQuickCreateOpen(true)} className="btn-primary">
          + Nuevo cliente
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente…"
            className="input pl-9"
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input sm:w-56">
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "TODOS" ? "Todos los estados" : clientStatusLabels[s]}
            </option>
          ))}
        </select>

        <div className="flex gap-1 rounded-lg border border-ink-200 bg-white p-1 self-start">
          <button
            onClick={() => setView("cards")}
            className={`rounded-md p-1.5 ${view === "cards" ? "bg-ink-100" : ""}`}
            aria-label="Vista de tarjetas"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView("table")}
            className={`rounded-md p-1.5 ${view === "table" ? "bg-ink-100" : ""}`}
            aria-label="Vista de tabla"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center text-ink-400">
          No se encontraron clientes con esos filtros.
        </div>
      )}

      {view === "cards" && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <Link key={c.id} href={`/clientes/${c.id}`} className="card p-4 hover:border-brand-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-semibold shrink-0">
                  {c.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logoUrl} alt={c.name} className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <Building2 size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-ink-900 truncate">{c.name}</p>
                  <p className="text-xs text-ink-500 truncate">{c.industry || "Sin industria"}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge className={clientStatusColors[c.status]}>{clientStatusLabels[c.status]}</Badge>
                <span className="text-xs text-ink-400">
                  {c._count.projects} proy · {c._count.tasks} tareas
                </span>
              </div>
              {c.monthlyValue != null && (
                <p className="mt-2 text-sm text-ink-600">{formatCurrency(c.monthlyValue)}/mes</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {view === "table" && filtered.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-500">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Industria</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 font-medium">Valor mensual</th>
                <th className="px-4 py-3 font-medium">Proyectos</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-ink-50 last:border-0 hover:bg-ink-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <Link href={`/clientes/${c.id}`} className="font-medium text-ink-900 hover:text-brand-600">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{c.industry || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className={clientStatusColors[c.status]}>{clientStatusLabels[c.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {c.owner ? `${c.owner.firstName} ${c.owner.lastName}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{formatCurrency(c.monthlyValue)}</td>
                  <td className="px-4 py-3 text-ink-500">{c._count.projects}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
