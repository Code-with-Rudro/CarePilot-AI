import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getApiBaseUrl,
  loginWithCredentials,
  getStoredToken,
  getCurrentUser,
  logout,
  TOKEN_SESSION_KEY,
} from './auth-service';

describe('auth-service', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getApiBaseUrl', () => {
    it('returns /api/v1 by default when no environment variable is set', () => {
      const url = getApiBaseUrl();
      expect(url).toBe('/api/v1');
    });
  });

  describe('loginWithCredentials', () => {
    it('validates email format before making a network call', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const result = await loginWithCredentials({
        email: 'not-an-email',
        password: 'password123',
        role: 'candidate',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('valid email');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('validates password length before making a network call', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const result = await loginWithCredentials({
        email: 'user@example.com',
        password: '123',
        role: 'candidate',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 6 characters');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('successfully authenticates with backend and stores token in sessionStorage', async () => {
      const mockResponse = {
        token: 'mock-jwt-token-12345',
        user: {
          id: 'user-rudro',
          email: 'rudro@altrixlabs.ai',
          name: 'Rudro Prasad Panigrahi',
          role: 'candidate',
          abhaId: '91-4829-1029-4821',
          age: 28,
          gender: 'Male',
          bloodGroup: 'B+',
          emergencyContact: '+91 98765 43210',
          avatar: null,
        },
        token_type: 'bearer',
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await loginWithCredentials({
        email: 'rudro@altrixlabs.ai',
        password: 'carepilot123',
        role: 'candidate',
      });

      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-jwt-token-12345');
      expect(result.user?.id).toBe('user-rudro');
      expect(result.user?.abhaId).toBe('91-4829-1029-4821');
      expect(getStoredToken()).toBe('mock-jwt-token-12345');
    });

    it('returns clear error on 401 unauthorized', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Invalid credentials' }),
      } as Response);

      const result = await loginWithCredentials({
        email: 'wrong@example.com',
        password: 'wrongpassword',
        role: 'candidate',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid credentials');
    });

    it('returns clear error on 403 forbidden', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ detail: 'Forbidden role' }),
      } as Response);

      const result = await loginWithCredentials({
        email: 'user@example.com',
        password: 'password123',
        role: 'receptionist',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not authorized');
    });

    it('returns exact server error message on 404', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Not Found' }),
      } as Response);

      const result = await loginWithCredentials({
        email: 'user@example.com',
        password: 'password123',
        role: 'candidate',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error (404). Please try again.');
    });
  });

  describe('getCurrentUser', () => {
    it('returns null if no token is stored', async () => {
      const user = await getCurrentUser();
      expect(user).toBeNull();
    });

    it('fetches current user profile from /auth/me with bearer header', async () => {
      sessionStorage.setItem(TOKEN_SESSION_KEY, 'valid-token');
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 'user-rudro',
          email: 'rudro@altrixlabs.ai',
          name: 'Rudro Prasad Panigrahi',
          role: 'candidate',
        }),
      } as Response);

      const user = await getCurrentUser();
      expect(user?.email).toBe('rudro@altrixlabs.ai');
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/v1/auth/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        })
      );
    });
  });

  describe('logout', () => {
    it('clears session token and calls backend logout', async () => {
      sessionStorage.setItem(TOKEN_SESSION_KEY, 'active-token');
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ message: 'Session terminated' }),
      } as Response);

      await logout();

      expect(getStoredToken()).toBeNull();
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/v1/auth/logout',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer active-token',
          }),
        })
      );
    });
  });
});
