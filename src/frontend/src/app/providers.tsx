import React from 'react';
import { SessionProvider } from '../features/auth/session-context';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
};
