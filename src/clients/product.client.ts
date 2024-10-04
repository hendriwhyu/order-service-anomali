import { NotFoundError } from "../exceptions/NotFound";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export class ProductServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:8000/api';
  }

  async getProduct(productId: string): Promise<Product> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Product service responded with status: ${response.status}`,
        );
      }

      const product = await response.json();
      return product.data;
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  async decreaseStockProduct(productId: string, quantity: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}/decrease-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) {
        throw new Error(
          `Product service responded with status: ${response.status}`,
        );
      }
    } catch (error) {
      throw new NotFoundError(`Failed to decrease stock: ${error.message}`);
    }
  }

  async returnStockProduct(productId: string, quantity: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}/return-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) {
        throw new Error(
          `Product service responded with status: ${response.status}`,
        );
      }
    } catch (error) {
      throw new NotFoundError(`Failed to return stock: ${error.message}`);
    }
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/products/${productId}/check-stock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity }),
        },
      );

      if (!response.ok) {
        return false;
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to check stock: ${error.message}`);
    }
  }
}
