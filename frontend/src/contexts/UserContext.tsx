import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiService } from '../services/apiService';

// Определяем тип для ролей
type UserRole = 'manager' | 'engineer' | 'observer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole; // Изменяем тип на UserRole
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

const UserContext = createContext<UserContextType | undefined>(undefined);

// Функция для сохранения пользователя в localStorage
const saveUserToStorage = (user: User | null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// Функция для загрузки пользователя из localStorage
const loadUserFromStorage = (): User | null => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error loading user from storage:', error);
  }
  return null;
};

// Функция для валидации роли
const isValidRole = (role: string): role is UserRole => {
  return ['manager', 'engineer', 'observer'].includes(role);
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUserFromStorage());
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функция для преобразования роли
  const mapRoleToString = (role: any): UserRole => {
    if (typeof role === 'string') {
      const normalizedRole = role.toLowerCase();
      if (isValidRole(normalizedRole)) {
        return normalizedRole;
      }
    }
    
    if (typeof role === 'number') {
      const roleMap: { [key: number]: UserRole } = {
        0: 'manager',
        1: 'engineer', 
        2: 'observer'
      };
      return roleMap[role] || 'observer';
    }
    
    return 'observer';
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const userData = await apiService.login({ email, password });
      
      // Преобразуем роль в строку
      const normalizedUser: User = {
        ...userData,
        role: mapRoleToString(userData.role)
      };
      
      setUser(normalizedUser);
      saveUserToStorage(normalizedUser); // Сохраняем в localStorage
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
    saveUserToStorage(null); // Удаляем из localStorage
  };

  // Загрузка пользователей при инициализации
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await apiService.getUsers();
        // Нормализуем роли для всех пользователей
        const normalizedUsers = usersData.map(user => ({
          ...user,
          role: mapRoleToString(user.role)
        }));
        setUsers(normalizedUsers);
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