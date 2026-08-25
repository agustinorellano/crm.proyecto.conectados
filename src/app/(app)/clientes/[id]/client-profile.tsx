"use client";

import { useState } from "react";
import {
  Building2,
  Globe,
  AtSign,
  Link2,
  Phone,
  Mail,
  MapPin,
  FolderKanban,
  CheckSquare,
  CalendarClock,
  FileText,
  BarChart3,
  Paperclip,
  StickyNote,
  Receipt,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  clientStatusColors,
  clientStatusLabels,
  contentStatusLabels,
  formatCurrency,
  formatDate,
  formatDateTime,
  priorityColors,
  priorityLabels,
  projectStatusLabels,
  proposalStatusLabels,
  taskStatusLabels,
} from "@/lib/labels";
import { updateClientStatus } from "@/lib/actions/clients";
import { createNote } from "@/lib/actions/notes";
import { ClientStatus } from "@prisma/client";

const TABS = [
  { key: "resumen", label: "Resumen" },
  { key: "actividad", label: "Actividad" },
  { key: "proyectos", label: "Proyectos" },
  { key: "tareas", label: "Tareas" },
  { key: "calendario", label: "Calendario" },
  { key: "contenido", label: "Contenido" },
  { key: "metricas", label: "Métricas" },
  { key: "archivos", label: "Archivos" },
  { key: "notas", label: "Notas" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ClientProfile({ client }: { client: any }) {
  const [tab, setTab] = useState<TabKey>("resumen");

  const activeProjects = client.projects.filter((p: any) => p.status !== "COMPLETADO");
  const openTasks = client.tasks.filter((t: any) => t.status !== "COMPLETADO");
  const nextMeeting = client.meetings.find((m: any) => new Date(m.startsAt) >= new Date());
  const lastActivity = client.activities[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-lg shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-ink-900">{client.name}</h1>
              <p className="text-sm text-ink-500">{client.industry || "Sin industria"}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusSelect clientId={client.id} status={client.status} />
                {client.owner && (
                  <span className="text-xs text-ink-400">
                    Responsable: {client.owner.firstName} {client.owner.lastName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-ink-500">
            {client.website && <IconLink href={client.website} icon={Globe} label="Web" />}
            {client.instagram && <IconLink href={client.instagram} icon={AtSign} label="Instagram" />}
            {client.linkedin && <IconLink href={client.linkedin} icon={Link2} label="LinkedIn" />}
            {client.driveFolderUrl && (
              <IconLink href={client.driveFolderUrl} icon={FileText} label="Drive" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-ink-100">
          <MiniStat label="Proyectos activos" value={activeProjects.length} />
          <MiniStat label="Tareas abiertas" value={openTasks.length} />
          <MiniStat
            label="Próxima reunión"
            value={nextMeeting ? formatDateTime(nextMeeting.startsAt) : "—"}
          />
          <MiniStat
            label="Último contacto"
            value={lastActivity ? formatDate(lastActivity.createdAt) : "—"}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex overflow-x-auto border-b border-ink-100 px-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                tab === t.key
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-ink-500 hover:text-ink-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "resumen" && <ResumenTab client={client} />}
          {tab === "actividad" && <ActividadTab activities={client.activities} />}
          {tab === "proyectos" && <ProyectosTab projects={client.projects} />}
          {tab === "tareas" && <TareasTab tasks={client.tasks} />}
          {tab === "calendario" && <CalendarioTab meetings={client.meetings} />}
          {tab === "contenido" && <ContenidoTab items={client.contentItems} />}
          {tab === "metricas" && <MetricasTab values={client.metricValues} />}
          {tab === "archivos" && <ArchivosTab files={client.files} />}
          {tab === "notas" && <NotasTab clientId={client.id} notes={client.notes} />}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-ink-500">{label}</p>
      <p className="text-base font-semibold text-ink-900 mt-0.5">{value}</p>
    </div>
  );
}

function IconLink({ href, icon: Icon, label }: { href: string; icon: typeof Globe; label: string }) {
  const url = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1 hover:text-brand-600"
    >
      <Icon size={14} /> {label}
    </a>
  );
}

function StatusSelect({ clientId, status }: { clientId: string; status: string }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => updateClientStatus(clientId, e.target.value as ClientStatus)}
      className={`badge border-0 pr-6 ${clientStatusColors[status]}`}
    >
      {Object.entries(clientStatusLabels).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

function ResumenTab({ client }: { client: any }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-semibold text-ink-700 mb-3">Información comercial</h3>
        <dl className="space-y-2 text-sm">
          <Row label="CUIT" value={client.taxId} />
          <Row label="Teléfono" value={client.phone} icon={Phone} />
          <Row label="Email" value={client.email} icon={Mail} />
          <Row label="Dirección" value={client.address} icon={MapPin} />
          <Row label="Valor mensual" value={formatCurrency(client.monthlyValue)} />
          <Row label="Valor anual" value={formatCurrency(client.annualValue)} />
          <Row label="Alta" value={formatDate(client.createdAt)} />
        </dl>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-ink-700 mb-3">Servicios contratados</h3>
        {client.services.length === 0 ? (
          <EmptyHint text="Todavía no hay servicios asociados." />
        ) : (
          <ul className="space-y-2">
            {client.services.map((s: any) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm">
                <span className="text-ink-800">{s.service.name}</span>
                {s.monthlyFee != null && (
                  <span className="text-ink-500">{formatCurrency(s.monthlyFee)}/mes</span>
                )}
              </li>
            ))}
          </ul>
        )}

        <h3 className="text-sm font-semibold text-ink-700 mb-3 mt-6">Contactos</h3>
        {client.contacts.length === 0 ? (
          <EmptyHint text="Todavía no hay contactos cargados." />
        ) : (
          <ul className="space-y-2">
            {client.contacts.map((c: any) => (
              <li key={c.id} className="rounded-lg bg-ink-50 px-3 py-2 text-sm">
                <p className="font-medium text-ink-800">
                  {c.firstName} {c.lastName} {c.isPrimary && <Badge className="bg-brand-50 text-brand-700 ml-1">Principal</Badge>}
                </p>
                <p className="text-ink-500 text-xs">
                  {[c.role, c.email, c.phone].filter(Boolean).join(" · ") || "Sin datos adicionales"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="md:col-span-2">
        <h3 className="text-sm font-semibold text-ink-700 mb-3">Propuestas</h3>
        {client.proposals.length === 0 ? (
          <EmptyHint text="Sin propuestas registradas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-ink-500 border-b border-ink-100">
                  <th className="py-2 pr-4 font-medium">Descripción</th>
                  <th className="py-2 pr-4 font-medium">Precio</th>
                  <th className="py-2 pr-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {client.proposals.map((p: any) => (
                  <tr key={p.id} className="border-b border-ink-50 last:border-0">
                    <td className="py-2 pr-4 text-ink-800">{p.description}</td>
                    <td className="py-2 pr-4 text-ink-600">{formatCurrency(p.price)}</td>
                    <td className="py-2 pr-4">
                      <Badge className="bg-ink-100 text-ink-600">
                        {proposalStatusLabels[p.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: typeof Phone;
}) {
  return (
    <div className="flex items-center justify-between border-b border-ink-50 pb-2">
      <dt className="text-ink-500 flex items-center gap-1.5">
        {Icon && <Icon size={13} />} {label}
      </dt>
      <dd className="text-ink-800 font-medium">{value || "—"}</dd>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-ink-400 bg-ink-50 rounded-lg px-3 py-4 text-center">{text}</p>;
}

function ActividadTab({ activities }: { activities: any[] }) {
  if (activities.length === 0) return <EmptyHint text="Todavía no hay actividad para este cliente." />;
  return (
    <ol className="relative border-l border-ink-200 ml-2 space-y-5">
      {activities.map((a) => (
        <li key={a.id} className="ml-4">
          <div className="absolute -ml-[23px] mt-1.5 h-2.5 w-2.5 rounded-full bg-brand-500" />
          <p className="text-sm text-ink-800">{a.message}</p>
          <p className="text-xs text-ink-400 mt-0.5">
            {formatDateTime(a.createdAt)}
            {a.user ? ` · ${a.user.firstName} ${a.user.lastName}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}

function ProyectosTab({ projects }: { projects: any[] }) {
  if (projects.length === 0) return <EmptyHint text="Este cliente todavía no tiene proyectos." />;
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {projects.map((p) => (
        <a
          key={p.id}
          href={`/proyectos/${p.id}`}
          className="rounded-xl border border-ink-200 p-4 hover:border-brand-300 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <p className="font-medium text-ink-900 flex items-center gap-2">
              <FolderKanban size={15} className="text-brand-500" /> {p.name}
            </p>
            <Badge className={priorityColors[p.priority]}>{priorityLabels[p.priority]}</Badge>
          </div>
          <Badge className="bg-ink-100 text-ink-600 w-fit">{projectStatusLabels[p.status]}</Badge>
          <p className="text-xs text-ink-400">Entrega: {formatDate(p.dueDate)}</p>
        </a>
      ))}
    </div>
  );
}

function TareasTab({ tasks }: { tasks: any[] }) {
  if (tasks.length === 0) return <EmptyHint text="Este cliente todavía no tiene tareas." />;
  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li
          key={t.id}
          className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5 text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckSquare size={15} className="text-ink-400 shrink-0" />
            <span className="truncate text-ink-800">{t.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={priorityColors[t.priority]}>{priorityLabels[t.priority]}</Badge>
            <Badge className="bg-ink-100 text-ink-600">{taskStatusLabels[t.status]}</Badge>
            <span className="text-ink-400 text-xs">{formatDate(t.dueDate)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CalendarioTab({ meetings }: { meetings: any[] }) {
  if (meetings.length === 0) return <EmptyHint text="No hay reuniones ni eventos programados." />;
  return (
    <ul className="space-y-2">
      {meetings.map((m) => (
        <li key={m.id} className="flex items-center gap-3 rounded-lg border border-ink-100 px-3 py-2.5 text-sm">
          <CalendarClock size={15} className="text-brand-500 shrink-0" />
          <div className="flex-1">
            <p className="text-ink-800 font-medium">{m.title}</p>
            <p className="text-ink-400 text-xs">{formatDateTime(m.startsAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ContenidoTab({ items }: { items: any[] }) {
  if (items.length === 0) return <EmptyHint text="Sin contenido planificado todavía." />;
  return (
    <ul className="space-y-2">
      {items.map((c) => (
        <li key={c.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={15} className="text-ink-400 shrink-0" />
            <span className="truncate text-ink-800">{c.title}</span>
            <span className="text-ink-400 text-xs">· {c.platform}</span>
          </div>
          <Badge className="bg-ink-100 text-ink-600">{contentStatusLabels[c.status]}</Badge>
        </li>
      ))}
    </ul>
  );
}

function MetricasTab({ values }: { values: any[] }) {
  if (values.length === 0)
    return (
      <EmptyHint text="Todavía no hay métricas cargadas. Se podrán registrar manualmente por plataforma (Instagram, Web, SEO, Ads)." />
    );
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-ink-500 border-b border-ink-100">
            <th className="py-2 pr-4 font-medium">Plataforma</th>
            <th className="py-2 pr-4 font-medium">Métrica</th>
            <th className="py-2 pr-4 font-medium">Valor</th>
            <th className="py-2 pr-4 font-medium">Período</th>
          </tr>
        </thead>
        <tbody>
          {values.map((v) => (
            <tr key={v.id} className="border-b border-ink-50 last:border-0">
              <td className="py-2 pr-4 text-ink-800 capitalize">{v.platform}</td>
              <td className="py-2 pr-4 text-ink-600 capitalize">{v.metric}</td>
              <td className="py-2 pr-4 text-ink-900 font-medium">{v.value}</td>
              <td className="py-2 pr-4 text-ink-400">{formatDate(v.periodEnd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArchivosTab({ files }: { files: any[] }) {
  if (files.length === 0) return <EmptyHint text="Todavía no hay archivos vinculados desde Google Drive." />;
  return (
    <ul className="space-y-2">
      {files.map((f) => (
        <li key={f.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Paperclip size={15} className="text-ink-400 shrink-0" />
            <span className="truncate text-ink-800">{f.name}</span>
          </div>
          {f.driveUrl && (
            <a
              href={f.driveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-brand-600 text-xs shrink-0"
            >
              Abrir <ExternalLink size={12} />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

function NotasTab({ clientId, notes }: { clientId: string; notes: any[] }) {
  return (
    <div className="space-y-4">
      <form action={createNote} className="flex gap-2">
        <input type="hidden" name="clientId" value={clientId} />
        <input name="body" placeholder="Escribir una nota interna…" className="input flex-1" required />
        <button type="submit" className="btn-primary shrink-0">
          <Plus size={15} /> Agregar
        </button>
      </form>

      {notes.length === 0 ? (
        <EmptyHint text="Sin notas internas todavía." />
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg bg-ink-50 px-3 py-2.5 text-sm">
              <p className="text-ink-800 flex items-start gap-2">
                <StickyNote size={14} className="text-ink-400 mt-0.5 shrink-0" /> {n.body}
              </p>
              <p className="text-xs text-ink-400 mt-1 ml-6">
                {n.author.firstName} {n.author.lastName} · {formatDateTime(n.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-ink-400 flex items-center gap-1">
        <Receipt size={12} /> Tip: usá el botón &quot;+ Nuevo&quot; para cargar propuestas, archivos y contenido de este cliente.
      </p>
    </div>
  );
}
