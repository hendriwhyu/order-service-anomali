import { Hono } from 'hono';
import { OrderService } from '../services/order.service';
import { OrderDTOValidator } from '../dtos/order.dto';
import { ApplicationError } from '../exceptions/errors';

const orderRouter = new Hono();
const orderService = new OrderService();

orderRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = OrderDTOValidator.validateCreateOrder(body);
    const order = await orderService.createOrder(validatedData);
    return c.json({ data: order }, 201);
  } catch (error) {
    if (error instanceof ApplicationError) {
      return c.json(
        { status: 'error', message: error.message },
        error.statusCode,
      );
    }
    console.error('Unexpected error:', error);
    return c.json({ status: 'error', message: 'Internal Server Error' }, 500);
  }
});

orderRouter.post('/notification', async (c) => {
  try {
    const notification = await c.req.json();
    await orderService.handleMidtransNotification(notification);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error handling notification:', error);
    return c.json({ error: 'Failed to process notification' }, 500);
  }
});

export { orderRouter };
