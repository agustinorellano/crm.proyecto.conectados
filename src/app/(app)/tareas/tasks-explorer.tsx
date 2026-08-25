"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { List, KanbanSquare, Search, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, priorityColors, priorityLabels, taskStatusLabels } from "@/lib/labels";
import { TaskBoard } from "@/components/tasks/task-board";
import { useUI } from "@/components/layout/ui-context";

interface TaskRow {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  client: { name: string } | null;
  project: { id: string; name: string } | null;
  assignee: { firstName: string; lastName: string } | null;
}

export function TasksExplorer({ tasks }: { tasks: TaskRow[] }) {
  const [view, setView] = useState<"lista" | "kanban">("lista");
  const [query, setQuery] = useState("");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const { setQuickCreateOpen } = useUI();

  const filtered = useMemo(() => {
    const now = new Date();
    return tasks.filter((t) => {
      const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase());
      const isOverdue = t.dueDate && new Date(t.dueDate) < now && t.status !== "COMPLETADO";
      return matchesQuery && (!onlyOverdue || isOverdue);
    });
  }, [tasks, query, onlyOverdue]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Tareas</h1>
          <p className="text-ink-500 text-sm mt-0.5">{tasks.length} tareas en total</p>
        </div>
        <button onClick={() => setQuickCreateOpen(true)} className="btn-primary">
          + Nueva tarea
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tarea…"
            className="input pl-9"
          />
        </div>

        <button
          onClick={() => setOnlyOverdue((v) => !v)}
          className={`btn ${onlyOverdue ? "bg-red-50 text-red-700 border border-red-200" : "btn-secondary"}`}
        >
          <AlertTriangle size={14} /> Solo vencidas
        </button>

        <div className="flex gap-1 rounded-lg border border-ink-200 bg-white p-1 sm:ml-auto self-start">
          <button
            onClick={() => setView("lista")}
            className={`rounded-md p-1.5 ${view === "lista" ? "bg-ink-100" : ""}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`rounded-md p-1.5 ${view === "kanban" ? "bg-ink-100" : ""}`}
          >
            <KanbanSquare size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center text-ink-400">No se encontraron tareas.</div>
      )}

      {view === "kanban" && filtered.length > 0 && <TaskBoard tasks={filtered} />}

      {view === "lista" && filtered.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-500">
                <th className="px-4 py-3 font-medium">Tarea</th>
                <th className="px-4 py-3 font-medium">Cliente / Proyecto</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 font-medium">Prioridad</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Vence</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const overdue =
                  t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETADO";
                return (
                  <tr key={t.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50">
                    <td className="px-4 py-3 font-medium text-ink-900">{t.title}</td>
                    <td className="px-4 py-3 text-ink-500">
                      {t.project ? (
                        <Link href={`/proyectos/${t.project.id}`} className="hover:text-brand-600">
                          {t.project.name}
                        </Link>
                      ) : (
                        t.client?.name || "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : "Sin asignar"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={priorityColors[t.priority]}>{priorityLabels[t.priority]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-ink-100 text-ink-600">{taskStatusLabels[t.status]}</Badge>
                    </td>
                    <td className={`px-4 py-3 ${overdue ? "text-red-600 font-medium" : "text-ink-500"}`}>
                      {formatDate(t.dueDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
