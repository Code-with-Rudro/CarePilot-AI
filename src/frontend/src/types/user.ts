export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'caregiver' | 'clinician_reviewer' | 'receptionist';
  avatar?: string;
  abhaId?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  emergencyContact?: string;
}

export interface UserSession {
  currentUser: User;
  token?: string;
  isAuthenticated: boolean;
  activeRole: string;
}
