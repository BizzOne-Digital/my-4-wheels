import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeImage } from "@/components/SafeImage";
import { RichText } from "@/components/site/RichText";
import { getDict } from "@/lib/i18n/server";
import { postBySlug } from "@/lib/queries";
import { l } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await getDict();
  const p = await postBySlug((await params).slug);
  return p ? { title: l(p.title, locale), description: l(p.excerpt, locale), alternates: { canonical: `/blog/${p.slug}` }, openGraph: p.coverImage ? { images: [p.coverImage] } : undefined } : {};
}

export default async function PostPage({ params }: Props) {
  const { t, locale } = await getDict();
  const p = await postBySlug((await params).slug);
  if (!p) notFound();
  return (
    <article>
      <header className="container-site max-w-3xl pb-8 pt-12">
        <Link href="/blog" className="link-red text-xs">← {t.pages.blogTitle}</Link>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight">{l(p.title, locale)}</h1>
        <p className="mt-3 text-sm text-neutral-500">
          {p.author}
          {p.publishedAt && ` · ${new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "long" }).format(new Date(p.publishedAt))}`}
        </p>
      </header>
      {p.coverImage && (
        <div className="container-site max-w-4xl">
          <div className="relative aspect-[16/8] overflow-hidden rounded-[4px]">
            <SafeImage src={p.coverImage} alt="" fill priority sizes="(min-width:1024px) 900px, 100vw" className="object-cover" />
          </div>
        </div>
      )}
      <div className="container-site max-w-3xl py-10">
        <RichText text={l(p.body, locale)} />
      </div>
    </article>
  );
}
