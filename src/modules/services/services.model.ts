import { Schema, model, Document } from "mongoose";

export interface ISubcategory {
  _id: string;
  subcategoryName: string;
  subcategoryPrice: number;
}

export interface IService extends Document {
  serviceName: string;
  price: number;
  subcategory?: ISubcategory[];
}

const subcategorySchema = new Schema<ISubcategory>({
  subcategoryName: { type: String, required: true },
  subcategoryPrice: { type: Number, required: true },
});

const serviceSchema = new Schema<IService>(
  {
    serviceName: { type: String, required: true },
    price: { type: Number, required: true },
    subcategory: { type: [subcategorySchema], required: false },
  },
  { timestamps: true }
);

export interface IServiceTime extends Document {
  startTime: string;
  endTime: string;
}

const serviceTimeSchema = new Schema<IServiceTime>(
  {
    startTime: {
      type: String,
      required: true,
      default: "09:00",
    },
    endTime: {
      type: String,
      required: true,
      default: "19:00",
    },
  },
  { timestamps: true }
);

export const ServiceModel = model<IService>("Service", serviceSchema);

export const ServiceTimeModel = model<IServiceTime>(
  "ServiceTime",
  serviceTimeSchema
);
