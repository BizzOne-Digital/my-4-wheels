import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { LocalizedSchema, SLUG_RE } from "./shared";

export const TRANSMISSIONS = ["automatic", "manual", "cvt"] as const;
export const BODY_TYPES = ["sedan", "suv", "hatchback", "coupe", "truck", "minivan", "wagon", "convertible"] as const;
export const FUEL_TYPES = ["gasoline", "diesel", "hybrid", "electric", "plugin-hybrid"] as const;
export const VEHICLE_STATUSES = ["available", "reserved", "sold"] as const;

const VehicleSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, match: SLUG_RE },
    year: { type: Number, required: true, min: 1950, max: 2100 },
    make: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true },
    trim: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    mileage: { type: Number, required: true, min: 0 },
    transmission: { type: String, enum: TRANSMISSIONS, default: "automatic" },
    bodyType: { type: String, enum: BODY_TYPES, default: "sedan" },
    fuelType: { type: String, enum: FUEL_TYPES, default: "gasoline" },
    drivetrain: { type: String, default: "", trim: true },
    exteriorColor: { type: String, default: "", trim: true },
    interiorColor: { type: String, default: "", trim: true },
    engine: { type: String, default: "", trim: true },
    vin: { type: String, default: "", trim: true, uppercase: true },
    stockNumber: { type: String, default: "", trim: true },
    images: { type: [String], default: [] },
    imagesIllustrative: { type: Boolean, default: false },
    features: { type: [String], default: [] },
    description: { type: LocalizedSchema, default: () => ({}) },
    inspectionNotes: { type: LocalizedSchema, default: () => ({}) },
    historyReportUrl: { type: String, default: "", trim: true },
    status: { type: String, enum: VEHICLE_STATUSES, default: "available", index: true },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true, index: true },
    isDemo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);
VehicleSchema.index({ price: 1 });
VehicleSchema.index({ year: -1 });
VehicleSchema.index({ make: 1, model: 1 });
export type VehicleDoc = InferSchemaType<typeof VehicleSchema>;
export const Vehicle = (models.Vehicle as Model<VehicleDoc>) || model("Vehicle", VehicleSchema);
