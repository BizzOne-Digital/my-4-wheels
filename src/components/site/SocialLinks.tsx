/** Social profile icons. Only links set in Admin → Settings → Social links are shown. */
const PATHS: Record<string, string> = {
  facebook: "M14 8h3V4h-3c-2.8 0-4.5 1.9-4.5 4.7V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V9c0-.6.4-1 1-1z",
  instagram:
    "M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.9-8.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 3.6c2.7 0 3 0 4.1.1 2.7.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.7-.1-4-1.4-4.1-4.1C3.7 15 3.6 14.7 3.6 12s0-3 .1-4.1c.1-2.7 1.4-4 4.1-4.1 1.1-.1 1.4-.2 4.2-.2zM12 2c-2.7 0-3.1 0-4.1.1C4.2 2.2 2.2 4.2 2.1 7.9 2 8.9 2 9.3 2 12s0 3.1.1 4.1c.1 3.7 2.1 5.7 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.7-.1 5.7-2.1 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.1-3.7-2.1-5.7-5.8-5.8C15.1 2 14.7 2 12 2z",
  tiktok: "M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .8.1V9.1a6.3 6.3 0 1 0 5.5 6.3V8.6a7.9 7.9 0 0 0 4.4 1.3V6.5a4.4 4.4 0 0 1-4.4-4.5z",
  youtube:
    "M22.5 7.2a2.8 2.8 0 0 0-2-2C18.8 4.8 12 4.8 12 4.8s-6.8 0-8.5.4a2.8 2.8 0 0 0-2 2C1.1 8.9 1.1 12 1.1 12s0 3.1.4 4.8a2.8 2.8 0 0 0 2 2c1.7.4 8.5.4 8.5.4s6.8 0 8.5-.4a2.8 2.8 0 0 0 2-2c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8zM9.8 15.1V8.9l5.7 3.1-5.7 3.1z",
  google:
    "M21.6 10.2H12v3.9h5.5c-.5 2.5-2.6 4.1-5.5 4.1a6.2 6.2 0 1 1 4-10.9l2.9-2.9A10.2 10.2 0 1 0 12 22.2c5.9 0 9.8-4.1 9.8-10 0-.7-.1-1.4-.2-2z",
};
const LABELS: Record<string, string> = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", google: "Google reviews" };

export function hasSocial(social?: Record<string, string>) {
  return Object.entries(social ?? {}).some(([k, v]) => v && PATHS[k]);
}

export function SocialLinks({ social, className = "", iconClass = "h-4 w-4" }: { social?: Record<string, string>; className?: string; iconClass?: string }) {
  const items = Object.entries(social ?? {}).filter(([k, v]) => v && PATHS[k]);
  if (!items.length) return null;
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {items.map(([k, href]) => (
        <li key={k}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={LABELS[k]} title={LABELS[k]} className="block transition-colors hover:text-brand">
            <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} aria-hidden>
              <path d={PATHS[k]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
