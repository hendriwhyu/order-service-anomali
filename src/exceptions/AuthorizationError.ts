import { ClientError } from "./errors";

export class AuthorizationError extends ClientError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthorizationError';
  }
}
