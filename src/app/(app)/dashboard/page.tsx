import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Users,
  GitBranch,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  CalendarClock,
  FileText,
  Wallet,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { dealStageLabels, dealStages, formatCurrency, formatDateTime } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getData() {
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    clientesActivos,
    leadsAbiertos,
    proyectosActivos,
    tareasPendientes,
    tareasVencidas,
    reunionesSemana,
    contenidoPendiente,
    nuevosClientes,
    clientesTotal,
    clientesPerdidos,
    facturacionAgg,
    pipelineDeals,
    actividad,
    proximasReuniones,
    proximasTareas,
  ] = await Promise.all([
    prisma.client.count({ where: { status: "ACTIVO" } }),
    prisma.deal.count({ where: { stage: { notIn: ["GANADO", "PERDIDO"] } } }),
    prisma.project.count({ where: { status: { not: "COMPLETADO" } } }),
    prisma.task.count({ where: { status: { not: "COMPLETADO" } } }),
    prisma.task.count({
      where: { status: { not: "COMPLETADO" }, dueDate: { lt: now } },
    }),
    prisma.meeting.count({ where: { startsAt: { gte: now, lte: in7Days } } }),
    prisma.contentItem.count({ where: { status: { not: "PUBLICADO" } } }),
    prisma.client.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.client.count(),
    prisma.client.count({ where: { status: "PERDIDO" } }),
    prisma.client.aggregate({
      where: { status: "ACTIVO" },
      _sum: { monthlyValue: true },
    }),
    prisma.deal.findMany({
      where: { stage: { notIn: ["GANADO", "PERDIDO"] } },
      select: { stage: true, value: true, probability: true },
    }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { client: { select: { name: true } }, user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.meeting.findMany({
      where: { startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    prisma.task.findMany({
      where: { status: { not: "COMPLETADO" }, dueDate: { gte: now } },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
  ]);

  const pipelineValue = pipelineDeals.reduce((acc, d) => acc + Number(d.value || 0), 0);
  const weightedValue = pipelineDeals.reduce(
    (acc, d) => acc + (Number(d.value || 0) * d.probability) / 100,
    0
  );
  const retencion = clientesTotal > 0 ? Math.round(((clientesTotal - clientesPerdidos) / clientesTotal) * 100) : 100;

  const stageCounts = dealStages.reduce<Record<string, number>>((acc, s) => {
    acc[s] = pipelineDeals.filter((d) => d.stage === s).length;
    return acc;
  }, {});

  return {
    kpis: {
      clientesActivos,
      leadsAbiertos,
      proyectosActivos,
      tareasPendientes,
      tareasVencidas,
      reunionesSemana,
      contenidoPendiente,
      nuevosClientes,
      facturacionMensual: Number(facturacionAgg._sum.monthlyValue || 0),
      pipelineValue,
      weightedValue,
      retencion,
    },
    stageCounts,
    actividad,
    proximasReuniones,
    proximasTareas,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] || "";
  const { kpis, stageCounts, actividad, proximasReuniones, proximasTareas } = await getData();

  const kpiCards = [
    { label: "Clientes activos", value: kpis.clientesActivos, icon: Users, href: "/clientes" },
    { label: "Leads abiertos", value: kpis.leadsAbiertos, icon: GitBranch, href: "/pipeline" },
    { label: "Proyectos activos", value: kpis.proyectosActivos, icon: FolderKanban, href: "/proyectos" },
    { label: "Tareas pendientes", value: kpis.tareasPendientes, icon: CheckSquare, href: "/tareas" },
    {
      label: "Tareas vencidas",
      value: kpis.tareasVencidas,
      icon: AlertTriangle,
      href: "/tareas",
      alert: kpis.tareasVencidas > 0,
    },
    { label: "Reuniones esta semana", value: kpis.reunionesSemana, icon: CalendarClock, href: "/calendario" },
    { label: "Contenido pendiente", value: kpis.contenidoPendiente, icon: FileText, href: "/contenido" },
    { label: "Nuevos clientes (mes)", value: kpis.nuevosClientes, icon: UserPlus, href: "/clientes" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Hola, {firstName || "equipo"} 👋</h1>
        <p className="text-ink-500 mt-1">Esto es lo que está pasando hoy en Conectados.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="card p-4 flex items-start justify-between hover:border-brand-300 transition-colors"
          >
            <div>
              <p className="text-xs font-medium text-ink-500">{k.label}</p>
              <p className={`text-2xl font-semibold mt-1 ${k.alert ? "text-red-600" : "text-ink-900"}`}>
                {k.value}
              </p>
            </div>
            <k.icon size={18} className={k.alert ? "text-red-500" : "text-brand-500"} />
          </Link>
        ))}
      </div>

      {/* Facturación / pipeline / retención */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-ink-500 text-xs font-medium">
            <Wallet size={15} /> FACTURACIÓN MENSUAL (clientes activos)
          </div>
          <p className="text-2xl font-semibold text-ink-900 mt-2">
            {formatCurrency(kpis.facturacionMensual)}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-ink-500 text-xs font-medium">
            <TrendingUp size={15} /> VALOR DEL PIPELINE (ponderado)
          </div>
          <p className="text-2xl font-semibold text-ink-900 mt-2">
            {formatCurrency(kpis.pipelineValue)}{" "}
            <span className="text-sm font-normal text-ink-400">
              · {formatCurrency(kpis.weightedValue)} ponderado
            </span>
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-ink-500 text-xs font-medium">
            <Users size={15} /> RETENCIÓN DE CLIENTES
          </div>
          <p className="text-2xl font-semibold text-ink-900 mt-2">{kpis.retencion}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pipeline resumido */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-900">Pipeline comercial</h2>
            <Link href="/pipeline" className="text-sm text-brand-600 hover:underline">
              Ver pipeline →
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {dealStages.map((stage) => (
              <div key={stage} className="rounded-lg bg-ink-50 p-2 text-center">
                <p className="text-lg font-semibold text-ink-900">{stageCounts[stage] || 0}</p>
                <p className="text-[10px] text-ink-500 leading-tight mt-0.5">
                  {dealStageLabels[stage]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos eventos */}
        <div className="card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Próximos eventos</h2>
          <div className="space-y-3">
            {proximasReuniones.length === 0 && proximasTareas.length === 0 && (
              <p className="text-sm text-ink-400">No hay eventos próximos.</p>
            )}
            {proximasReuniones.map((m) => (
              <div key={m.id} className="flex items-start gap-2 text-sm">
                <CalendarClock size={14} className="text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-ink-800 font-medium">{m.title}</p>
                  <p className="text-ink-400 text-xs">
                    {formatDateTime(m.startsAt)} {m.client ? `· ${m.client.name}` : ""}
                  </p>
                </div>
              </div>
            ))}
            {proximasTareas.map((t) => (
              <div key={t.id} className="flex items-start gap-2 text-sm">
                <CheckSquare size={14} className="text-ink-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-ink-800 font-medium">{t.title}</p>
                  <p className="text-ink-400 text-xs">
                    Vence {formatDateTime(t.dueDate)} {t.client ? `· ${t.client.name}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Actividad reciente</h2>
        {actividad.length === 0 ? (
          <p className="text-sm text-ink-400">
            Todavía no hay actividad registrada. Empezá creando un cliente o una tarea.
          </p>
        ) : (
          <ul className="space-y-3">
            {actividad.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <Badge className="bg-brand-50 text-brand-700 shrink-0">
                  {a.client?.name ?? "General"}
                </Badge>
                <span className="text-ink-700 flex-1">{a.message}</span>
                <span className="text-ink-400 text-xs shrink-0">{formatDateTime(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
