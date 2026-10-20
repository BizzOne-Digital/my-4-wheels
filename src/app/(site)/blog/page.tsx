import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SafeImage } from "@/components/SafeImage";
import { EmptyState } from "@/components/site/EmptyState";
import { getDict } from "@/lib/i18n/server";
import { postCategories, publishedPosts } from "@/lib/queries";
import { l } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.blogTitle, description: t.pages.blogIntro, alternates: { canonical: "/blog" } };
}

const label = (c: string) => c.replace(/-/g, " ").replace(/^\w/, (x) => x.toUpperCase());

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { t, locale } = await getDict();
  const { category } = await searchParams;
  const cat = category && /^[a-z0-9-]{1,40}$/.test(category) ? category : undefined;
  const [posts, categories] = await Promise.all([publishedPosts(cat), postCategories()]);
  const fmt = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "long" });
  return (
    <>
      <PageHero eyebrow={t.footer.blog} title={t.pages.blogTitle} intro={t.pages.blogIntro} />
      <section className="container-site py-14">
        {categories.length > 0 && (
          <nav aria-label="Categories" className="mb-8 flex flex-wrap gap-2">
            <Link href="/blog" aria-current={!cat ? "page" : undefined} className={`rounded-[3px] px-3 py-1.5 text-sm font-semibold ${!cat ? "bg-brand text-white" : "bg-mist hover:bg-neutral-200"}`}>{t.pages.allCategories}</Link>
            {categories.map((c) => (
              <Link key={c} href={`/blog?category=${c}`} aria-current={cat === c ? "page" : undefined} className={`rounded-[3px] px-3 py-1.5 text-sm font-semibold ${cat === c ? "bg-brand text-white" : "bg-mist hover:bg-neutral-200"}`}>{label(c)}</Link>
            ))}
          </nav>
        )}
        {posts.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug} className="card flex flex-col">
                <Link href={`/blog/${p.slug}`} className="relative block aspect-[16/9]" tabIndex={-1} aria-hidden>
                  <SafeImage src={p.coverImage} alt="" fill sizes="(min-width:1024px) 380px, 100vw" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <p className="eyebrow">{label(p.category)}</p>
                  <h2 className="mt-2 text-lg font-bold"><Link href={`/blog/${p.slug}`} className="hover:text-brand">{l(p.title, locale)}</Link></h2>
                  <p className="mt-2 flex-1 text-sm text-neutral-600">{l(p.excerpt, locale)}</p>
                  {p.publishedAt && <p className="mt-4 text-xs text-neutral-500">{fmt.format(new Date(p.publishedAt))}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Newspaper} title={t.pages.blogEmpty} />
        )}
      </section>
    </>
  );
}
