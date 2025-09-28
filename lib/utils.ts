import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const priceIds: Record<string, string> = {
  explore: 'prod_T8QWP0nCsr4qME', // Replace with your actual Stripe price ID
  creator: 'prod_T8QWP0nCsr4qME', // Replace with your actual Stripe price ID
};

export function getPriceId(plan: 'explore' | 'creator') {
  return priceIds[plan];
}