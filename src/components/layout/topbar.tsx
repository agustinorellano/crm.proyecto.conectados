"use client";

import { Search, Plus, Bell, Menu, LogOut } from "lucide-react";
import { useUI } from "./ui-context";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function Topbar() {
  const { setQuickCreateOpen, setCommandPaletteOpen, setMobileMenuOpen } = useUI();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/90 backdrop-blur px-4 lg:px-6">
      <button
        className="lg:hidden btn-ghost !px-2"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex flex-1 max-w-md items-center gap-2 rounded-full border border-ink-200 bg-ink-100/70 px-4 py-2 text-sm text-ink-400 transition-colors hover:bg-ink-100"
      >
        <Search size={16} />
        <span className="flex-1 text-left">Buscar clientes, proyectos, tareas…</span>
        <kbd className="hidden sm:inline rounded-full border border-ink-300 bg-white px-2 py-0.5 text-[10px] font-medium text-ink-500">
          Ctrl K
        </kbd>
      </button>

      <div className="flex-1" />

      <button onClick={() => setQuickCreateOpen(true)} className="btn-primary">
        <Plus size={16} />
        <span className="hidden sm:inline">Nuevo</span>
      </button>

      <button className="btn-ghost !px-2" aria-label="Notificaciones">
        <Bell size={18} />
      </button>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="h-9 w-9 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center"
        >
          {initials}
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-ink-200 bg-white p-1.5 shadow-lg">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-ink-900">{session?.user?.name}</p>
                <p className="text-xs text-ink-500">{session?.user?.email}</p>
              </div>
              <div className="h-px bg-ink-100 my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
