"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { X } from "lucide-react";
import { navItems } from "./nav-config";
import { useUI } from "./ui-context";

export function MobileSidebar() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUI();
  const pathname = usePathname();

  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-ink-950/50" onClick={() => setMobileMenuOpen(false)} />
      <aside className="fixed inset-y-0 left-0 w-72 bg-ink-950 text-white flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-sm">
              C
            </div>
            <p className="text-sm font-semibold">Conectados</p>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-1">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                  active ? "bg-brand-600 text-white" : "text-ink-300 hover:bg-white/5"
                )}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
