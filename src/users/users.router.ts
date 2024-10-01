import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validateRequest } from "../common/utils/requestValidator";
import { User, UserSchema } from "./user.interface";
import * as UserService from "./users.service";

export const usersRouter = express.Router();

usersRouter.get("/:id", async (req: Request, res: Response, next) => {
    try
    {
        const id: number = parseInt(req.params.id, 10);
        const item: User = await UserService.get(id);

        if (item)
        {
            res.status(200).send(item);
        }

        res.status(404).send("item not found");
    } catch (err: Error)
    {
        next(err);
    }
});

usersRouter.put("/:id", validateRequest(UserSchema), async (req: Request, res: Response, next) => {
    try
    {
        console.log("router put");
        const item = req.body;
        item.id = parseInt(req.params.id, 10);
        const createdItem: User = await UserService.create(item);

        if (createdItem)
        {
            res.status(201).send(createdItem);
        }
    } catch (err: Error)
    {
        next(err);
    }
});
