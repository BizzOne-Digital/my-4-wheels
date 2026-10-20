import { SafeImage } from "../SafeImage";

/** Compact dark page header used by inner pages. */
export function PageHero({ eyebrow, title, intro, image, imageAlt }: { eyebrow?: string; title: string; intro?: string; image?: string; imageAlt?: string }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {image && (
        <>
          <SafeImage src={image} alt={imageAlt ?? ""} fill priority sizes="100vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" aria-hidden />
        </>
      )}
      <div className="container-site relative py-14 sm:py-20">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">{intro}</p>}
      </div>
    </section>
  );
}
