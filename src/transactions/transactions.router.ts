import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as Retry from "retry";
import { CustomError } from "../common/utils/exceptions";
import { validateRequest } from "../common/utils/requestValidator";
import { Transaction, TransactionSchema } from "./transaction.interface";
import * as TransactionsService from "./transactions.service";

export const transactionsRouter = express.Router();

transactionsRouter.post("/", validateRequest(TransactionSchema), async (req: Request, res: Response, next) => {
    const operation = Retry.operation({
        retries: 5,
        factor: 2,
        minTimeout: 100,
        maxTimeout: 2000,
        randomize: true,
    });

    operation.attempt(async (currentAttempt) => {
        try
        {
            await TransactionsService.transact(req.body);
            return res.status(200).send({ status: "successful" });
        } catch (error: Error)
        {
            console.log(`Attempt ${ currentAttempt } failed`);
            console.log(JSON.stringify(error));
            if (error.name == "ConditionalCheckFailedException" && operation.retry(error))
            {
                return;
            }
        }
    });
    next(new CustomError("Something went wrong, please try again later.", StatusCodes.INTERNAL_SERVER_ERROR));
});
