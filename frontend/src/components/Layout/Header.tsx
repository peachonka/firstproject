import React from 'react';
import { LogOut, User, Bell } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

// Определяем тип для ролей
type UserRole = 'manager' | 'engineer' | 'observer';

const roleNames: Record<UserRole, string> = {
  manager: 'Менеджер',
  engineer: 'Инженер',
  observer: 'Наблюдатель'
};

// Функция для безопасного получения названия роли
const getRoleName = (role: string): string => {
  return roleNames[role as UserRole] || role;
};

export function Header() {
  const { user, logout } = useUser();

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Система управления дефектами
          </h1>
          <p className="text-sm text-gray-600">
            Контроль качества строительства
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{getRoleName(user.role)}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Выйти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}