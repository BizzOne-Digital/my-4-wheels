import { Clock, MapPin } from "lucide-react";
import { SocialLinks } from "./SocialLinks";

export function ContactStrip({ address, hours, mapUrl, social }: { address: string; hours: string; mapUrl: string; social?: Record<string, string> }) {
  return (
    <div className="bg-ink text-[12px] text-white/85">
      <div className="container-site flex h-9 items-center justify-between gap-4">
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 hover:text-white">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
          <span className="truncate">{address}</span>
        </a>
        <div className="flex items-center gap-5">
          <p className="hidden items-center gap-2 sm:flex">
            <Clock className="h-3.5 w-3.5 text-white/80" aria-hidden />
            {hours}
          </p>
          <SocialLinks social={social} iconClass="h-3.5 w-3.5" className="shrink-0 border-white/20 sm:border-l sm:pl-5" />
        </div>
      </div>
    </div>
  );
}
