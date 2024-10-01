import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./common//middlewares/errorHandler";
import * as DynamoDBService from "./common/database/database.service";
import { transactionsRouter } from "./transactions/transactions.router";
import { usersRouter } from "./users/users.router";

dotenv.config();

let promise = DynamoDBService.initializeDB();

const PORT: number = parseInt(process.env.PORT as string);

const app = express();
app.use(cors());
app.use(express.json());


app.use("/users", usersRouter);
app.use("/transact", transactionsRouter);
app.use(errorHandler);


promise.then(() => app.listen(PORT, () => {
    console.log(`Listening on port ${ PORT }`);
}));
