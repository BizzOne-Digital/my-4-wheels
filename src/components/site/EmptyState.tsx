import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-[4px] border border-dashed border-neutral-300 bg-mist px-6 py-14 text-center">
      <Icon className="mx-auto h-10 w-10 text-brand" strokeWidth={1.4} aria-hidden />
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      {text && <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
