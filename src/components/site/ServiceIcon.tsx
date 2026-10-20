import { BadgeCheck, Car, ClipboardCheck, FileText, HandCoins, Handshake, KeyRound, Repeat, Search, ShieldCheck, Wallet } from "lucide-react";

const ICONS = { car: Car, financing: Wallet, tradein: Repeat, buy: HandCoins, inspection: ClipboardCheck, history: FileText, warranty: ShieldCheck, paperwork: BadgeCheck, testdrive: KeyRound, finder: Search, handshake: Handshake };
export const SERVICE_ICON_KEYS = Object.keys(ICONS);

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? Car;
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}
