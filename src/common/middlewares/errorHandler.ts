import type { ErrorRequestHandler, RequestHandler } from "express";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "@/common/utils/exceptions";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: [{ message: err.message }] });
  } else {
    console.log(err);
    return res.status(500).send({ errors: [{ message: "Something went wrong" }] });
  }
};
