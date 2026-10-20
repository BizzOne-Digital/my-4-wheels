import { Schema, model, models, type Model } from "mongoose";

export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export interface StoredUploadDoc {
  folder: UploadFolder;
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const StoredUploadSchema = new Schema<StoredUploadDoc>(
  {
    folder: { type: String, enum: UPLOAD_FOLDERS, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    // Binary is excluded by default; only the image-delivery route selects it explicitly.
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);
StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });
export const StoredUpload =
  (models.StoredUpload as Model<StoredUploadDoc>) || model<StoredUploadDoc>("StoredUpload", StoredUploadSchema);
