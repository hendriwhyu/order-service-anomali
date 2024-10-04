import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce',
  },
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    isProduction: process.env.NODE_ENV === 'production',
  },
  productService: {
    url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
    timeout: parseInt(process.env.PRODUCT_SERVICE_TIMEOUT || '5000', 10),
  },
};