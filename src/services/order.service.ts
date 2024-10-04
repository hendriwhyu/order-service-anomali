import { ProductServiceClient, Product } from '../clients/product.client';
import { CreateOrderDTO, OrderResponseDTO } from '../dtos/order.dto';
import { OrderRepository } from '../repositories/order.repository';
import { ApplicationError } from '../exceptions/errors';
import { midtransClient } from '../config/midtrans.config';
import { IOrder } from '../interfaces/order.interface';
import { UserServiceClient } from '../clients/user.client';
import { NotFoundError } from '../exceptions/NotFound';
import { IOUser } from '../interfaces/user.interface';
import { IOrderItem } from '../interfaces/orderItem.interface';

export class OrderService {
  private productClient: ProductServiceClient;
  private userClient: UserServiceClient;
  private orderRepository: OrderRepository;

  constructor() {
    this.productClient = new ProductServiceClient();
    this.userClient = new UserServiceClient();
    this.orderRepository = new OrderRepository();
  }

  async createOrder(createOrderDto: CreateOrderDTO): Promise<OrderResponseDTO> {
    try {
      // 2. Fetch product details from Product Service
      const productMap = new Map<string, Product>();

      // 3. Validate all requested products exist and have sufficient stock
      const orderItems = await Promise.all(
        createOrderDto.items.map(async (item) => {
          const product = await this.productClient.getProduct(item.productId);

          if (!product) {
            throw new NotFoundError(`Product not found: ${item.productId}`);
          }

          const hasStock = await this.productClient.checkStock(
            item.productId,
            item.quantity,
          );
          if (!hasStock) {
            throw new ApplicationError(
              `Insufficient stock for product: ${product.name}`,
              400,
            );
          }

          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          };
        }),
      );

      // 4. Calculate total amount
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // 5. Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 6. Prepare order data
      const orderData = {
        customerId: createOrderDto.customerId,
        status: 'pending',
        amount: totalAmount,
        orderNumber,
      };

      // 7. Create order and order items in a transaction
      const { order, orderItems: createdOrderItems } =
        await this.orderRepository.createOrderWithTransaction(
          orderData,
          orderItems,
        );

      createdOrderItems.forEach(async (item)  => {
        await this.productClient.getProduct(item.productId);
        await this.productClient.decreaseStockProduct(
          item.productId,
          item.quantity,
        );
      });

      const customerDetail = this.userClient.getUser(createOrderDto.customerId);
      // 8. Create Midtrans transaction
      const midtransTransaction = await this.createMidtransTransaction(
        order,
        createdOrderItems,
        productMap,
        customerDetail,
      );

      // 9. Update order with snap token
      await this.orderRepository.updateOrderSnapToken(
        order.id,
        midtransTransaction.token,
      );

      // 10. Format response
      return {
        ...order,
        snapToken: midtransTransaction.token,
        items: createdOrderItems.map((item) => ({
          ...item,
          productName: productMap.get(item.productId)?.name || '',
        })),
      };
    } catch (error) {
      // Log error for debugging
      console.error('Error creating order:', error);

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError('Failed to create order', 500);
    }
  }

  private async createMidtransTransaction(
    order: IOrder,
    orderItems: IOrderItem[],
    productMap: Map<string, Product>,
    customer: IOUser,
  ) {
    const transactionDetails = {
      transaction_details: {
        order_id: order.orderNumber,
        gross_amount: order.amount,
      },
      item_details: orderItems.map((item) => ({
        id: item.productId,
        price: item.price,
        quantity: item.quantity,
        name: productMap.get(item.productId)?.name || 'Unknown Product',
      })),
      customer_details: {
        first_name: customer.name,
        email: customer.email,
      },
    };

    try {
      return await midtransClient.createTransaction(transactionDetails);
    } catch (error) {
      console.error('Midtrans transaction creation failed:', error);
      throw new ApplicationError('Payment initiation failed', 500);
    }
  }

  async handleMidtransNotification(notification: any) {
    try {
      const statusResponse =
        await midtransClient.transaction.notification(notification);

      const orderId = statusResponse.order_id;
      let orderStatus: 'pending' | 'success' | 'failed' | 'expired';

      switch (statusResponse.transaction_status) {
        case 'capture':
        case 'settlement':
          orderStatus = 'success';
          break;
        case 'deny':
        case 'cancel':
        case 'failure':
          orderStatus = 'failed';
          break;
        case 'expire':
          orderStatus = 'expired';
          break;
        default:
          orderStatus = 'pending';
      }

      // Update order status in database
      await this.orderRepository.updateOrderStatus(orderId, orderStatus);

      return { success: true };
    } catch (error) {
      console.error('Error handling Midtrans notification:', error);
      throw new ApplicationError('Failed to process payment notification', 500);
    }
  }
}
