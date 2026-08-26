"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-config";
import { LogoMark } from "@/components/brand/logo-mark";
import clsx from "clsx";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-ink-950 text-white">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
        <LogoMark size={34} className="shrink-0" />
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Conectados</p>
          <p className="text-[11px] text-ink-400">CRM &amp; Operations</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-ink-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 text-[11px] text-ink-500">
        Conectados · Comunicación digital, marketing y desarrollo.
      </div>
    </aside>
  );
}
