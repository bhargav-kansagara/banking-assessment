import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { ZodError, ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try
    {
        console.log(req);
        schema.parse(req.body);
        next();
    } catch (err)
    {
        console.log(JSON.stringify(err));
        res.status(StatusCodes.BAD_REQUEST).send({ errors: err });
    }
};
