"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, priorityColors, priorityLabels, projectStatusLabels } from "@/lib/labels";
import { useUI } from "@/components/layout/ui-context";

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  priority: string;
  progress: number;
  dueDate: Date | null;
  client: { id: string; name: string };
  owner: { firstName: string; lastName: string } | null;
  _count: { tasks: number };
}

const STATUS_FILTERS = ["TODOS", ...Object.keys(projectStatusLabels)];

export function ProjectsExplorer({ projects }: { projects: ProjectRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("TODOS");
  const { setQuickCreateOpen } = useUI();

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.client.name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "TODOS" || p.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [projects, query, status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Proyectos</h1>
          <p className="text-ink-500 text-sm mt-0.5">{projects.length} proyectos en total</p>
        </div>
        <button onClick={() => setQuickCreateOpen(true)} className="btn-primary">
          + Nuevo proyecto
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar proyecto o cliente…"
            className="input pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input sm:w-56">
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "TODOS" ? "Todos los estados" : projectStatusLabels[s]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-ink-400">No se encontraron proyectos.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link key={p.id} href={`/proyectos/${p.id}`} className="card p-4 hover:border-brand-300">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink-900 flex items-center gap-2 min-w-0">
                  <FolderKanban size={16} className="text-brand-500 shrink-0" />
                  <span className="truncate">{p.name}</span>
                </p>
                <Badge className={priorityColors[p.priority]}>{priorityLabels[p.priority]}</Badge>
              </div>
              <p className="text-xs text-ink-500 mt-1">{p.client.name}</p>

              <div className="mt-3">
                <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-ink-500">
                  <Badge className="bg-ink-100 text-ink-600">{projectStatusLabels[p.status]}</Badge>
                  <span>{p._count.tasks} tareas</span>
                </div>
              </div>
              <p className="text-xs text-ink-400 mt-2">Entrega: {formatDate(p.dueDate)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
