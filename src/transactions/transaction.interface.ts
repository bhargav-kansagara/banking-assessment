import { z } from "zod";

export type Transaction = z.infer<typeof TransactionSchema>;

// Input validation for User
export const TransactionSchema = z.object({
    userId: z.number().int(),
    amount: z.number().gt(0),
    idempotentKey: z.number().int(),
    type: z.union([
        z.literal("credit"),
        z.literal("debit"),
    ]),
});
