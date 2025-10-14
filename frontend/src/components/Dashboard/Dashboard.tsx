import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  Building2,
  Calendar,
  Target,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useData } from '../../contexts/ProjectContext';
import { useUser } from '../../contexts/UserContext';

// Простые графики без внешних зависимостей
const SimpleBarChart = ({ data, labels, color = '#3b82f6', title }: { data: number[], labels: string[], color?: string, title: string }) => {
  const maxValue = Math.max(...data, 1);
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-4">{title}</h4>
      <div className="flex items-end justify-between h-32 gap-1">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="text-xs text-gray-500 mb-1">{value}</div>
            <div 
              className="w-full rounded-t transition-all duration-300 hover:opacity-80"
              style={{ 
                height: `${(value / maxValue) * 80}%`,
                backgroundColor: color,
                minHeight: value > 0 ? '4px' : '0'
              }}
            />
            <span className="text-xs text-gray-600 mt-2 text-center leading-tight">
              {labels[index].split(' ').map((word, i) => (
                <div key={i}>{word}</div>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SimplePieChart = ({ data, labels, colors, title }: { data: number[], labels: string[], colors: string[], title: string }) => {
  const total = data.reduce((sum, value) => sum + value, 0) || 1;
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-4">{title}</h4>
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 rounded-full mb-4">
          {data.map((value, index) => {
            if (value === 0) return null;
            
            const percentage = (value / total) * 100;
            const cumulativePercentage = data.slice(0, index).reduce((sum, val) => sum + (val / total) * 100, 0);
            
            return (
              <div
                key={index}
                className="absolute inset-0 rounded-full border-4 border-white"
                style={{
                  background: `conic-gradient(${colors[index]} 0% ${percentage}%, transparent ${percentage}% 100%)`,
                  transform: `rotate(${cumulativePercentage * 3.6}deg)`
                }}
              />
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-700">{total}</span>
          </div>
        </div>
        <div className="space-y-2 w-full">
          {data.map((value, index) => (
            value > 0 && (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span className="text-gray-700">{labels[index]}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {value} ({Math.round((value / total) * 100)}%)
                </span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

const TrendChart = ({ data, labels, title }: { data: number[], labels: string[], title: string }) => {
  const maxValue = Math.max(...data, 1);
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-4">{title}</h4>
      <div className="relative h-32">
        <svg viewBox={`0 0 ${data.length * 40} 100`} className="w-full h-full">
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={data.map((value, index) => 
              `${index * 40 + 20},${100 - (value / maxValue) * 80}`
            ).join(' ')}
          />
          {data.map((value, index) => (
            <circle
              key={index}
              cx={index * 40 + 20}
              cy={100 - (value / maxValue) * 80}
              r="3"
              fill="#3b82f6"
            />
          ))}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        {labels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  );
};

export function Dashboard() {
  const { defects, projects, refreshData } = useData();
  const { user } = useUser();

  const stats = {
    totalDefects: defects.length,
    newDefects: defects.filter(d => d.status === 0).length,
    inProgressDefects: defects.filter(d => d.status === 1).length,
    completedDefects: defects.filter(d => d.status === 3).length,
    criticalDefects: defects.filter(d => d.priority === 3).length,
    activeProjects: projects.filter(p => p.status === 'Active').length,
    overdueDefects: defects.filter(d => 
      d.dueDate && new Date(d.dueDate) < new Date() && d.status !== 3
    ).length
  };

  // Данные для графиков
  const statusDistribution = [
    defects.filter(d => d.status === 0).length, // Новые
    defects.filter(d => d.status === 1).length, // В работе
    defects.filter(d => d.status === 2).length, // На проверке
    defects.filter(d => d.status === 3).length, // Закрытые
    defects.filter(d => d.status === 4).length  // Отмененные
  ];

  const priorityDistribution = [
    defects.filter(d => d.priority === 0).length, // Низкий
    defects.filter(d => d.priority === 1).length, // Средний
    defects.filter(d => d.priority === 2).length, // Высокий
    defects.filter(d => d.priority === 3).length  // Критический
  ];

  const defectsByProject = projects.map(project => 
    defects.filter(d => d.projectId === project.id).length
  );

  // Данные для тренда (последние 7 дней)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  });

  const defectsTrend = last7Days.map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return defects.filter(defect => {
      const defectDate = new Date(defect.createdAt);
      return defectDate.toDateString() === date.toDateString();
    }).length;
  });

  const recentDefects = defects
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const criticalDefects = defects
    .filter(d => d.priority === 3)
    .slice(0, 3);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Добро пожаловать, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Обзор текущего состояния проектов и дефектов
          </p>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Всего дефектов</p>
              <p className="text-3xl font-bold mt-1">{stats.totalDefects}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Новые дефекты</p>
              <p className="text-3xl font-bold mt-1">{stats.newDefects}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
          <div className="mt-4 flex items-center text-orange-100 text-sm">
            <Activity className="w-4 h-4 mr-1" />
            <span>Требуют внимания</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Закрыто дефектов</p>
              <p className="text-3xl font-bold mt-1">{stats.completedDefects}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Активные проекты</p>
              <p className="text-3xl font-bold mt-1">{stats.activeProjects}</p>
            </div>
            <Building2 className="w-8 h-8 text-purple-200" />
          </div>
          <div className="mt-4 flex items-center text-purple-100 text-sm">
            <Target className="w-4 h-4 mr-1" />
            <span>В работе</span>
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <SimplePieChart
          data={statusDistribution}
          labels={['Новые', 'В работе', 'На проверке', 'Закрытые', 'Отмененные']}
          colors={['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#6b7280']}
          title="Статусы дефектов"
        />

        <SimpleBarChart
          data={priorityDistribution}
          labels={['Низкий', 'Средний', 'Высокий', 'Критический']}
          color="#ef4444"
          title="Приоритеты дефектов"
        />

        <SimpleBarChart
          data={defectsByProject}
          labels={projects.map(p => p.name)}
          color="#10b981"
          title="Дефекты по проектам"
        />

        <TrendChart
          data={defectsTrend}
          labels={last7Days}
          title="Новые дефекты (7 дней)"
        />
      </div>

      {/* Нижняя часть */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Критические дефекты */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Критические дефекты
                <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                  {stats.criticalDefects}
                </span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {criticalDefects.map((defect) => {
                  const project = projects.find(p => p.id === defect.projectId);
                  const isOverdue = defect.dueDate && new Date(defect.dueDate) < new Date();
                  
                  return (
                    <div key={defect.id} className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="w-3 h-3 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-red-900 truncate">
                          {defect.title}
                        </h3>
                        <p className="text-sm text-red-700 truncate">
                          {project?.name} • {defect.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Критический
                          </span>
                          {isOverdue && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-200 text-red-900">
                              Просрочен
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-red-600">
                        {new Date(defect.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  );
                })}
                {criticalDefects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p>Критических дефектов нет</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Последние дефекты */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Последние дефекты</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentDefects.map((defect) => {
                  const project = projects.find(p => p.id === defect.projectId);
                  const isCritical = defect.priority === 3;
                  
                  return (
                    <div key={defect.id} className={`flex items-start gap-4 p-4 rounded-lg border ${
                      isCritical ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        isCritical ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {defect.title}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {project?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            defect.status === 0 ? 'bg-blue-100 text-blue-800' :
                            defect.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                            defect.status === 3 ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {defect.status === 0 ? 'Новый' :
                             defect.status === 1 ? 'В работе' :
                             defect.status === 3 ? 'Закрыт' : 'Отменен'}
                          </span>
                          {isCritical && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Критический
                            </span>
                          )}
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

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Активные проекты */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Активные проекты</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {projects.filter(p => p.status === 'Active').map((project) => {
                  const projectDefects = defects.filter(d => d.projectId === project.id);
                  const criticalCount = projectDefects.filter(d => d.priority === 3).length;
                  
                  return (
                    <div key={project.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-600">
                          {projectDefects.length} дефектов
                          {criticalCount > 0 && (
                            <span className="text-red-600 ml-1">• {criticalCount} критических</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Статистика эффективности */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Эффективность</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Завершено дефектов</span>
                  <span className="text-sm font-semibold text-green-600">
                    {stats.completedDefects} / {stats.totalDefects}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.totalDefects > 0 ? (stats.completedDefects / stats.totalDefects) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Среднее время решения</span>
                  <span className="text-sm font-semibold text-blue-600">2.3 дня</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Просроченные дефекты</span>
                  <span className="text-sm font-semibold text-red-600">{stats.overdueDefects}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}