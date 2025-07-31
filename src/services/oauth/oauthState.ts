// Client-side OAuth state management using localStorage
import { setCache, getFromCache } from '../../lib/api';

export const saveOAuthState = async (state: string, expiresInMinutes: number = 60) => {
  setCache(`oauth_state_${state}`, { state, timestamp: Date.now() }, expiresInMinutes);
};

export const savePkceVerifier = async (state: string, verifier: string) => {
  setCache(`oauth_verifier_${state}`, verifier, 60);
};

export const getOAuthState = (state: string): string | null => {
  const data = getFromCache(`oauth_state_${state}`);
  return data?.state || null;
};

export const getPkceVerifier = (state: string): string | null => {
  return getFromCache(`oauth_verifier_${state}`);
};