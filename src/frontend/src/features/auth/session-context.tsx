import React, { createContext, useContext, useState, useCallback } from 'react';
import { User } from '../../types/user';
import { DEMO_USERS } from '../../lib/constants';
import { logout as serviceLogout, getStoredToken, UserResponsePayload } from './auth-service';

export type UserRole = 'candidate' | 'receptionist' | 'patient' | 'caregiver' | 'clinician_reviewer';

interface SessionContextType {
  currentUser: User;
  isAuthenticated: boolean;
  authToken: string | null;
  isDemoMode: boolean;
  /** Legacy demo login — kept for backward compat with existing ProfileSelector usage */
  loginAs: (user: User) => void;
  /** JWT-based login called after a successful auth-service response */
  loginWithJwt: (userPayload: UserResponsePayload, token?: string) => void;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  availableUsers: User[];
  currentRole: string;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(getStoredToken()));
  const [authToken, setAuthToken] = useState<string | null>(getStoredToken());
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const loginAs = useCallback((user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsDemoMode(false);
  }, []);

  const loginWithJwt = useCallback(
    (userPayload: UserResponsePayload, token?: string) => {
      // Map backend role names onto the User type's known roles
      const roleMap: Record<string, User['role']> = {
        candidate: 'patient',
        receptionist: 'receptionist',
        patient: 'patient',
        caregiver: 'caregiver',
        clinician_reviewer: 'clinician_reviewer',
      };

      const mappedUser: User = {
        id: userPayload.id,
        name: userPayload.name,
        email: userPayload.email,
        role: (roleMap[userPayload.role] as User['role']) || 'patient',
        avatar: userPayload.avatar ?? undefined,
        abhaId: userPayload.abhaId,
        age: userPayload.age,
        gender: (userPayload.gender as User['gender']) || undefined,
        bloodGroup: userPayload.bloodGroup,
        emergencyContact: userPayload.emergencyContact,
      };

      setCurrentUser(mappedUser);
      setIsAuthenticated(true);
      setAuthToken(token ?? null);

      // If demo token, flag it so UI can show a warning banner
      const isDemo = token?.startsWith('DEMO_ONLY') ?? false;
      setIsDemoMode(isDemo);
    },
    []
  );

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    setIsDemoMode(false);
    setCurrentUser(DEMO_USERS[0]);
    await serviceLogout();
  }, []);

  const updateCurrentUser = useCallback((updates: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <SessionContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authToken,
        isDemoMode,
        loginAs,
        loginWithJwt,
        logout,
        updateCurrentUser,
        availableUsers: DEMO_USERS,
        currentRole: currentUser.role,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
