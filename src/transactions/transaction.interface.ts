import { z } from "zod";

export type Transaction = z.infer<typeof TransactionSchema>;

// Input validation for User
export const TransactionSchema = z.object({
  userId: z.string(),
  amount: z.number().gt(0),
  idempotentKey: z.string(),
  type: z.union([z.literal("credit"), z.literal("debit")]),
});
