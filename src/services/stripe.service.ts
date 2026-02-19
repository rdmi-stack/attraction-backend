import crypto from 'crypto';

// Mock Stripe service - simulates Stripe API responses
// Replace with real Stripe integration when ready for production payments

interface MockPaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  metadata: Record<string, string>;
  payment_method_types: string[];
  created: number;
}

interface MockRefund {
  id: string;
  payment_intent: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  created: number;
}

export const createMockPaymentIntent = (
  amount: number,
  currency: string,
  metadata: Record<string, string>
): MockPaymentIntent => {
  const id = `pi_mock_${crypto.randomBytes(12).toString('hex')}`;
  return {
    id,
    client_secret: `${id}_secret_${crypto.randomBytes(12).toString('hex')}`,
    amount,
    currency: currency.toLowerCase(),
    status: 'requires_confirmation',
    metadata,
    payment_method_types: ['card'],
    created: Math.floor(Date.now() / 1000),
  };
};

export const confirmMockPayment = (paymentIntent: MockPaymentIntent): MockPaymentIntent => {
  return {
    ...paymentIntent,
    status: 'succeeded',
  };
};

export const createMockRefund = (
  paymentIntentId: string,
  amount: number
): MockRefund => {
  return {
    id: `re_mock_${crypto.randomBytes(12).toString('hex')}`,
    payment_intent: paymentIntentId,
    amount,
    status: 'succeeded',
    created: Math.floor(Date.now() / 1000),
  };
};
