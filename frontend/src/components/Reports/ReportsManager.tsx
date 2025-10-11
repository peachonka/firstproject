import React, { useState, useMemo } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, PieChart, Users } from 'lucide-react';
import { useData } from '../../contexts/ProjectContext';

export function ReportsManager() {
  const { defects, projects } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedProject, setSelectedProject] = useState('all');

  const filteredDefects = useMemo(() => {
    let filtered = defects;
    
    if (selectedProject !== 'all') {
      filtered = filtered.filter(d => d.projectId === selectedProject);
    }
    
    const now = new Date();
    const startDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return filtered.filter(d => new Date(d.createdAt) >= startDate);
  }, [defects, selectedProject, selectedPeriod]);

  const stats = useMemo(() => {
    const totalDefects = filteredDefects.length;
    const newDefects = filteredDefects.filter(d => d.status === 0).length;
    const inProgressDefects = filteredDefects.filter(d => d.status === 1).length;
    const CompletedDefects = filteredDefects.filter(d => d.status === 3).length;
    const overdueDefects = filteredDefects.filter(d => 
      d.dueDate && new Date(d.dueDate) < new Date() && d.status !== 3
    ).length;
    
    const criticalDefects = filteredDefects.filter(d => d.priority === 3).length;
    const highDefects = filteredDefects.filter(d => d.priority === 2).length;
    const mediumDefects = filteredDefects.filter(d => d.priority === 1).length;
    const lowDefects = filteredDefects.filter(d => d.priority === 0).length;
    
    return {
      totalDefects,
      newDefects,
      inProgressDefects,
      CompletedDefects,
      overdueDefects,
      criticalDefects,
      highDefects,
      mediumDefects,
      lowDefects,
      completionRate: totalDefects > 0 ? Math.round((CompletedDefects / totalDefects) * 100) : 0
    };
  }, [filteredDefects]);

  const projectStats = useMemo(() => {
    const projectMap = new Map();
    
    filteredDefects.forEach(defect => {
      const project = projects.find(p => p.id === defect.projectId);
      if (project) {
        if (!projectMap.has(project.id)) {
          projectMap.set(project.id, {
            name: project.name,
            total: 0,
            new: 0,
            inProgress: 0,
            Completed: 0,
            critical: 0
          });
        }
        
        const stat = projectMap.get(project.id);
        stat.total++;
        
        switch (defect.status) {
          case 0:
            stat.new++;
            break;
          case 1:
            stat.inProgress++;
            break;
          case 3:
            stat.Completed++;
            break;
        }
        
        if (defect.priority === 3) {
          stat.critical++;
        }
      }
    });
    
    return Array.from(projectMap.values()).sort((a, b) => b.total - a.total);
  }, [filteredDefects, projects]);

  const exportReport = () => {
    const reportData = [
      ['Отчет по дефектам', ''],
      ['Период', selectedPeriod === 'week' ? 'Неделя' : 
                selectedPeriod === 'month' ? 'Месяц' : 
                selectedPeriod === 'quarter' ? 'Квартал' : 'Год'],
      ['Дата создания', new Date().toLocaleDateString('ru-RU')],
      [''],
      ['Общая статистика', ''],
      ['Всего дефектов', stats.totalDefects],
      ['Новых', stats.newDefects],
      ['В работе', stats.inProgressDefects],
      ['Завершенных', stats.CompletedDefects],
      ['Просроченных', stats.overdueDefects],
      ['Процент завершения', `${stats.completionRate}%`],
      [''],
      ['По приоритетам', ''],
      ['Критические', stats.criticalDefects],
      ['Высокий', stats.highDefects],
      ['Средний', stats.mediumDefects],
      ['Низкий', stats.lowDefects],
      [''],
      ['По проектам', 'Количество'],
      ...projectStats.map(project => [project.name, project.total])
    ];

    const csvContent = reportData
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `defects_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Отчеты и аналитика</h1>
          <p className="text-gray-600">Анализ эффективности управления дефектами</p>
        </div>
        
        <button
          onClick={exportReport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Экспорт отчета
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Период</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
              <option value="quarter">Квартал</option>
              <option value="year">Год</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Проект</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Все проекты</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего дефектов</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDefects}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Завершено</p>
              <p className="text-3xl font-bold text-green-600">{stats.CompletedDefects}</p>
              <p className="text-sm text-gray-500">{stats.completionRate}% от общего</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Просрочено</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdueDefects}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Критические</p>
              <p className="text-3xl font-bold text-orange-600">{stats.criticalDefects}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <PieChart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Распределение по статусам</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Новые</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats.newDefects}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${stats.totalDefects > 0 ? (stats.newDefects / stats.totalDefects) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">В работе</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats.inProgressDefects}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${stats.totalDefects > 0 ? (stats.inProgressDefects / stats.totalDefects) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Завершенные</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats.CompletedDefects}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stats.totalDefects > 0 ? (stats.CompletedDefects / stats.totalDefects) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Распределение по приоритетам</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Критический</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats.criticalDefects}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${stats.totalDefects > 0 ? (stats.criticalDefects / stats.totalDefects) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Высокий</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats.highDefects}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${stats.totalDefects > 0 ? (stats.highDefects / stats.totalDefects) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Средний</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats.mediumDefects}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${stats.totalDefects > 0 ? (stats.mediumDefects / stats.totalDefects) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Низкий</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats.lowDefects}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stats.totalDefects > 0 ? (stats.lowDefects / stats.totalDefects) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Performance */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Эффективность по проектам</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-900">Проект</th>
                  <th className="pb-3 font-medium text-gray-900">Всего</th>
                  <th className="pb-3 font-medium text-gray-900">Новые</th>
                  <th className="pb-3 font-medium text-gray-900">В работе</th>
                  <th className="pb-3 font-medium text-gray-900">Завершено</th>
                  <th className="pb-3 font-medium text-gray-900">Критические</th>
                  <th className="pb-3 font-medium text-gray-900">Эффективность</th>
                </tr>
              </thead>
              <tbody>
                {projectStats.map((project, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 font-medium text-gray-900">{project.name}</td>
                    <td className="py-4 text-gray-600">{project.total}</td>
                    <td className="py-4 text-gray-600">{project.new}</td>
                    <td className="py-4 text-gray-600">{project.inProgress}</td>
                    <td className="py-4 text-gray-600">{project.Completed}</td>
                    <td className="py-4 text-gray-600">{project.critical}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${project.total > 0 ? (project.Completed / project.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {project.total > 0 ? Math.round((project.Completed / project.total) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {projectStats.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      Нет данных для отображения
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}