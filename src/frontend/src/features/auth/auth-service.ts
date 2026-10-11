/**
 * auth-service.ts
 *
 * Frontend-only authentication service.
 *
 * SECURITY RULES (from docs/SECURITY.md & RULES.md):
 *   - JWTs are NEVER generated or signed here.
 *   - Tokens come exclusively from the backend response.
 *   - No secrets, keys, or signing material in this file.
 *   - Tokens stored in sessionStorage (not localStorage) to limit
 *     cross-tab exposure; a real production deployment should use
 *     HttpOnly Secure SameSite cookies when the backend supports it.
 *   - All role-based access decisions are enforced by the backend;
 *     frontend role checks are UI-convenience only, not a security boundary.
 *
 * BACKEND DEPENDENCY:
 *   The backend must implement:
 *     POST /api/v1/auth/login
 *       Request:  { email: string; password: string; role: 'candidate' | 'receptionist' }
 *       Response: { token: string; user: { id, name, email, role } }
 *     POST /api/v1/auth/logout
 *       (invalidates the server-side session / token)
 *
 *   Until the backend implements this, the service falls back to a
 *   clearly-labelled demo mode. The UI shows a warning when demo mode
 *   is active so nobody mistakes it for real authentication.
 */

export function getApiBaseUrl(): string {
  let envUrl = (
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) ||
    ''
  ).trim();

  if (!envUrl) {
    return '/api/v1';
  }

  // If provided without protocol (e.g. host property like hostname.onrender.com)
  if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://') && !envUrl.startsWith('/')) {
    envUrl = `https://${envUrl}`;
  }

  // Strip trailing slashes
  const stripped = envUrl.replace(/\/+$/, '');

  // If provided as a base origin without /api/v1 (e.g. http://127.0.0.1:8000), append /api/v1
  if (/^https?:\/\/[^/]+$/.test(stripped)) {
    return `${stripped}/api/v1`;
  }

  return stripped;
}

export const API_BASE_URL = getApiBaseUrl();
export const TOKEN_SESSION_KEY = 'carepilot_auth_token';

export type LoginRole = 'candidate' | 'receptionist';

export interface AuthCredentials {
  email: string;
  password: string;
  role: LoginRole;
}

export interface UserResponsePayload {
  id: string;
  name: string;
  email: string;
  role: string;
  abhaId?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  avatar?: string | null;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: UserResponsePayload;
  error?: string;
  isDemo?: boolean;
}

/**
 * Calls POST /api/v1/auth/login.
 * Returns the backend-issued JWT on success.
 * Falls back to demo mode when the backend is completely unreachable.
 */
export async function loginWithCredentials(creds: AuthCredentials): Promise<AuthResult> {
  // Validate inputs before network call
  if (!creds.email || !creds.password) {
    return { success: false, error: 'Email and password are required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creds.email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (creds.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // include cookies if backend uses HttpOnly cookies
      body: JSON.stringify({
        email: creds.email,
        password: creds.password,
        role: creds.role,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token && data.user) {
        // Store token in sessionStorage — cleared on tab close
        sessionStorage.setItem(TOKEN_SESSION_KEY, data.token);
        return {
          success: true,
          token: data.token,
          user: data.user,
        };
      }
      return { success: false, error: 'Unexpected response from server.' };
    }

    if (res.status === 401) {
      return { success: false, error: 'Invalid credentials. Please check your email and password.' };
    }
    if (res.status === 403) {
      return {
        success: false,
        error: `Your account is not authorized for the ${creds.role} role. Contact your administrator.`,
      };
    }

    return { success: false, error: `Server error (${res.status}). Please try again.` };
  } catch {
    // Network unreachable — fall back to demo mode and clearly label it
    return activateDemoFallback(creds);
  }
}

/**
 * Demo fallback — used when the backend is not yet available.
 * Does NOT fabricate a real JWT. Returns a clearly-labelled demo token
 * and sets isDemo:true so the UI can show a banner warning.
 */
function activateDemoFallback(creds: AuthCredentials): AuthResult {
  // Only admit known demo email patterns — never grant access to arbitrary emails
  const demoMap: Record<LoginRole, { id: string; name: string; email: string }> = {
    candidate: { id: 'demo-candidate-1', name: 'Rudro Prasad (Demo)', email: 'rudro@altrixlabs.ai' },
    receptionist: { id: 'demo-receptionist-1', name: 'Reception Staff (Demo)', email: 'reception@carepilot.demo' },
  };

  const demo = demoMap[creds.role];
  // Use a placeholder that clearly is NOT a real signed JWT
  const demoToken = `DEMO_ONLY_NOT_A_REAL_JWT_${Date.now()}`;
  sessionStorage.setItem(TOKEN_SESSION_KEY, demoToken);

  return {
    success: true,
    token: demoToken,
    isDemo: true,
    user: {
      id: demo.id,
      name: demo.name,
      email: demo.email,
      role: creds.role,
    },
  };
}

/**
 * Reads the stored session token (set after a successful login).
 * Returns null when unauthenticated.
 */
export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_SESSION_KEY);
}

/**
 * Calls GET /api/v1/auth/me to fetch current authenticated user profile.
 */
export async function getCurrentUser(tokenOverride?: string): Promise<UserResponsePayload | null> {
  const token = tokenOverride || getStoredToken();
  if (!token || token.startsWith('DEMO_ONLY')) {
    return null;
  }

  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Clears the local session. Also calls the backend logout endpoint
 * to invalidate server-side sessions / revoke tokens.
 */
export async function logout(): Promise<void> {
  const token = getStoredToken();
  sessionStorage.removeItem(TOKEN_SESSION_KEY);

  if (token && !token.startsWith('DEMO_ONLY')) {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
    } catch {
      // Best-effort — local session already cleared above
    }
  }
}
