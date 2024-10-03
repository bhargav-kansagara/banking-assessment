import { z } from "zod";

export type User = z.infer<typeof UserSchema>;

// Input validation for User
export const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  balance: z.number(),
});
