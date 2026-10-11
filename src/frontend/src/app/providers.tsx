import React from 'react';
import { SessionProvider } from '../features/auth/session-context';
import { ThemeProvider } from '../features/theme/theme-context';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
};
