"use client";
import { useRouter } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { VEHICLE_DEFAULTS, VEHICLE_FIELDS } from "@/lib/admin/fields";

export default function NewVehicle() {
  const router = useRouter();
  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-extrabold">New vehicle</h1>
      <div className="card p-6">
        <ResourceForm resource="vehicles" fields={VEHICLE_FIELDS} initial={VEHICLE_DEFAULTS} onSaved={(item) => router.push(`/admin/vehicles/${item._id}/edit`)} onCancel={() => router.push("/admin/vehicles")} />
      </div>
    </div>
  );
}
