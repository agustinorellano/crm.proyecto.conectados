import { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 p-16 text-center">
      <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
        <Icon size={22} />
      </div>
      <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
      <p className="text-sm text-ink-500 max-w-md">{description}</p>
      <span className="badge bg-amber-50 text-amber-700 mt-1">Próxima fase</span>
    </div>
  );
}
