declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV: 'development' | 'production' | 'test';
      DB_HOST?: string;
      DB_PORT?: string;
      DB_USERNAME?: string;
      DB_PASSWORD?: string;
      DB_NAME?: string;
      MIDTRANS_SERVER_KEY: string;
      MIDTRANS_CLIENT_KEY: string;
      PRODUCT_SERVICE_URL?: string;
      PRODUCT_SERVICE_TIMEOUT?: string;
      CORS_ORIGINS?: string;
    }
  }
}

export {};
