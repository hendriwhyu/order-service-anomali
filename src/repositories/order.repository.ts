import { db } from '../config/database.config';
import { orders, orderItems } from '../schema';
import { IOrder } from '../interfaces/order.interface';
import { sql } from 'drizzle-orm';
import { User } from '../clients/user.client';
import { IOrderItem } from '../interfaces/orderItem.interface';

export class OrderRepository {
  async createOrderWithTransaction(
    orderData: Omit<IOrder, 'id'>,
    orderItemsData: Omit<IOrderItem, 'id'>[],
  ) {
    return await db.transaction(async (tx) => {
      // Create order
      const [order] = await tx
        .insert(orders)
        .values(orderData)
        .returning();

      // Create order items
      const createdOrderItems = await tx
        .insert(orderItems)
        .values(
          orderItemsData.map(item => ({
            ...item,
            orderId: order.id.toString(),
          }))
        )
        .returning();

      return {
        order,
        orderItems: createdOrderItems,
      };
    });
  }

  async updateOrderSnapToken(orderId: number, snapToken: string) {
    return await db
      .update(orders)
      .set({ snapToken })
      .where(sql`${orders.id} = ${orderId}`)
      .returning();
  }
}