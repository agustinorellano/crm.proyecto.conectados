"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { X, Building2, Contact2, GitBranch, FolderKanban, CheckSquare, CalendarPlus, StickyNote, FileText, Receipt, Banknote, Paperclip } from "lucide-react";
import { useUI } from "./ui-context";
import { createClient } from "@/lib/actions/clients";
import { createContact } from "@/lib/actions/contacts";
import { createDeal } from "@/lib/actions/deals";
import { createProject } from "@/lib/actions/projects";
import { createTask } from "@/lib/actions/tasks";
import { createMeeting } from "@/lib/actions/meetings";
import { createNote } from "@/lib/actions/notes";
import { createContentItem } from "@/lib/actions/content";
import { createProposal } from "@/lib/actions/proposals";
import { createInvoice } from "@/lib/actions/invoices";
import { createFile } from "@/lib/actions/files";

type EntityKey =
  | "cliente"
  | "contacto"
  | "lead"
  | "proyecto"
  | "tarea"
  | "reunion"
  | "contenido"
  | "nota"
  | "presupuesto"
  | "factura"
  | "archivo";

const ENTITIES: { key: EntityKey; label: string; icon: typeof Building2; needsClient: boolean }[] = [
  { key: "cliente", label: "Cliente", icon: Building2, needsClient: false },
  { key: "contacto", label: "Contacto", icon: Contact2, needsClient: true },
  { key: "lead", label: "Lead / Oportunidad", icon: GitBranch, needsClient: true },
  { key: "proyecto", label: "Proyecto", icon: FolderKanban, needsClient: true },
  { key: "tarea", label: "Tarea", icon: CheckSquare, needsClient: false },
  { key: "reunion", label: "Reunión", icon: CalendarPlus, needsClient: false },
  { key: "contenido", label: "Contenido", icon: FileText, needsClient: true },
  { key: "nota", label: "Nota", icon: StickyNote, needsClient: true },
  { key: "presupuesto", label: "Presupuesto", icon: Receipt, needsClient: true },
  { key: "factura", label: "Factura", icon: Banknote, needsClient: true },
  { key: "archivo", label: "Archivo", icon: Paperclip, needsClient: true },
];

export function QuickCreate() {
  const { quickCreateOpen, setQuickCreateOpen } = useUI();
  const [selected, setSelected] = useState<EntityKey | null>(null);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (quickCreateOpen && clients.length === 0) {
      fetch("/api/clients")
        .then((r) => r.json())
        .then(setClients)
        .catch(() => {});
    }
  }, [quickCreateOpen, clients.length]);

  function close() {
    setQuickCreateOpen(false);
    setSelected(null);
  }

  async function handleSubmit(action: (fd: FormData) => Promise<void>, fd: FormData) {
    setLoading(true);
    try {
      await action(fd);
      router.refresh();
      close();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  if (!quickCreateOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-ink-950/40" onClick={close} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-ink-200">
          <h2 className="font-semibold text-ink-900">
            {selected ? "Nuevo · " + ENTITIES.find((e) => e.key === selected)?.label : "¿Qué querés crear?"}
          </h2>
          <button onClick={close} className="btn-ghost !px-2">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!selected && (
            <div className="grid grid-cols-2 gap-3">
              {ENTITIES.map((e) => (
                <button
                  key={e.key}
                  onClick={() => setSelected(e.key)}
                  className="flex flex-col items-start gap-2 rounded-xl border border-ink-200 p-4 text-left hover:border-brand-400 hover:bg-brand-50"
                >
                  <e.icon size={18} className="text-brand-600" />
                  <span className="text-sm font-medium text-ink-800">{e.label}</span>
                </button>
              ))}
            </div>
          )}

          {selected === "cliente" && (
            <form action={createClient} className="space-y-3">
              <Field label="Nombre de empresa *" name="name" required />
              <Field label="Industria" name="industry" />
              <Field label="Email" name="email" type="email" />
              <Field label="Teléfono" name="phone" />
              <NavigatingSubmitBar onBack={() => setSelected(null)} />
            </form>
          )}

          {selected === "contacto" && (
            <form action={(fd) => handleSubmit(createContact, fd)} className="space-y-3">
              <ClientSelect clients={clients} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre *" name="firstName" required />
                <Field label="Apellido" name="lastName" />
              </div>
              <Field label="Cargo" name="role" />
              <Field label="Email" name="email" type="email" />
              <Field label="Teléfono" name="phone" />
              <SubmitBar loading={loading} onBack={() => setSelected(null)} />
            </form>
          )}

          {selected === "lead" && (
            <form action={createDeal} className="space-y-3">
              <ClientSelect clients={clients} />
              <Field label="Título de la oportunidad *" name="title" required placeholder="Ej: Rediseño web" />
              <Field label="Valor potencial (ARS)" name="value" type="number" />
              <Field label="Próxima acción" name="nextAction" placeholder="Ej: Enviar propuesta" />
              <NavigatingSubmitBar onBack={() => setSelected(null)} />
            </form>
          )}

          {selected === "proyecto" && (
            <form action={createProject} className="space-y-3">
              <ClientSelect clients={clients} />
              <Field label="Nombre del proyecto *" name="name" required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Inicio" name="startDate" type="date" />
                <Field label="Entrega" name="dueDate" type="date" />
              </div>
              <NavigatingSubmitBar onBack={() => setSelected(null)} />
            </form>
          )}

          {selected === "tarea" && (
            <form action={(fd) => handleSubmit(createTask, fd)} className="space-y-3">
              <Field label="Título *" name="title" required />
              <ClientSelect clients={clients} optional />
              <Field label="Vencimiento" name="dueDate" type="date" />
              <SubmitBar loading={loading} onBack={() => setSelected(null)} />
            </form>
          )}

          {selected === "reunion" && (
            <form action={(fd) => handleSubmit(createMeeting, fd)} className="space-y-3">
              <Field label="Título *" name="title" required placeholder="Ej: Reunión mensual" />
              <ClientSelect clients={clients} optional />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fecha *" name="date" type="date" required />
                <Field label="Hora" name="time" type="time" />
              </div>
              <SubmitBar loading={loading} onBack={() => setSelected(null)} />
            </form>
          )}

          {selected === "contenido" && (
            <form action={(fd) => handleSubmit(createContentItem, fd)} className="space-y-3">
              <ClientSelect clients={clients} />
              <Field label="Título de la pieza *" name="title" required />
              <Field label="Fecha de publicación" name="scheduledAt" type="date" />
              <SubmitBar loading={loading} onBack={() => setSelected(null)} />
            </form>
          )}

          {selected === "nota" && (
            <form action={(fd) => handleSubmit(createNote, fd)} className="space-y-3">
              <ClientSelect clients={clients} />
              <TextAreaField label="Nota *" name="body" required />
              <SubmitBar loading={loading} onBack={() => setSelected(null)} />
            </form>
          )}

          {selected === "presupuesto" && (
            <form action={(fd) => handleSubmit(createProposal, fd)} className="space-y-3">
              <ClientSelect clients={clients} />
              <TextAreaField label="Descripción *" name="description" required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Precio (ARS)" name="price" type="number" />
                <Field label="Frecuencia" name="frequency" placeholder="Mensual" />
              </div>
              <SubmitBar loading={loading} onBack={() => setSelected(null)} />
            </form>
          )}

          {selected === "factura" && (
            <form action={(fd) => handleSubmit(createInvoice, fd)} className="space-y-3">
              <ClientSelect clients={clients} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Número" name="number" placeholder="0001-00001234" />
                <Field label="Monto (ARS) *" name="amount" type="number" required />
              </div>
              <Field label="Descripción" name="description" placeholder="Servicio de..." />
              <Field label="Vencimiento" name="dueDate" type="date" />
              <SubmitBar loading={loading} onBack={() => setSelected(null)} />
            </form>
          )}

          {selected === "archivo" && (
            <form action={(fd) => handleSubmit(createFile, fd)} className="space-y-3">
              <ClientSelect clients={clients} />
              <Field label="Nombre del archivo *" name="name" required />
              <Field label="Link de Google Drive" name="driveUrl" placeholder="https://drive.google.com/..." />
              <SubmitBar loading={loading} onBack={() => setSelected(null)} />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input name={name} type={type} required={required} placeholder={placeholder} className="input" />
    </div>
  );
}

function TextAreaField({ label, name, required }: { label: string; name: string; required?: boolean }) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea name={name} required={required} rows={4} className="input" />
    </div>
  );
}

function ClientSelect({
  clients,
  optional,
}: {
  clients: { id: string; name: string }[];
  optional?: boolean;
}) {
  return (
    <div>
      <label className="label">Cliente {optional ? "" : "*"}</label>
      <select name="clientId" required={!optional} className="input" defaultValue="">
        <option value="" disabled>
          Seleccionar cliente…
        </option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function SubmitBar({ loading, onBack }: { loading: boolean; onBack: () => void }) {
  return (
    <div className="flex gap-2 pt-2">
      <button type="button" onClick={onBack} className="btn-secondary flex-1">
        Atrás
      </button>
      <button type="submit" disabled={loading} className="btn-primary flex-1">
        {loading ? "Guardando…" : "Guardar"}
      </button>
    </div>
  );
}

// Para acciones que redirigen (crean y navegan a la ficha creada): usamos
// useFormStatus en vez de un wrapper con try/catch, porque el redirect()
// del server action es un error especial que Next intercepta solo cuando
// el form se envía de forma nativa.
function NavigatingSubmitBar({ onBack }: { onBack: () => void }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex gap-2 pt-2">
      <button type="button" onClick={onBack} disabled={pending} className="btn-secondary flex-1">
        Atrás
      </button>
      <button type="submit" disabled={pending} className="btn-primary flex-1">
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </div>
  );
}
