import { SafeImage } from "./SafeImage";

/** Original vector logo: red car silhouette swoosh over a bold italic wordmark. */
export function Logo({ variant = "light", className = "", uploaded }: { variant?: "light" | "dark"; className?: string; uploaded?: string }) {
  if (uploaded) {
    return (
      <span className={`relative block ${className}`}>
        <SafeImage src={uploaded} alt="My 4 Wheels" fill sizes="200px" className="object-contain object-left" priority />
      </span>
    );
  }
  const text = variant === "dark" ? "#FFFFFF" : "#0B0B0D";
  return (
    <svg viewBox="0 0 260 64" className={className} role="img" aria-label="My 4 Wheels">
      <title>My 4 Wheels</title>
      <path
        d="M14 30c10-9 28-15 52-16 22-1 40 2 56 9l22 2c7 1 10 3 11 6l-14-2c-3-3-7-4-14-4H118c-16-5-32-6-50-5-19 1-36 5-48 12l-9 3z"
        fill="#DF2029"
      />
      <path d="M76 18c10-4 24-6 38-3l-8 6c-10-2-20-1-30 2z" fill="#DF2029" opacity=".85" />
      <text x="16" y="58" fontFamily="Inter, Arial, sans-serif" fontSize="25" fontWeight="900" fontStyle="italic" fill={text} letterSpacing=".5">
        MY 4
      </text>
      <text x="86" y="58" fontFamily="Inter, Arial, sans-serif" fontSize="25" fontWeight="900" fontStyle="italic" fill="#DF2029" letterSpacing=".5">
        WHEELS
      </text>
    </svg>
  );
}
