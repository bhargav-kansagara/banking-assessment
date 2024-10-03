import express, { Request, Response } from "express";
import { validateRequest } from "@/common/utils/requestValidator";
import { User, UserSchema } from "@/users/user.interface";
import * as UserService from "@/users/users.service";

export const usersRouter = express.Router();

usersRouter.get("/:id", async (req: Request, res: Response, next) => {
  try {
    const item: User = await UserService.get(req.params.id);

    if (item) {
      return res.status(200).send(item);
    }

    return res.status(404).send("item not found");
  } catch (err) {
    next(err);
  }
});

usersRouter.put(
  "/:id",
  validateRequest(UserSchema),
  async (req: Request, res: Response, next) => {
    try {
      const item = req.body;
      item.id = req.params.id;
      const createdItem: User = await UserService.create(item);

      if (createdItem) {
        return res.status(201).send(createdItem);
      }
    } catch (err) {
      next(err);
    }
  },
);
