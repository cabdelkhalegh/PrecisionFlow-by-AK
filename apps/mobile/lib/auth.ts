/**
 * Authentication utilities for mobile app
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

async function canUseSecureStore(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

function canUseWebStorage(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;
}

async function setItem(key: string, value: string): Promise<void> {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  if (canUseWebStorage()) {
    window.localStorage.setItem(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (await canUseSecureStore()) {
    return await SecureStore.getItemAsync(key);
  }

  if (canUseWebStorage()) {
    return window.localStorage.getItem(key);
  }

  return null;
}

async function deleteItem(key: string): Promise<void> {
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  if (canUseWebStorage()) {
    window.localStorage.removeItem(key);
  }
}

/**
 * Save auth token securely
 */
export async function saveAuthToken(token: string): Promise<void> {
  await setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Get auth token
 */
export async function getAuthToken(): Promise<string | null> {
  return await getItem(AUTH_TOKEN_KEY);
}

/**
 * Save user data
 */
export async function saveAuthUser(user: AuthUser): Promise<void> {
  await setItem(AUTH_USER_KEY, JSON.stringify(user));
}

/**
 * Get user data
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const userStr = await getItem(AUTH_USER_KEY);
  if (!userStr) {
    return null;
  }

  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Clear auth data (logout)
 */
export async function clearAuth(): Promise<void> {
  await deleteItem(AUTH_TOKEN_KEY);
  await deleteItem(AUTH_USER_KEY);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}
