import { Schema, model, Document } from "mongoose";

export interface IState extends Document {
  name: string;
  active: boolean;
}

const stateSchema = new Schema<IState>(
  {
    name: { type: String, required: true, unique: true },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const StateModel = model<IState>("State", stateSchema);
