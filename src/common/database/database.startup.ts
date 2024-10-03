import {
  UsersTableName,
  TransactionsTableName,
  createTable,
} from "@/common/database/database.service";

export const initializeDB = async () => {
  // Create 'Users' table.
  const usersParams = {
    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH",
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 100,
      WriteCapacityUnits: 100,
    },
    TableName: UsersTableName,
  };
  await createTable(usersParams);
  console.log("Users table created successfully.");

  // Create 'Transactions' table.
  const transactionsParams = {
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "idempotentKey", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "idempotentKey", KeyType: "RANGE" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 100,
      WriteCapacityUnits: 100,
    },
    TableName: TransactionsTableName,
  };
  await createTable(transactionsParams);
  console.log("Transactions table created successfully.");
};
