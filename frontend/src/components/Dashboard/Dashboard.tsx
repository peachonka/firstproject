import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  Building2,
  Calendar,
  Target
} from 'lucide-react';
import { useData } from '../../contexts/ProjectContext';
import { useUser } from '../../contexts/UserContext';

export function Dashboard() {
  const { defects, projects } = useData();
  const { user } = useUser();

  const stats = {
    totalDefects: defects.length,
    newDefects: defects.filter(d => d.status === 0).length,
    inProgressDefects: defects.filter(d => d.status === 1).length,
    CompletedDefects: defects.filter(d => d.status === 3).length,
    criticalDefects: defects.filter(d => d.priority === 3).length,
    ActiveProjects: projects.filter(p => p.status === 'Active').length
  };

  const recentDefects = defects
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const priorityColors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-orange-600 bg-orange-50',
    critical: 'text-red-600 bg-red-50'
  };

  const statusColors = {
    new: 'text-blue-600 bg-blue-50',
    InProgress: 'text-yellow-600 bg-yellow-50',
    UnderReview: 'text-purple-600 bg-purple-50',
    closed: 'text-green-600 bg-green-50',
    cancelled: 'text-gray-600 bg-gray-50'
  };

  const statusLabels = {
    new: 'Новый',
    InProgress: 'В работе',
    UnderReview: 'На проверке',
    closed: 'Закрыт',
    cancelled: 'Отменен'
  };

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический'
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Добро пожаловать, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Обзор текущего состояния проектов и дефектов
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего дефектов</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDefects}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">↗ +12%</span>
            <span className="text-sm text-gray-600 ml-2">с прошлого месяца</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Новые дефекты</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newDefects}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-red-600 font-medium">↗ +3</span>
            <span className="text-sm text-gray-600 ml-2">за последние 24ч</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">В работе</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgressDefects}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">↘ -2</span>
            <span className="text-sm text-gray-600 ml-2">за эту неделю</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Закрыто</p>
              <p className="text-2xl font-bold text-gray-900">{stats.CompletedDefects}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">↗ +8</span>
            <span className="text-sm text-gray-600 ml-2">за эту неделю</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Defects */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Последние дефекты</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentDefects.map((defect) => {
                  const project = projects.find(p => p.id === defect.projectId);
                  return (
                    <div key={defect.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {defect.title}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {project?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[defect.status]}`}>
                            {statusLabels[defect.status]}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityColors[defect.priority]}`}>
                            {priorityLabels[defect.priority]}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(defect.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Активные проекты</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {projects.filter(p => p.status === 'Active').map((project) => (
                  <div key={project.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-600">{project.phases.length} этапов</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Критические дефекты</h2>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.criticalDefects}</p>
                <p className="text-sm text-gray-600">требуют немедленного внимания</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}