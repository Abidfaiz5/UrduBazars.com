import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isOwnerOrAdmin: boolean;
  login: (pin: string) => Promise<boolean>;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const DEFAULT_USERS: Record<UserRole, User> = {
  OWNER: {
    id: 'user-owner',
    name: 'Mian Abid Faiz (Owner)',
    role: 'OWNER',
    pin: '1234',
    email: 'abidfaiz14@gmail.com',
    phone: '+92 300 1234567'
  },
  ADMIN: {
    id: 'user-admin',
    name: 'Shop Manager',
    role: 'ADMIN',
    pin: '1234',
    email: 'manager@urdubazars.pk'
  },
  STAFF: {
    id: 'user-staff',
    name: 'Counter Staff',
    role: 'STAFF',
    pin: '0000'
  },
  CASHIER: {
    id: 'user-cashier',
    name: 'POS Cashier 1',
    role: 'CASHIER',
    pin: '0000'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ub_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return DEFAULT_USERS.OWNER; // Default to Owner for full access in AI Studio preview
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ub_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ub_auth_user');
    }
  }, [currentUser]);

  const login = async (pin: string): Promise<boolean> => {
    if (pin === '1234') {
      setCurrentUser(DEFAULT_USERS.OWNER);
      return true;
    }
    if (pin === '0000') {
      setCurrentUser(DEFAULT_USERS.CASHIER);
      return true;
    }
    return false;
  };

  const switchRole = (role: UserRole) => {
    setCurrentUser(DEFAULT_USERS[role] || DEFAULT_USERS.OWNER);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isOwnerOrAdmin = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isOwnerOrAdmin,
        login,
        switchRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
