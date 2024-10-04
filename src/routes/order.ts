import { Hono } from 'hono';
import OrderController from '../controllers/order.controller';
import OrdersService from '../services/order.service';
import OrderItemsService from '../services/OrderItemsService';

const route = new Hono();


const Order = new OrderController();

route.post('/orders', Order.createOrder); // Perbaikan nama metode

export default route;
