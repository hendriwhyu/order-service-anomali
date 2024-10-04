export interface IOrder {
  id: number;
  orderNumber: string;
  customerId: string;
  status: 'pending' | 'success' | 'failed' | 'expired';
  amount: number;
  snapToken?: string;
}
