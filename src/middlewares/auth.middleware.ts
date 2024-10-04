import { Context, Next } from 'hono';
import { AuthorizationError } from '../exceptions/AuthorizationError';
import { AuthenticationsError } from '../exceptions/AuthenticationError';

export function authVerification(c: Context, next: Next) {
  try {
    const token: string = c.req.header('Authorization') as string;
    if (!token) {
      throw new AuthorizationError('No token, authorization denied');
    }
    return next();
  } catch (error) {
    throw new AuthenticationsError(error.message);
  }
}
