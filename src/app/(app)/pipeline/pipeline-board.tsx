"use client";

import { useMemo, useState } from "react";
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
import { dealStageLabels, dealStages, formatCurrency, formatDate } from "@/lib/labels";
import { moveDealStage } from "@/lib/actions/deals";
import { useUI } from "@/components/layout/ui-context";
import { DealStage } from "@prisma/client";
import { Building2, TrendingUp, Percent, Layers } from "lucide-react";

interface Deal {
  id: string;
  title: string;
  stage: string;
  value: number | null;
  probability: number;
  nextAction: string | null;
  nextActionAt: Date | null;
  client: { id: string; name: string };
  owner: { firstName: string; lastName: string } | null;
}

export function PipelineBoard({ deals: initialDeals }: { deals: Deal[] }) {
  const [deals, setDeals] = useState(initialDeals);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();
  const { setQuickCreateOpen } = useUI();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const totals = useMemo(() => {
    const open = deals.filter((d) => d.stage !== "GANADO" && d.stage !== "PERDIDO");
    const totalValue = open.reduce((acc, d) => acc + (d.value || 0), 0);
    const weighted = open.reduce((acc, d) => acc + ((d.value || 0) * d.probability) / 100, 0);
    const won = deals.filter((d) => d.stage === "GANADO").length;
    const lost = deals.filter((d) => d.stage === "PERDIDO").length;
    const conversion = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;
    return { totalValue, weighted, conversion, openCount: open.length };
  }, [deals]);

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const newStage = String(over.id) as DealStage;
    const deal = deals.find((d) => d.id === active.id);
    if (!deal || deal.stage === newStage) return;

    setDeals((prev) => prev.map((d) => (d.id === deal.id ? { ...d, stage: newStage } : d)));
    await moveDealStage(deal.id, newStage);
    router.refresh();
  }

  const activeDeal = deals.find((d) => d.id === activeId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Pipeline comercial</h1>
          <p className="text-ink-500 text-sm mt-0.5">Arrastrá las oportunidades entre etapas.</p>
        </div>
        <button onClick={() => setQuickCreateOpen(true)} className="btn-primary">
          + Nueva oportunidad
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Layers} label="Oportunidades abiertas" value={String(totals.openCount)} />
        <Stat icon={TrendingUp} label="Valor del pipeline" value={formatCurrency(totals.totalValue)} />
        <Stat icon={TrendingUp} label="Valor ponderado" value={formatCurrency(totals.weighted)} />
        <Stat icon={Percent} label="Tasa de conversión" value={`${totals.conversion}%`} />
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {dealStages.map((stage) => (
            <Column
              key={stage}
              stage={stage}
              deals={deals.filter((d) => d.stage === stage)}
            />
          ))}
        </div>
        <DragOverlay>{activeDeal && <DealCard deal={activeDeal} dragging />}</DragOverlay>
      </DndContext>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-xs text-ink-500">
        <Icon size={14} /> {label}
      </div>
      <p className="text-xl font-semibold text-ink-900 mt-1">{value}</p>
    </div>
  );
}

function Column({ stage, deals }: { stage: string; deals: Deal[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const value = deals.reduce((acc, d) => acc + (d.value || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 rounded-xl border ${
        isOver ? "border-brand-400 bg-brand-50/50" : "border-ink-200 bg-ink-50/50"
      } flex flex-col`}
    >
      <div className="p-3 border-b border-ink-200">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-800">{dealStageLabels[stage]}</p>
          <span className="text-xs text-ink-400">{deals.length}</span>
        </div>
        <p className="text-xs text-ink-500 mt-0.5">{formatCurrency(value)}</p>
      </div>
      <div className="p-2 space-y-2 min-h-[120px]">
        {deals.map((d) => (
          <DraggableCard key={d.id} deal={d} />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.4 : 1 }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <DealCard deal={deal} />
    </div>
  );
}

function DealCard({ deal, dragging }: { deal: Deal; dragging?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-ink-200 bg-white p-3 text-sm shadow-sm cursor-grab active:cursor-grabbing ${
        dragging ? "shadow-lg" : ""
      }`}
    >
      <p className="font-medium text-ink-900">{deal.title}</p>
      <p className="text-xs text-ink-500 flex items-center gap-1 mt-1">
        <Building2 size={12} /> {deal.client.name}
      </p>
      {deal.value != null && (
        <p className="text-xs text-ink-700 font-medium mt-1">{formatCurrency(deal.value)}</p>
      )}
      {deal.nextAction && (
        <p className="text-xs text-brand-600 mt-1.5 truncate">→ {deal.nextAction}</p>
      )}
      {deal.nextActionAt && (
        <p className="text-[11px] text-ink-400 mt-0.5">{formatDate(deal.nextActionAt)}</p>
      )}
    </div>
  );
}
