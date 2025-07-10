import { User } from './types';

const STORAGE_KEY = 'document-tracker-user';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@company.com',
    role: 'Admin',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '2',
    name: 'Sarah HR',
    email: 'hr@company.com',
    role: 'HR',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '3',
    name: 'Mike Accounting',
    email: 'accounting@company.com',
    role: 'Accounting',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '4',
    name: 'Lisa Audit',
    email: 'audit@company.com',
    role: 'Audit',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  }
];

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const login = (email: string, password: string): User | null => {
  // Mock login - in production, this would be a real API call
  const user = mockUsers.find(u => u.email === email);
  if (user && password === 'password') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getRolePermissions = (role: string) => {
  const permissions = {
    Admin: {
      canViewAll: true,
      canUpload: true,
      canApprove: true,
      canDelete: true,
      canManageUsers: true,
      canViewReports: true
    },
    HR: {
      canViewAll: false,
      canUpload: true,
      canApprove: true,
      canDelete: false,
      canManageUsers: false,
      canViewReports: true
    },
    Accounting: {
      canViewAll: false,
      canUpload: true,
      canApprove: true,
      canDelete: false,
      canManageUsers: false,
      canViewReports: true
    },
    Audit: {
      canViewAll: true,
      canUpload: false,
      canApprove: false,
      canDelete: false,
      canManageUsers: false,
      canViewReports: true
    }
  };
  
  return permissions[role as keyof typeof permissions] || permissions.HR;
};