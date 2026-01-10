import bcrypt from "bcrypt";
import { ManagerModel } from "../modules/manager/manager.model";
import dotenv from "dotenv";

dotenv.config();

export const seedAdmin = async () => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env file");
    return;
  }

  const existingManager = await ManagerModel.findOne({ email: ADMIN_EMAIL });
  if (existingManager) {
    console.log("Admin manager already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const adminManager = new ManagerModel({
    firstName: process.env.ADMIN_FIRST_NAME,
    lastName: process.env.ADMIN_LAST_NAME,
    address: process.env.ADMIN_ADDRESS,
    city: process.env.ADMIN_CITY,
    state: process.env.ADMIN_STATE,
    phone: process.env.ADMIN_PHONE,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
  });

  await adminManager.save();
  console.log("Admin manager created successfully!");
};
