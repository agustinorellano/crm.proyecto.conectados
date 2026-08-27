export const clientStatusLabels: Record<string, string> = {
  PROSPECTO: "Prospecto",
  CONTACTADO: "Contactado",
  REUNION: "Reunión",
  PROPUESTA_ENVIADA: "Propuesta enviada",
  NEGOCIACION: "Negociación",
  CLIENTE_NUEVO: "Cliente nuevo",
  ACTIVO: "Activo",
  PAUSADO: "Pausado",
  INACTIVO: "Inactivo",
  PERDIDO: "Perdido",
};

export const clientStatusColors: Record<string, string> = {
  PROSPECTO: "bg-ink-100 text-ink-600",
  CONTACTADO: "bg-blue-50 text-blue-700",
  REUNION: "bg-blue-50 text-blue-700",
  PROPUESTA_ENVIADA: "bg-amber-50 text-amber-700",
  NEGOCIACION: "bg-amber-50 text-amber-700",
  CLIENTE_NUEVO: "bg-emerald-50 text-emerald-700",
  ACTIVO: "bg-emerald-50 text-emerald-700",
  PAUSADO: "bg-orange-50 text-orange-700",
  INACTIVO: "bg-ink-100 text-ink-500",
  PERDIDO: "bg-red-50 text-red-700",
};

export const dealStageLabels: Record<string, string> = {
  LEAD: "Lead",
  CONTACTADO: "Contactado",
  REUNION_AGENDADA: "Reunión agendada",
  REUNION_REALIZADA: "Reunión realizada",
  PROPUESTA_ENVIADA: "Propuesta enviada",
  NEGOCIACION: "Negociación",
  GANADO: "Ganado",
  PERDIDO: "Perdido",
};

export const dealStages = [
  "LEAD",
  "CONTACTADO",
  "REUNION_AGENDADA",
  "REUNION_REALIZADA",
  "PROPUESTA_ENVIADA",
  "NEGOCIACION",
  "GANADO",
  "PERDIDO",
] as const;

export const projectStatusLabels: Record<string, string> = {
  BACKLOG: "Backlog",
  POR_HACER: "Por hacer",
  EN_PROGRESO: "En progreso",
  EN_REVISION: "En revisión",
  BLOQUEADO: "Bloqueado",
  COMPLETADO: "Completado",
};

export const projectStatuses = [
  "BACKLOG",
  "POR_HACER",
  "EN_PROGRESO",
  "EN_REVISION",
  "BLOQUEADO",
  "COMPLETADO",
] as const;

export const taskStatusLabels = projectStatusLabels;
export const taskStatuses = projectStatuses;

export const priorityLabels: Record<string, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export const priorityColors: Record<string, string> = {
  BAJA: "bg-ink-100 text-ink-600",
  MEDIA: "bg-blue-50 text-blue-700",
  ALTA: "bg-amber-50 text-amber-700",
  URGENTE: "bg-red-50 text-red-700",
};

export const contentStatusLabels: Record<string, string> = {
  IDEA: "Idea",
  BRIEF: "Brief",
  PRODUCCION: "Producción",
  DISENO: "Diseño",
  REVISION: "Revisión",
  APROBADO: "Aprobado",
  PROGRAMADO: "Programado",
  PUBLICADO: "Publicado",
};

export const proposalStatusLabels: Record<string, string> = {
  BORRADOR: "Borrador",
  ENVIADA: "Enviada",
  VISTA: "Vista",
  NEGOCIACION: "Negociación",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
};

export const invoiceStatusLabels: Record<string, string> = {
  BORRADOR: "Borrador",
  ENVIADA: "Enviada",
  PAGADA: "Pagada",
  VENCIDA: "Vencida",
  CANCELADA: "Cancelada",
};

export const invoiceStatuses = ["BORRADOR", "ENVIADA", "PAGADA", "VENCIDA", "CANCELADA"] as const;

export const invoiceStatusColors: Record<string, string> = {
  BORRADOR: "bg-ink-100 text-ink-600",
  ENVIADA: "bg-blue-50 text-blue-700",
  PAGADA: "bg-emerald-50 text-emerald-700",
  VENCIDA: "bg-red-50 text-red-700",
  CANCELADA: "bg-ink-100 text-ink-500",
};

export function formatCurrency(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(date)
  );
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
