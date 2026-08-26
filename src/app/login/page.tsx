"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogoBadge } from "@/components/brand/logo-mark";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-ink-950">
      {/* Panel izquierdo — identidad */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-brand-950 via-ink-950 to-brand-900 text-white">
        <div className="flex items-center gap-2">
          <LogoBadge size={36} />
          <span className="text-lg font-semibold tracking-tight">Conectados</span>
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight mb-4">
            El centro de operaciones
            <br /> de nuestra empresa.
          </h1>
          <p className="text-ink-300 max-w-md">
            Clientes, proyectos, tareas, contenido y métricas en un solo lugar.
            CRM &amp; Operations — uso exclusivo del equipo de Conectados.
          </p>
        </div>
        <p className="text-xs text-ink-400">
          © {new Date().getFullYear()} Conectados. Aplicación interna y privada.
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center bg-ink-50 p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <LogoBadge size={36} />
            <span className="text-lg font-semibold tracking-tight text-ink-900">
              Conectados
            </span>
          </div>

          <div className="card p-8">
            <h2 className="text-xl font-semibold text-ink-900">Iniciar sesión</h2>
            <p className="text-sm text-ink-500 mt-1 mb-6">
              Ingresá con tu cuenta de Conectados.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@conectados.com"
                />
              </div>
              <div>
                <label className="label" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-ink-400 mt-6">
            Acceso exclusivo para el equipo de Conectados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
