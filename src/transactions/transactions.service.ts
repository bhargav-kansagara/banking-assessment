import { StatusCodes } from "http-status-codes";
import * as DynemoDbService from "@/common/database/database.service";
import { CustomError } from "@/common/utils/exceptions";
import { User } from "@/users/user.interface";
import * as UsersService from "@/users/users.service";
import { Transaction } from "@/transactions/transaction.interface";

export const transact = async (transaction: Transaction) => {
  // Get use to fetch the current balance.
  const user: User = (await UsersService.get(transaction.userId)) as User;
  if (!user) {
    throw new CustomError("User not found.", StatusCodes.BAD_REQUEST);
  }

  // Check if the transaction is already processed.
  var transactionRecord = (await DynemoDbService.getItem(
    { idempotentKey: transaction.idempotentKey, userId: transaction.userId },
    DynemoDbService.TransactionsTableName,
  )) as Transaction;

  if (!transactionRecord) {
    console.log("transaction record not found.")
    // If there is no transaction record, this is a new transaction request, create a new transaction record with status pending.
    transaction.status = "pending";
    transactionRecord = await DynemoDbService.createItem(
      transaction,
      { idempotentKey: transaction.idempotentKey, userId: transaction.userId },
      DynemoDbService.TransactionsTableName,
    );
  } else if (transactionRecord.status == "complete") {
    console.log("transaction already complete.")
    // If the transaction is already processed, throw bad request.
    throw new CustomError("Transaction already complete.", StatusCodes.BAD_REQUEST);
  }

  // Process the transaction.
  if (transaction.type == "credit") {
    user.balance += transaction.amount;
  } else if (transaction.type == "debit") {
    if (user.balance < transaction.amount) {
      throw new CustomError("Insufficient balance.", StatusCodes.BAD_REQUEST);
    }
    user.balance -= transaction.amount;
  } else {
    throw new CustomError("Invalid transaction type.", StatusCodes.BAD_REQUEST);
  }

  // Increment the version and update the item in the database.
  user.version += 1;
  const updatedUser = await DynemoDbService.updateItem(
    user,
    DynemoDbService.UsersTableName,
  );

  // Update the transaction record status to complete in the database.
  transactionRecord.status = "complete";
  transactionRecord.version += 1;
  await DynemoDbService.updateItem(
    transactionRecord,
    DynemoDbService.TransactionsTableName,
  );
};
