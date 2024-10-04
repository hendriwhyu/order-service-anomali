import { ClientError } from "./errors";


export class AuthenticationsError extends ClientError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthenticationsError';
  }
}
