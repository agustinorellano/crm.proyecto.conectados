"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CalendarDays, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, priorityColors, priorityLabels, taskStatusLabels, taskStatuses } from "@/lib/labels";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { TaskStatus } from "@prisma/client";

export interface BoardTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  client?: { name: string } | null;
  assignee?: { firstName: string; lastName: string } | null;
}

export function TaskBoard({ tasks: initialTasks }: { tasks: BoardTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const newStatus = String(over.id) as TaskStatus;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.status === newStatus) return;

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    await updateTaskStatus(task.id, newStatus);
    router.refresh();
  }

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {taskStatuses.map((status) => (
          <Column key={status} status={status} tasks={tasks.filter((t) => t.status === status)} />
        ))}
      </div>
      <DragOverlay>{activeTask && <TaskCard task={activeTask} dragging />}</DragOverlay>
    </DndContext>
  );
}

function Column({ status, tasks }: { status: string; tasks: BoardTask[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`w-64 shrink-0 rounded-xl border ${
        isOver ? "border-brand-400 bg-brand-50/50" : "border-ink-200 bg-ink-50/50"
      } flex flex-col`}
    >
      <div className="p-3 border-b border-ink-200 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-800">{taskStatusLabels[status]}</p>
        <span className="text-xs text-ink-400">{tasks.length}</span>
      </div>
      <div className="p-2 space-y-2 min-h-[100px]">
        {tasks.map((t) => (
          <DraggableTask key={t.id} task={t} />
        ))}
      </div>
    </div>
  );
}

function DraggableTask({ task }: { task: BoardTask }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.4 : 1 }
    : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task, dragging }: { task: BoardTask; dragging?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-ink-200 bg-white p-3 text-sm shadow-sm cursor-grab active:cursor-grabbing ${
        dragging ? "shadow-lg" : ""
      }`}
    >
      <p className="font-medium text-ink-900">{task.title}</p>
      {task.client && (
        <p className="text-xs text-ink-500 flex items-center gap-1 mt-1">
          <Building2 size={12} /> {task.client.name}
        </p>
      )}
      <div className="flex items-center justify-between mt-2">
        <Badge className={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Badge>
        {task.dueDate && (
          <span className="text-[11px] text-ink-400 flex items-center gap-1">
            <CalendarDays size={11} /> {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
