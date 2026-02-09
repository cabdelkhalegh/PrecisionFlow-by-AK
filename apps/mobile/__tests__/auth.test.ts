import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as SecureStore from 'expo-secure-store';
import {
  saveAuthToken,
  getAuthToken,
  saveAuthUser,
  getAuthUser,
  clearAuth,
  isAuthenticated,
} from '../lib/auth';

describe('Auth utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save and retrieve an auth token', async () => {
    await saveAuthToken('test-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'test-token');
  });

  it('should get auth token', async () => {
    (SecureStore.getItemAsync as ReturnType<typeof vi.fn>).mockResolvedValueOnce('test-token');
    const token = await getAuthToken();
    expect(token).toBe('test-token');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
  });

  it('should return null when no token is stored', async () => {
    (SecureStore.getItemAsync as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    const token = await getAuthToken();
    expect(token).toBeNull();
  });

  it('should save and retrieve user data', async () => {
    const user = { id: '1', email: 'test@example.com', role: 'admin' };
    await saveAuthUser(user);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_user', JSON.stringify(user));
  });

  it('should get user data', async () => {
    const user = { id: '1', email: 'test@example.com', role: 'admin' };
    (SecureStore.getItemAsync as ReturnType<typeof vi.fn>).mockResolvedValueOnce(JSON.stringify(user));
    const result = await getAuthUser();
    expect(result).toEqual(user);
  });

  it('should return null when no user is stored', async () => {
    (SecureStore.getItemAsync as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    const result = await getAuthUser();
    expect(result).toBeNull();
  });

  it('should clear auth data', async () => {
    await clearAuth();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_user');
  });

  it('should return true when authenticated', async () => {
    (SecureStore.getItemAsync as ReturnType<typeof vi.fn>).mockResolvedValueOnce('test-token');
    const result = await isAuthenticated();
    expect(result).toBe(true);
  });

  it('should return false when not authenticated', async () => {
    (SecureStore.getItemAsync as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    const result = await isAuthenticated();
    expect(result).toBe(false);
  });
});
