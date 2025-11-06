import { jwtVerify, SignJWT } from 'jose';
import { ApiError } from './ApiError';

type payloadConfig = {
  email: string;
  id: number;
  type: 'access' | 'refresh';
};

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your_secret_key',
);

export const generateToken = async (
  exp: string,
  payload?: payloadConfig,
): Promise<string> => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(exp)
    .sign(JWT_SECRET);

  return token;
};
export const verifyToken = async (
  token: string,
): Promise<{ valid: boolean; payload: payloadConfig }> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    return {
      valid: true,
      payload: payload as payloadConfig,
    };
  } catch (err) {
    console.error('Token Verification Error:', err);
    throw new ApiError(400, 'Token is invalid or expired.');
  }
};
