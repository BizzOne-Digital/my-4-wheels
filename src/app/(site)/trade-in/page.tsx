import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { getDict } from "@/lib/i18n/server";
import { IMG } from "@/lib/images";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.tradeTitle, description: t.pages.tradeIntro, alternates: { canonical: "/trade-in" } };
}

export default async function TradeInPage() {
  const { t } = await getDict();
  return (
    <>
      <PageHero eyebrow={t.footer.tradeIn} title={t.pages.tradeTitle} intro={t.pages.tradeIntro} image={IMG.suvSnow} />
      <div className="container-site grid gap-10 py-14 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="text-neutral-700">{t.benefits[2].text}</p>
          <Link href="/booking?type=trade-in" className="btn-primary mt-6">{t.booking.types["trade-in"]}</Link>
        </div>
        <div className="card p-6 sm:p-8"><InquiryForm variant="trade-in" /></div>
      </div>
    </>
  );
}
