"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TaskBoard } from "@/components/tasks/task-board";
import {
  formatDate,
  formatDateTime,
  priorityColors,
  priorityLabels,
  projectStatusLabels,
  taskStatusLabels,
} from "@/lib/labels";
import { CalendarDays, CheckSquare, List, KanbanSquare, Activity as ActivityIcon } from "lucide-react";

const TABS = ["kanban", "lista", "actividad"] as const;
type Tab = (typeof TABS)[number];

export function ProjectDetail({ project }: { project: any }) {
  const [tab, setTab] = useState<Tab>("kanban");
  const done = project.tasks.filter((t: any) => t.status === "COMPLETADO").length;
  const progress = project.tasks.length ? Math.round((done / project.tasks.length) * 100) : project.progress;

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink-900">{project.name}</h1>
            <p className="text-sm text-ink-500 mt-1">
              <Link href={`/clientes/${project.client.id}`} className="hover:text-brand-600">
                {project.client.name}
              </Link>
            </p>
            {project.description && (
              <p className="text-sm text-ink-600 mt-3 max-w-2xl">{project.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={priorityColors[project.priority]}>{priorityLabels[project.priority]}</Badge>
            <Badge className="bg-ink-100 text-ink-600">{projectStatusLabels[project.status]}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-ink-100 text-sm">
          <div>
            <p className="text-ink-500 flex items-center gap-1"><CalendarDays size={13}/> Inicio</p>
            <p className="text-ink-900 font-medium mt-0.5">{formatDate(project.startDate)}</p>
          </div>
          <div>
            <p className="text-ink-500 flex items-center gap-1"><CalendarDays size={13}/> Entrega</p>
            <p className="text-ink-900 font-medium mt-0.5">{formatDate(project.dueDate)}</p>
          </div>
          <div>
            <p className="text-ink-500 flex items-center gap-1"><CheckSquare size={13}/> Tareas</p>
            <p className="text-ink-900 font-medium mt-0.5">{done}/{project.tasks.length} completadas</p>
          </div>
          <div>
            <p className="text-ink-500">Progreso</p>
            <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden mt-2">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex border-b border-ink-100 px-2">
          <TabButton active={tab === "kanban"} onClick={() => setTab("kanban")} icon={KanbanSquare} label="Kanban" />
          <TabButton active={tab === "lista"} onClick={() => setTab("lista")} icon={List} label="Lista" />
          <TabButton active={tab === "actividad"} onClick={() => setTab("actividad")} icon={ActivityIcon} label="Actividad" />
        </div>

        <div className="p-5">
          {tab === "kanban" && <TaskBoard tasks={project.tasks} />}

          {tab === "lista" && (
            <ul className="space-y-2">
              {project.tasks.length === 0 && (
                <p className="text-sm text-ink-400 text-center py-6">Sin tareas todavía.</p>
              )}
              {project.tasks.map((t: any) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5 text-sm"
                >
                  <span className="text-ink-800">{t.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={priorityColors[t.priority]}>{priorityLabels[t.priority]}</Badge>
                    <Badge className="bg-ink-100 text-ink-600">{taskStatusLabels[t.status]}</Badge>
                    <span className="text-xs text-ink-400 w-16 text-right">{formatDate(t.dueDate)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {tab === "actividad" && (
            <ul className="space-y-3">
              {project.activities.length === 0 && (
                <p className="text-sm text-ink-400 text-center py-6">Sin actividad registrada.</p>
              )}
              {project.activities.map((a: any) => (
                <li key={a.id} className="text-sm flex justify-between">
                  <span className="text-ink-700">{a.message}</span>
                  <span className="text-ink-400 text-xs">{formatDateTime(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof List;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
        active ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-800"
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}
