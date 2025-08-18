import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Stripe checkout URLs
export const STRIPE_URLS = {
  FREE_SUBSCRIPTION: 'https://buy.stripe.com/test_5kQ28kcbBak54An28b3VC00',
  PRO_SUBSCRIPTION: 'https://buy.stripe.com/test_9B68wIgrRdwhd6T9AD3VC01',
  BUY_CREDITS: 'https://buy.stripe.com/test_28E00cfnNbo9ff10033VC02',
  
} as const

// Stripe customer portal URL
export const STRIPE_CUSTOMER_PORTAL = 'https://billing.stripe.com/p/login/test_5kQ28kcbBak54An28b3VC00';

// Helper function to create Stripe URL with user info
export function createStripeUrl(type: keyof typeof STRIPE_URLS, userId: string, userEmail?: string) {
  const params = new URLSearchParams();
  
  // Use our internal user ID as reference to link back to our database
  // This allows us to match Stripe events to our users via webhook
  params.append('client_reference_id', userId);
  
  // Pre-fill customer email in Stripe checkout for better UX
  if (userEmail) {
    params.append('prefilled_email', userEmail);
  }
  
  return `${STRIPE_URLS[type]}?${params.toString()}`
}

// Helper function to create customer portal URL with prefilled email
export function createCustomerPortalUrl(userEmail: string) {
  return `${STRIPE_CUSTOMER_PORTAL}?prefilled_email=${encodeURIComponent(userEmail)}`
}


