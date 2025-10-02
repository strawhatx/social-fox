import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const priceIds: Record<string, string> = {
  explore: 'price_1SC9fNGdcsiay3y1SYYDoU8U', // Replace with your actual Stripe price ID
  creator: 'price_1SCAdOGdcsiay3y1T80aDVR1', // Replace with your actual Stripe price ID
};

const planNames: Record<string, string> = {
  price_1SC9fNGdcsiay3y1SYYDoU8U: 'explore',
  price_1SCAdOGdcsiay3y1T80aDVR1: 'creator',
};

export function getPlanName(priceId: 'price_1SC9fNGdcsiay3y1SYYDoU8U'|'price_1SCAdOGdcsiay3y1T80aDVR1') {
  return priceIds[priceId];
}

export function getPriceId(plan: 'explore' | 'creator') {
  return priceIds[plan];
}