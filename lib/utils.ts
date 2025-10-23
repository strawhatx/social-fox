import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const launchPriceId = process.env.STRIPE_PRICE_ID_LAUNCH || '';
const growPriceId = process.env.STRIPE_PRICE_ID_GROW || '';
const scalePriceId = process.env.STRIPE_PRICE_ID_SCALE || '';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const priceIds: Record<string, string> = {
  launch: launchPriceId,
  grow: growPriceId,
  scale: scalePriceId,
};

const priceNames: Record<string, string> = {
  [launchPriceId]: 'launch',
  [growPriceId]: 'grow',
  [scalePriceId]: 'scale',
};

export function getPlanName(priceId: string) {
  return priceNames[priceId];
}

export function getPriceId(plan: 'launch' | 'grow' | 'scale' | 'explore' | 'creator') {
  // Handle legacy plan names
  if (plan === 'explore') return launchPriceId;
  if (plan === 'creator') return growPriceId;
  
  return priceIds[plan];
}