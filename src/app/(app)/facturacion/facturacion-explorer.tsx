"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Receipt, Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDate,
  invoiceStatusColors,
  invoiceStatusLabels,
  invoiceStatuses,
} from "@/lib/labels";
import { updateInvoiceStatus } from "@/lib/actions/invoices";
import { useUI } from "@/components/layout/ui-context";
import { InvoiceStatus } from "@prisma/client";

interface InvoiceRow {
  id: string;
  number: string | null;
  description: string | null;
  amount: number;
  issueDate: Date;
  dueDate: Date | null;
  status: string;
  client: { id: string; name: string };
}

const STATUS_FILTERS = ["TODOS", ...invoiceStatuses];

export function FacturacionExplorer({ invoices }: { invoices: InvoiceRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("TODOS");
  const { setQuickCreateOpen } = useUI();
  const router = useRouter();

  const now = new Date();

  const withComputedStatus = useMemo(
    () =>
      invoices.map((inv) => {
        const overdue =
          inv.status !== "PAGADA" &&
          inv.status !== "CANCELADA" &&
          inv.dueDate &&
          new Date(inv.dueDate) < now;
        return { ...inv, effectiveStatus: overdue ? "VENCIDA" : inv.status };
      }),
    [invoices] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const filtered = withComputedStatus.filter((inv) => {
    const matchesQuery =
      inv.client.name.toLowerCase().includes(query.toLowerCase()) ||
      (inv.number || "").toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "TODOS" || inv.effectiveStatus === status;
    return matchesQuery && matchesStatus;
  });

  const totals = useMemo(() => {
    const facturado = invoices
      .filter((i) => i.status !== "CANCELADA")
      .reduce((acc, i) => acc + i.amount, 0);
    const cobrado = invoices.filter((i) => i.status === "PAGADA").reduce((acc, i) => acc + i.amount, 0);
    const pendiente = invoices
      .filter((i) => i.status === "ENVIADA" || i.status === "BORRADOR")
      .reduce((acc, i) => acc + i.amount, 0);
    const vencido = withComputedStatus
      .filter((i) => i.effectiveStatus === "VENCIDA")
      .reduce((acc, i) => acc + i.amount, 0);
    return { facturado, cobrado, pendiente, vencido };
  }, [invoices, withComputedStatus]);

  async function handleStatusChange(id: string, newStatus: string) {
    await updateInvoiceStatus(id, newStatus as InvoiceStatus);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Facturación</h1>
          <p className="text-ink-500 text-sm mt-0.5">{invoices.length} facturas registradas</p>
        </div>
        <button onClick={() => setQuickCreateOpen(true)} className="btn-primary">
          + Nueva factura
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Receipt} label="Facturado total" value={formatCurrency(totals.facturado)} />
        <Stat icon={CheckCircle2} label="Cobrado" value={formatCurrency(totals.cobrado)} tone="emerald" />
        <Stat icon={Wallet} label="Pendiente de cobro" value={formatCurrency(totals.pendiente)} tone="blue" />
        <Stat icon={AlertTriangle} label="Vencido" value={formatCurrency(totals.vencido)} tone="red" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente o número…"
            className="input pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input sm:w-56">
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "TODOS" ? "Todos los estados" : invoiceStatusLabels[s]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-ink-400">No se encontraron facturas.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-500">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Emisión</th>
                <th className="px-4 py-3 font-medium">Vencimiento</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <Link href={`/clientes/${inv.client.id}`} className="font-medium text-ink-900 hover:text-brand-600">
                      {inv.client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{inv.number || "—"}</td>
                  <td className="px-4 py-3 text-ink-500 max-w-xs truncate">{inv.description || "—"}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{formatCurrency(inv.amount)}</td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(inv.issueDate)}</td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={inv.status}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                      className={`badge border-0 pr-6 cursor-pointer ${invoiceStatusColors[inv.effectiveStatus]}`}
                    >
                      {invoiceStatuses.map((s) => (
                        <option key={s} value={s}>
                          {invoiceStatusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Receipt;
  label: string;
  value: string;
  tone?: "emerald" | "blue" | "red";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-600"
      : tone === "blue"
        ? "text-blue-600"
        : tone === "red"
          ? "text-red-600"
          : "text-brand-600";
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-xs text-ink-500">
        <Icon size={14} className={toneClass} /> {label}
      </div>
      <p className="text-xl font-semibold text-ink-900 mt-1">{value}</p>
    </div>
  );
}
