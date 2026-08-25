import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { Paperclip, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArchivosPage() {
  const files = await prisma.file.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { id: true, name: true } }, project: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Archivos</h1>
        <p className="text-ink-500 text-sm mt-0.5">
          Repositorio documental vinculado a Google Drive. Sincronización automática de carpetas
          disponible en una próxima fase.
        </p>
      </div>

      {files.length === 0 ? (
        <div className="card p-16 text-center text-ink-400">
          <Paperclip className="mx-auto mb-3 text-ink-300" size={28} />
          Todavía no hay archivos vinculados. Usá &quot;+ Nuevo → Archivo&quot; para asociar un link de Drive.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-500">
                <th className="px-4 py-3 font-medium">Archivo</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Proyecto</th>
                <th className="px-4 py-3 font-medium">Cargado</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50">
                  <td className="px-4 py-3 font-medium text-ink-900">{f.name}</td>
                  <td className="px-4 py-3 text-ink-500">{f.client?.name || "—"}</td>
                  <td className="px-4 py-3 text-ink-500">{f.project?.name || "—"}</td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(f.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {f.driveUrl && (
                      <a
                        href={f.driveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                      >
                        Abrir <ExternalLink size={12} />
                      </a>
                    )}
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
