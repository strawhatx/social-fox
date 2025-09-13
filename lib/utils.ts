import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const product_url_ids = {
  explore: '572df4b0-4138-4139-87bc-e040a8016baf',
  creative: 'bd038d2c-e971-42c7-bb26-e567b3f86c62'
}

export const product_ids = {
  explore: '631823',
  creative: '631761'
}
