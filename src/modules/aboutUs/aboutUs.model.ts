import { Document, Schema, Types, model } from "mongoose";

interface IAboutUs extends Document {
  aboutUs: string;
}

const aboutUsSchema = new Schema<IAboutUs>(
  {
    aboutUs: {
      type: String,
      default: "About us",
    },
  },
  { timestamps: true }
);

export const AboutUsModel = model<IAboutUs>("AboutUs", aboutUsSchema);
