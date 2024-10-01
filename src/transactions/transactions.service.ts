import { StatusCodes } from "http-status-codes";
import * as DynemoDbService from "../common/database/database.service";
import { CustomError } from "../common/utils/exceptions";
import { User } from "../users/user.interface";
import * as UsersService from "../users/users.service";
import { Transaction } from "./transaction.interface";

export const transact = async (transaction: Transaction) => {
    const user = (await UsersService.get(transaction.userId)) as User;
    if (!user)
    {
        throw new CustomError("User not found.", StatusCodes.BAD_REQUEST);
    }

    const transactionRecord = (await DynemoDbService.getItem({ idempotentKey: transaction.idempotentKey, userId: transaction.userId }, DynemoDbService.TransactionsTableName)) as Transaction;
    if (!transactionRecord)
    {
        transaction.status = "pending";
        await DynemoDbService.createItem(transaction, { idempotentKey: transaction.idempotentKey, userId: transaction.userId }, DynemoDbService.TransactionsTableName);
    } else if (transactionRecord.status == "complete")
    {
        return;
    }

    if (transaction.type == "credit")
    {
        user.balance += transaction.amount;
    } else if (transaction.type == "debit")
    {
        if (user.balance < transaction.amount)
        {
            throw new CustomError("Insufficient balance", StatusCodes.BAD_REQUEST);
        }

        user.balance -= transaction.amount;
    } else
    {
        throw new CustomError("Invalid transaction type", StatusCodes.BAD_REQUEST);
    }

    user.version += 1;
    console.log(user);
    const updatedUser = await DynemoDbService.updateItem(user, DynemoDbService.UsersTableName);

    console.log("updated user");
    transaction.status = "complete";
    const createdTransaction = await DynemoDbService.updateItem(transaction, { idempotentKey: transaction.idempotentKey, userId: transaction.userId }, DynemoDbService.TransactionsTableName);
    console.log("created transaction");
};
