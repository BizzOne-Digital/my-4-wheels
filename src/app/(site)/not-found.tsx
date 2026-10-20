import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getDict();
  return (
    <section className="container-site py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-extrabold">{t.notFound.title}</h1>
      <p className="mt-3 text-neutral-600">{t.notFound.text}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn-primary">{t.notFound.home}</Link>
        <Link href="/inventory" className="btn-outline">{t.nav.inventory}</Link>
      </div>
    </section>
  );
}
