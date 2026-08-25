"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, FolderKanban, CheckSquare } from "lucide-react";
import { useUI } from "./ui-context";

interface Results {
  clients: { id: string; name: string; status: string }[];
  projects: { id: string; name: string; client: { name: string } }[];
  tasks: { id: string; title: string; status: string }[];
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUI();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>({ clients: [], projects: [], tasks: [] });
  const router = useRouter();

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery("");
      setResults({ clients: [], projects: [], tasks: [] });
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const handle = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setResults)
        .catch(() => {});
    }, 200);
    return () => clearTimeout(handle);
  }, [query]);

  if (!commandPaletteOpen) return null;

  const hasResults = results.clients.length || results.projects.length || results.tasks.length;

  function go(path: string) {
    setCommandPaletteOpen(false);
    router.push(path);
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-ink-950/40" onClick={() => setCommandPaletteOpen(false)} />
      <div className="fixed left-1/2 top-24 -translate-x-1/2 w-full max-w-lg rounded-2xl bg-white shadow-xl border border-ink-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-ink-100">
          <Search size={17} className="text-ink-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clientes, proyectos, tareas…"
            className="flex-1 outline-none text-sm"
          />
          <kbd className="rounded border border-ink-200 px-1.5 py-0.5 text-[10px] text-ink-400">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim().length < 2 && (
            <p className="px-3 py-6 text-center text-sm text-ink-400">
              Escribí al menos 2 caracteres para buscar.
            </p>
          )}

          {query.trim().length >= 2 && !hasResults && (
            <p className="px-3 py-6 text-center text-sm text-ink-400">Sin resultados.</p>
          )}

          {results.clients.length > 0 && (
            <ResultGroup label="Clientes">
              {results.clients.map((c) => (
                <ResultRow
                  key={c.id}
                  icon={Building2}
                  primary={c.name}
                  secondary={c.status.replaceAll("_", " ")}
                  onClick={() => go(`/clientes/${c.id}`)}
                />
              ))}
            </ResultGroup>
          )}

          {results.projects.length > 0 && (
            <ResultGroup label="Proyectos">
              {results.projects.map((p) => (
                <ResultRow
                  key={p.id}
                  icon={FolderKanban}
                  primary={p.name}
                  secondary={p.client.name}
                  onClick={() => go(`/proyectos/${p.id}`)}
                />
              ))}
            </ResultGroup>
          )}

          {results.tasks.length > 0 && (
            <ResultGroup label="Tareas">
              {results.tasks.map((t) => (
                <ResultRow
                  key={t.id}
                  icon={CheckSquare}
                  primary={t.title}
                  secondary={t.status.replaceAll("_", " ")}
                  onClick={() => go(`/tareas`)}
                />
              ))}
            </ResultGroup>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      {children}
    </div>
  );
}

function ResultRow({
  icon: Icon,
  primary,
  secondary,
  onClick,
}: {
  icon: typeof Building2;
  primary: string;
  secondary: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-ink-50"
    >
      <Icon size={15} className="text-ink-400 shrink-0" />
      <span className="flex-1 truncate text-sm text-ink-800">{primary}</span>
      <span className="text-xs text-ink-400 shrink-0">{secondary}</span>
    </button>
  );
}
