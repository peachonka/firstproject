import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiService } from '../services/apiService.ts';


export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Функция для преобразования роли в строку
const mapRoleToString = (role: any): string => {
  if (typeof role === 'string') {
    return role.toLowerCase();
  }
  
  if (typeof role === 'number') {
    // Если роль пришла числом (enum)
    const roleMap: { [key: number]: string } = {
      0: 'manager',
      1: 'engineer', 
      2: 'observer'
    };
    return roleMap[role] || 'observer';
  }
  
  return 'observer';
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
  setLoading(true);
  setError(null);
  try {
    const userData = await apiService.login({ email, password });
    
    // Преобразуем роль в строку
    const normalizedUser = {
      ...userData,
      role: mapRoleToString(userData.role)
    };
    
    setUser(normalizedUser);
    return true;
  } catch (err) {
    setError('Login failed');
    console.error('Login error:', err);
    return false;
  } finally {
    setLoading(false);
  }
};

  const logout = () => {
    setUser(null);
    setError(null);
  };

  // Загрузка пользователей при инициализации
  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await apiService.getUsers();
        setUsers(usersData);
      } catch (err) {
        console.error('Error loading users:', err);
      }
    };
    loadUsers();
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      users, 
      login, 
      logout, 
      loading, 
      error 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}