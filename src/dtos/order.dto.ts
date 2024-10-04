import { z } from 'zod';

// Schema untuk validasi
export const CreateOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
//   price: z.number().positive()
});

export const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(CreateOrderItemSchema).nonempty()
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'success', 'failed', 'expired'])
});

// Types yang dihasilkan dari schema
export type CreateOrderItemDTO = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusDTO = z.infer<typeof UpdateOrderStatusSchema>;

// Response DTOs
export interface OrderItemResponseDTO {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderResponseDTO {
  id: number;
  orderNumber: string;
  customerId: string;
  status: 'pending' | 'success' | 'failed' | 'expired';
  amount: number;
  snapToken?: string;
  items: OrderItemResponseDTO[];
  createdAt: Date;
  updatedAt: Date;
}

// Pagination DTO
export interface PaginationQueryDTO {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedOrderResponseDTO {
  data: OrderResponseDTO[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

// Validator functions
export class OrderDTOValidator {
  static validateCreateOrder(data: unknown): CreateOrderDTO {
    return CreateOrderSchema.parse(data);
  }

  static validateUpdateOrderStatus(data: unknown): UpdateOrderStatusDTO {
    return UpdateOrderStatusSchema.parse(data);
  }

  static validatePaginationQuery(query: Record<string, unknown>): PaginationQueryDTO {
    const schema = z.object({
      page: z.coerce.number().int().positive().optional().default(1),
      limit: z.coerce.number().int().positive().optional().default(10),
      sortBy: z.enum(['createdAt', 'amount', 'status']).optional().default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
    });

    return schema.parse(query);
  }
}