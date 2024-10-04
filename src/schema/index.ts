import { relations } from 'drizzle-orm';
import { serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { numeric, pgTable, uuid } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey(), // Kolom id auto-increment
  orderNumber: varchar('orderNumber', { length: 256 }).unique().notNull(),
  customerId: uuid('customerId').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // Enum status: pending, success, failed, expired
  amount: numeric('amount', { precision: 10, scale: 2 }), // Menggunakan numeric untuk amount
  snapToken: varchar('snapToken', { length: 100 }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const items = relations(orders, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom().notNull(), // Kolom UUID auto-generate untuk id

  // Foreign key untuk orders
  orderId: uuid('orderId').notNull(),

  // Foreign key untuk products
  productId: uuid('productId').notNull(),

  // Kolom quantity
  quantity: numeric('quantity').notNull(),

  // Kolom price
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
});
