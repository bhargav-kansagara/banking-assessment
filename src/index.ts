import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { errorHandler } from "@/common//middlewares/errorHandler";
import * as DynamoDBStartup from "@/common/database/database.startup";
import { transactionsRouter } from "@/transactions/transactions.router";
import { usersRouter } from "@/users/users.router";

dotenv.config();

let dbStatupPromise = DynamoDBStartup.initializeDB();

const PORT: number = parseInt(process.env.PORT as string);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", usersRouter);
app.use("/transact", transactionsRouter);
app.use(errorHandler);

// Start the server once db startup is complete.
dbStatupPromise.then(() =>
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  }),
);
