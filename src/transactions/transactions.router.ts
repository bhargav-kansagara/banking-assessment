import { Router, Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as Retry from "retry";
import { CustomError } from "@/common/utils/exceptions";
import { validateRequest } from "@/common/utils/requestValidator";
import { Transaction, TransactionSchema } from "@/transactions/transaction.interface";
import * as TransactionsService from "@/transactions/transactions.service";

export const transactionsRouter = Router();

transactionsRouter.post(
  "/",
  validateRequest(TransactionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Retry policy to handle concurrent transactions for the same user.
      const operation = Retry.operation({
        retries: 5,
        factor: 2,
        minTimeout: 100,
        randomize: true,
      });

      operation.attempt(async (currentAttempt: number) => {
        try {
          await TransactionsService.transact(req.body);
          return res.status(200).send({ status: "successful" });
        } catch (error) {
          if (
            error.name == "ConditionalCheckFailedException" &&
            operation.retry(error)
          ) {
            // Retry on ConditionalCheckFailedException to handle concurrent updates over the same item.
            return;
          } else {
            // If the error is not a ConditionalCheckFailedException, or retries are exhausted, throw the error.
            return next(error);
          }
        }
      });
    } catch (error) {
      // If all retries fail, return an error, keeping status code as 500 since it's not a client error.
      // 429 can be used if it exceeds client quota.
      next(
        new CustomError(
          "Something went wrong, please try again later.",
          StatusCodes.INTERNAL_SERVER_ERROR,
        ),
      );
    }
  },
);
