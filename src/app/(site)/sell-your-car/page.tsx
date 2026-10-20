import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { getDict } from "@/lib/i18n/server";
import { IMG } from "@/lib/images";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: t.pages.sellTitle, description: t.pages.sellIntro, alternates: { canonical: "/sell-your-car" } };
}

export default async function SellPage() {
  const { t } = await getDict();
  return (
    <>
      <PageHero eyebrow={t.footer.sell} title={t.pages.sellTitle} intro={t.pages.sellIntro} image={IMG.blackSedan} />
      <div className="container-site max-w-3xl py-14">
        <div className="card p-6 sm:p-8"><InquiryForm variant="sell" /></div>
      </div>
    </>
  );
}
