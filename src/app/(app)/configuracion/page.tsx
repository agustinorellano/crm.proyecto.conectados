import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Users, Plug } from "lucide-react";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  COMERCIAL: "Comercial",
  MARKETING: "Marketing",
  PROJECT_MANAGER: "Project Manager",
  DESARROLLO: "Desarrollo",
  LECTURA: "Solo lectura",
};

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions);
  const currentUser = await prisma.user.findUnique({ where: { id: session!.user.id } });
  const isAdmin = session?.user.role === "ADMIN";

  const users = isAdmin
    ? await prisma.user.findMany({ orderBy: { firstName: "asc" } })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Configuración</h1>
        <p className="text-ink-500 text-sm mt-0.5">Tu perfil, usuarios del equipo e integraciones.</p>
      </div>

      <div className="card p-5 max-w-xl">
        <h2 className="font-semibold text-ink-900 mb-4">Mi perfil</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-ink-50 pb-2">
            <dt className="text-ink-500">Nombre</dt>
            <dd className="text-ink-900 font-medium">
              {currentUser?.firstName} {currentUser?.lastName}
            </dd>
          </div>
          <div className="flex justify-between border-b border-ink-50 pb-2">
            <dt className="text-ink-500">Email</dt>
            <dd className="text-ink-900 font-medium">{currentUser?.email}</dd>
          </div>
          <div className="flex justify-between border-b border-ink-50 pb-2">
            <dt className="text-ink-500">Rol</dt>
            <dd>
              <Badge className="bg-brand-50 text-brand-700">
                {ROLE_LABELS[currentUser?.role || "LECTURA"]}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">Incorporación</dt>
            <dd className="text-ink-900 font-medium">{formatDate(currentUser?.hiredAt)}</dd>
          </div>
        </dl>
        <p className="text-xs text-ink-400 mt-4">
          Edición de perfil y cambio de contraseña disponibles en una próxima fase.
        </p>
      </div>

      {isAdmin && (
        <div className="card p-5">
          <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <Users size={16} /> Usuarios del equipo
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-ink-500">
                  <th className="py-2 pr-4 font-medium">Nombre</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Rol</th>
                  <th className="py-2 pr-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-ink-50 last:border-0">
                    <td className="py-2 pr-4 text-ink-800">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-2 pr-4 text-ink-500">{u.email}</td>
                    <td className="py-2 pr-4">
                      <Badge className="bg-ink-100 text-ink-600">{ROLE_LABELS[u.role]}</Badge>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge className={u.active ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500"}>
                        {u.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink-400 mt-4">
            Alta de nuevos usuarios disponible en una próxima fase — por ahora se gestiona vía el script
            de seed (ver README).
          </p>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <Plug size={16} /> Integraciones
        </h2>
        <ul className="space-y-2 text-sm text-ink-600">
          <li>Google Drive, Google Sheets y Google Calendar — prioridad 1, próxima fase.</li>
          <li>Gmail y Google Meet — prioridad 2.</li>
          <li>Google Analytics, Search Console, Instagram, LinkedIn, TikTok — prioridad 3.</li>
          <li>GitHub, Slack y otras herramientas — prioridad 4.</li>
        </ul>
      </div>
    </div>
  );
}
