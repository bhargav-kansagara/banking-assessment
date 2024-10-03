import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "@/common/utils/exceptions";

export const UsersTableName = "Users";
export const TransactionsTableName = "Transactions";

const ddbClient = new DynamoDBClient({
  endpoint: "https://dynamodb.localhost.localstack.cloud:4566",
  region: "us-east-1",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
});

// Fetch an item from DynamoDB table.
export const getItem = async (
  primaryKey: any,
  tableName: string,
): Promise<any> => {
  const getCommand = new GetCommand({
    TableName: tableName,
    Key: primaryKey,
    ConsistentRead: true,
  });
  const getResponse = await ddbClient.send(getCommand);
  return getResponse.Item;
};

// Create an item in DynamoDB table.
export const createItem = async (
  item: any,
  primaryKey: any,
  tableName: string,
) => {
  // Check if the item exists.
  const getCommand = new GetCommand({
    TableName: tableName,
    Key: primaryKey,
    ConsistentRead: true,
  });
  const getResponse = await ddbClient.send(getCommand);

  // Create the item only if it doesn't exist.
  if (!getResponse.Item) {
    item.version = 1;
    const putCommand = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    const putResponse = await ddbClient.send(putCommand);
    console.log(JSON.stringify(putResponse));
    return item;
  } else {
    throw new CustomError(
      "Item you are trying to create already exists.",
      StatusCodes.BAD_REQUEST,
    );
  }
};

// Update an item in DynamoDB table with concurrency handling based on item version.
export const updateItem = async (item: any, tableName: string) => {
  const putCommand = new PutCommand({
    TableName: tableName,
    Item: item,
    ConditionExpression: "#version = :expectedVersion",
    ExpressionAttributeNames: {
      "#version": "version",
    },
    ExpressionAttributeValues: {
      ":expectedVersion": item.version - 1, // Update only if the current item version is one less than the new item version.
    },
  });

  const putResponse = await ddbClient.send(putCommand);
  return item;
};

// Create a table in DynamoDB if it doesn't exist.
export const createTable = async (params: any) => {
  try {
    await ddbClient.send(
      new DescribeTableCommand({ TableName: params.TableName }),
    );
  } catch (error) {
    await ddbClient.send(new CreateTableCommand(params));
    await waitUntilTableExists(
      { client: ddbClient, maxWaitTime: 60 },
      { TableName: params.TableName },
    );
  }
};
