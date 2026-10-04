import { PaymentMethod, PaymentStatus } from '@/types/order';

export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amount: number;
  message: string;
  timestamp: Date;
}

export interface IPaymentService {
  processPayment(input: ProcessPaymentInput): Promise<PaymentResult>;
  processRefund(orderId: string, amount: number, reason: string): Promise<PaymentResult>;
}

export class DefaultPaymentService implements IPaymentService {
  async processPayment(input: ProcessPaymentInput): Promise<PaymentResult> {
    if (input.paymentMethod === 'COD') {
      return {
        success: true,
        transactionId: `COD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        paymentStatus: 'PENDING', // Collected upon delivery
        paymentMethod: 'COD',
        amount: input.amount,
        message: 'Cash on delivery selected. Payment due upon package receipt.',
        timestamp: new Date(),
      };
    }

    // Demo Online Payment simulation
    const txnId = `DEMO-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      transactionId: txnId,
      paymentStatus: 'PAID',
      paymentMethod: 'DEMO_ONLINE',
      amount: input.amount,
      message: 'Demo online payment authorized and completed instantly.',
      timestamp: new Date(),
    };
  }

  async processRefund(orderId: string, amount: number, reason: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `REF-${Date.now()}-${orderId.substring(0, 6)}`,
      paymentStatus: 'REFUNDED',
      paymentMethod: 'DEMO_ONLINE',
      amount,
      message: `Refund of ${amount} issued for order ${orderId}: ${reason}`,
      timestamp: new Date(),
    };
  }
}

export const paymentService = new DefaultPaymentService();
