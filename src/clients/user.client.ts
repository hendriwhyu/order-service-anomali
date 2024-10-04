import { NotFoundError } from '../exceptions/NotFound';

export interface User {
  id: string;
  name: string;
  email: string;
}

export class UserServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
  }

  async getUser(userId: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `User service responded with status: ${response.status}`,
        );
      }

      const user = await response.json();
      return user.data;
    } catch (error) {
      throw new NotFoundError(`Failed to fetch user: ${error.message}`);
    }
  }
}
