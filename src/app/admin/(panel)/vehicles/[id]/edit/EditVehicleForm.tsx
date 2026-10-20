"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { VEHICLE_FIELDS } from "@/lib/admin/fields";

export function EditVehicleForm({ vehicle }: { vehicle: Record<string, unknown> & { _id: string; slug: string; year: number; make: string; model: string; isDemo?: boolean } }) {
  const router = useRouter();
  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">
          {vehicle.year} {vehicle.make} {vehicle.model}
          {vehicle.isDemo && <span className="ml-3 rounded-full bg-amber-100 px-2 py-0.5 align-middle text-xs font-semibold text-amber-800">demo</span>}
        </h1>
        <Link href={`/inventory/${vehicle.slug}`} target="_blank" className="link-red">View on site <ExternalLink className="h-3.5 w-3.5" aria-hidden /></Link>
      </div>
      <div className="card p-6">
        <ResourceForm resource="vehicles" id={vehicle._id} fields={VEHICLE_FIELDS} initial={vehicle} onSaved={() => router.refresh()} onCancel={() => router.push("/admin/vehicles")} />
      </div>
    </div>
  );
}
