import { useSession } from '../features/auth/session-context';

export const useAuth = () => {
  return useSession();
};
