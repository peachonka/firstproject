import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  AlertTriangle, 
  BarChart3,
  Settings,
  FileText
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user } = useUser();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Панель управления',
      icon: LayoutDashboard,
      roles: ['manager', 'engineer', 'observer']
    },
    {
      id: 'projects',
      label: 'Проекты',
      icon: Building2,
      roles: ['manager', 'engineer', 'observer']
    },
    {
      id: 'defects',
      label: 'Дефекты',
      icon: AlertTriangle,
      roles: ['manager', 'engineer', 'observer']
    },
    {
      id: 'reports',
      label: 'Отчеты',
      icon: BarChart3,
      roles: ['manager']
    }
  ];

  const filteredItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">BuildControl</h2>
            <p className="text-xs text-gray-600">v2.1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2024 BuildControl System
        </p>
      </div>
    </aside>
  );
}