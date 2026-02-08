/**
 * Authentication utilities for mobile app
 */

import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Save auth token securely
 */
export async function saveAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

/**
 * Get auth token
 */
export async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

/**
 * Save user data
 */
export async function saveAuthUser(user: AuthUser): Promise<void> {
  await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user));
}

/**
 * Get user data
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const userStr = await SecureStore.getItemAsync(AUTH_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Clear auth data (logout)
 */
export async function clearAuth(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(AUTH_USER_KEY);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}
