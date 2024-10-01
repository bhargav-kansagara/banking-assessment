import { CreateTableCommand, DescribeTableCommand, DynamoDBClient, waitUntilTableExists } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/exceptions";

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

export const getItem = async (primaryKey: any, tableName: string): Promise<any> => {
    const getCommand = new GetCommand({
        TableName: tableName,
        Key: primaryKey,
        ConsistentRead: true,
    });
    const getResponse = await ddbClient.send(getCommand);
    return getResponse.Item;
};

export const createItem = async (item: any, primaryKey: any, tableName: string) => {
    const getCommand = new GetCommand({
        TableName: tableName,
        Key: primaryKey,
        ConsistentRead: true,
    });
    const getResponse = await ddbClient.send(getCommand);

    if (getResponse.Item == undefined || getResponse.Item == null)
    {
        item.version = 1;
        const putCommand = new PutCommand({
            TableName: tableName,
            Item: item,
        });
        const putResponse = await ddbClient.send(putCommand);
        console.log(JSON.stringify(putResponse));
        return item;
    } else
    {
        throw new CustomError("Item you are trying to create already exists.", StatusCodes.BAD_REQUEST);
    }
};

export const updateItem = async (item: any, tableName: string) => {
    const putCommand = new PutCommand({
        TableName: tableName,
        Item: item,
        ConditionExpression: "#version = :expectedVersion",
        ExpressionAttributeNames: {
            "#version": "version",
        },
        ExpressionAttributeValues: {
            ":expectedVersion": item.version - 1,
        }
    });

    const putResponse = await ddbClient.send(putCommand);
    return item;
};

const createTable = async (params: any) => {
    await ddbClient.send(new CreateTableCommand(params));
    await waitUntilTableExists({ client: ddbClient }, { TableName: params.TableName });
};

export const initializeDB = async () => {
    // Create 'Users' table if doesn't exist.
    try
    {
        await ddbClient.send(new DescribeTableCommand({ TableName: UsersTableName }));
    } catch (error)
    {
        const params = {
            AttributeDefinitions: [
                {
                    AttributeName: "id",
                    AttributeType: "N",
                },
            ],
            KeySchema: [
                {
                    AttributeName: "id",
                    KeyType: "HASH",
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 10,
            },
            TableName: UsersTableName,
        };

        // Call DynamoDB to create the table
        await createTable(params);
    }

    // Create 'Transactions' table if doesn't exist.
    try
    {
        await ddbClient.send(new DescribeTableCommand({ TableName: TransactionsTableName }));
    } catch (error)
    {
        const params = {
            AttributeDefinitions: [
                {
                    AttributeName: "userId",
                    AttributeType: "N",
                },
                { AttributeName: "idempotentKey", AttributeType: "N" },
            ],
            KeySchema: [
                {
                    AttributeName: "userId",
                    KeyType: "HASH",
                },
                { AttributeName: "idempotentKey", KeyType: "RANGE" },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 10,
            },
            TableName: TransactionsTableName,
        };

        // Call DynamoDB to create the table
        await createTable(params);
    }
};
