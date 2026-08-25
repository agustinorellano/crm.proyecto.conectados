import clsx from "clsx";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={clsx("badge", className || "bg-ink-100 text-ink-600")}>{children}</span>;
}
