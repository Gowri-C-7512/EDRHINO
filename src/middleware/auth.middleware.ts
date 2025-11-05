import { User } from '@prisma/client';
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { JWTPayload } from 'jose';
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';
import Promisify from '../utils/Promisify';
import { verifyToken } from '../utils/token';

dotenv.config();

export interface WithUserRequest extends Request {
  user?: User;
}

interface TokenValidityResponse {
  valid: boolean;
  payload: JWTPayload;
}

interface TokenPayload {
  id: number;
  email: string;
}
export const verifyApiKey = async (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  const apiKey = req.header('api-key');
  console.log(apiKey);
  if (!apiKey) {
    throw new ApiError(401, 'Unauthorized Request');
  }

  if (apiKey !== process.env.API_KEY) {
    throw new ApiError(401, 'Invalid API Key');
  }

  next();
};

export const verifyjwt = Promisify(
  async (
    req: WithUserRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json(new ApiError(401, 'unauthorized Request'));
      return;
    }
    const decodedToken: TokenValidityResponse = await verifyToken(token);
    console.log(decodedToken);
    const { id } = decodedToken.payload as unknown as TokenPayload;
    console.log(id);
    const user = await prisma.user.findUnique({
      where: { id },
    });
    console.log(user);
    if (!user) {
      res.status(401).json(new ApiError(401, 'Invalid Access Token'));
      return;
    }
    req.user = user;
    next();
  },
);
