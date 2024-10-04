import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { compress } from 'hono/compress';
import { orderRouter } from './controllers/order.controller';
import { config } from './config';
import { errorHandler } from './middlewares/error.middleware';
import dotenv from 'dotenv';

dotenv.config();


// Create Hono app instance
const app = new Hono();


// Global Middlewares
app.use('*', logger());
app.use('*', cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use('*', secureHeaders());
app.use('*', prettyJSON());
app.use('*', compress());

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.route('/api/orders', orderRouter);

// Error Handler
app.onError(errorHandler);

// Not Found Handler
app.notFound((c) => {
  return c.json({
    status: 404,
    message: 'Not Found',
    path: c.req.path,
  }, 404);
});

// Start server
const port = config.port;
console.log(`Server is starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});