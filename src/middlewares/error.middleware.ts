import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ApplicationError } from '../exceptions/errors';

export const errorHandler = (err: Error, c: Context) => {
  console.error('Error occurred:', err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        status: err.status,
        message: err.message,
      },
      err.status,
    );
  }

  if (err instanceof ApplicationError) {
    return c.json(
      {
        status: err.statusCode,
        message: err.message,
      },
      err.statusCode,
    );
  }

  // Default error
  return c.json(
    {
      status: 500,
      message: 'Internal Server Error',
    },
    500,
  );
};
