import { isValidObjectId } from "mongoose";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Vehicle } from "@/models/Vehicle";
import { plain } from "@/lib/format";
import { EditVehicleForm } from "./EditVehicleForm";

export const metadata = { title: "Edit vehicle" };

export default async function EditVehicle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const v = await Vehicle.findById(id).lean();
  if (!v) notFound();
  return <EditVehicleForm vehicle={plain(v) as never} />;
}
