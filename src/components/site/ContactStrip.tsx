import { Clock, MapPin } from "lucide-react";

export function ContactStrip({ address, hours, mapUrl }: { address: string; hours: string; mapUrl: string }) {
  return (
    <div className="bg-ink text-[12px] text-white/85">
      <div className="container-site flex h-9 items-center justify-between gap-4">
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 hover:text-white">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
          <span className="truncate">{address}</span>
        </a>
        <p className="hidden items-center gap-2 sm:flex">
          <Clock className="h-3.5 w-3.5 text-white/80" aria-hidden />
          {hours}
        </p>
      </div>
    </div>
  );
}
