import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const explorePriceId = process.env.STRIPE_PRICE_ID_EXPLORE || '';
const creatorPriceId = process.env.STRIPE_PRICE_ID_CREATOR || '';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const priceIds: Record<string, string> = {
  explore: explorePriceId, // Replace with your actual Stripe price ID
  creator: creatorPriceId, // Replace with your actual Stripe price ID
};

const priceNames: Record<string, string> = {
  [explorePriceId]: 'explore',
  [creatorPriceId]: 'creator',
};

export function getPlanName(priceId: string) {
  return priceNames[priceId];
}

export function getPriceId(plan: 'explore' | 'creator') {
  return priceIds[plan];
}