import { Schema, model, Document } from "mongoose";

export interface IUploadPhoto extends Document {
  title: string;
  image?: string;
  video?: string;
}

const uploadPhotoSchema = new Schema<IUploadPhoto>(
  {
    title: { type: String, required: true, unique: true },
    image: { type: String, default: null },
    video: { type: String, default: null },
  },
  { timestamps: true }
);

export const UploadPhotoModel = model<IUploadPhoto>(
  "UploadPhoto",
  uploadPhotoSchema
);
