import type { Metadata } from "next";
import { Users } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SafeImage } from "@/components/SafeImage";
import { EmptyState } from "@/components/site/EmptyState";
import { getDict } from "@/lib/i18n/server";
import { visibleTeam } from "@/lib/queries";
import { l } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.teamTitle, alternates: { canonical: "/team" } };
}

export default async function TeamPage() {
  const { t, locale } = await getDict();
  const team = await visibleTeam();
  return (
    <>
      <PageHero eyebrow={t.footer.team} title={t.pages.teamTitle} />
      <section className="container-site py-14">
        {team.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <li key={String(m._id)} className="card">
                <div className="relative aspect-[4/5] bg-neutral-100">
                  <SafeImage src={m.photo} alt={m.name} fill sizes="(min-width:1024px) 280px, 50vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <h2 className="font-bold">{m.name}</h2>
                  <p className="text-sm text-brand">{l(m.role, locale)}</p>
                  {l(m.bio, locale) && <p className="mt-2 text-sm text-neutral-600">{l(m.bio, locale)}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Users} title={t.pages.teamTitle} text={t.pages.teamEmpty} />
        )}
      </section>
    </>
  );
}
