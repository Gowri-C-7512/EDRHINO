import { NextFunction, Request, Response } from 'express';

const Promisify =
  (handler: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch(next);

export default Promisify;
