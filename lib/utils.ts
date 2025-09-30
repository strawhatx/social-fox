import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const priceIds: Record<string, string> = {
  explore: 'prod_T8QWP0nCsr4qME', // Replace with your actual Stripe price ID
  creator: 'prod_T8RWejfEUXJAlg', // Replace with your actual Stripe price ID
};

const planNames: Record<string, string> = {
  prod_T8QWP0nCsr4qME: 'explore',
  prod_T8RWejfEUXJAlg: 'creator',
};

export function getPlanName(priceId: 'prod_T8QWP0nCsr4qME'|'prod_T8QWP0nCsr4qME') {
  return priceIds[priceId];
}

export function getPriceId(plan: 'explore' | 'creator') {
  return priceIds[plan];
}