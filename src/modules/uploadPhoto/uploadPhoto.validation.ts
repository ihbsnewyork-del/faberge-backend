import { z } from "zod";

export const uploadPhotoSchema = z.object({
  title: z.string().min(2, "Name is required"),
});

export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>;
