import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit, MessageCircle } from 'lucide-react';
import { useData } from '../../contexts/ProjectContext';
import { useUser } from '../../contexts/UserContext';
import { DefectForm } from './DefectForm';
import { DefectDetails } from './DefectDetails';
import { Defect, DefectStatus, DefectPriority } from '../../contexts/ProjectContext';

export function DefectsManager() {
  const { defects, projects } = useData();
  const { user } = useUser();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DefectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<DefectPriority | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const canEdit = user?.role !== 'observer';
  const canCreate = user?.role !== 'observer';

  const filteredDefects = useMemo(() => {
    return defects.filter(defect => {
      const matchesSearch = defect.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          defect.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || defect.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || defect.priority === priorityFilter;
      const matchesProject = projectFilter === 'all' || defect.projectId === projectFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [defects, searchTerm, statusFilter, priorityFilter, projectFilter]);

  const exportToCSV = () => {
    const headers = ['ID', 'Название', 'Описание', 'Статус', 'Приоритет', 'Проект', 'Создан', 'Срок'];
    const rows = filteredDefects.map(defect => {
      const project = projects.find(p => p.id === defect.projectId);
      return [
        defect.id,
        defect.title,
        defect.description.replace(/,/g, ';'),
        statusLabels[defect.status],
        priorityLabels[defect.priority],
        project?.name || 'Неизвестно',
        new Date(defect.createdAt).toLocaleDateString('ru-RU'),
        defect.dueDate ? new Date(defect.dueDate).toLocaleDateString('ru-RU') : 'Не указан'
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `defects_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const priorityColors = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  };

  const statusColors = {
    new: 'text-blue-600 bg-blue-50 border-blue-200',
    InProgress: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    UnderReview: 'text-purple-600 bg-purple-50 border-purple-200',
    closed: 'text-green-600 bg-green-50 border-green-200',
    cancelled: 'text-gray-600 bg-gray-50 border-gray-200'
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

  if (selectedDefect) {
    return (
      <DefectDetails
        defect={selectedDefect}
        onClose={() => setSelectedDefect(null)}
        onEdit={canEdit ? () => {
          setEditingDefect(selectedDefect);
          setSelectedDefect(null);
        } : undefined}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Дефекты</h1>
          <p className="text-gray-600">Управление дефектами строительства</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Экспорт CSV
          </button>
          
          {canCreate && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить дефект
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск дефектов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DefectStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Все статусы</option>
            <option value={0}>Новые</option>
            <option value={1}>В работе</option>
            <option value={2}>На проверке</option>
            <option value={3}>Закрытые</option>
            <option value={4}>Отмененные</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as DefectPriority | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Все приоритеты</option>
            <option value={0}>Низкий</option>
            <option value={1}>Средний</option>
            <option value={2}>Высокий</option>
            <option value={3}>Критический</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Все проекты</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-600">
            Найдено: {filteredDefects.length}
          </div>
        </div>
      </div>

      {/* Defects List */}
      <div className="space-y-4">
        {filteredDefects.map((defect) => {
          const project = projects.find(p => p.id === defect.projectId);
          const isOverdue = defect.dueDate && new Date(defect.dueDate) < new Date() && defect.status !== 3;
          
          return (
            <div key={defect.id} className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all ${
              isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
            }`}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {defect.title}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${statusColors[defect.status]}`}>
                        {statusLabels[defect.status]}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[defect.priority]}`}>
                        {priorityLabels[defect.priority]}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {defect.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Проект: {project?.name}</span>
                      <span>Создан: {new Date(defect.createdAt).toLocaleDateString('ru-RU')}</span>
                      {defect.dueDate && (
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          Срок: {new Date(defect.dueDate).toLocaleDateString('ru-RU')}
                          {isOverdue && ' (просрочен)'}
                        </span>
                      )}
                      {defect.comments.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {defect.comments.length}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedDefect(defect)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Просмотр"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {canEdit && (
                      <button
                        onClick={() => setEditingDefect(defect)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredDefects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Дефекты не найдены</p>
          </div>
        )}
      </div>

      {(showAddForm || editingDefect) && (
        <DefectForm
          defect={editingDefect || undefined}
          onClose={() => {
            setShowAddForm(false);
            setEditingDefect(null);
          }}
          onSave={() => {
            setShowAddForm(false);
            setEditingDefect(null);
          }}
        />
      )}
    </div>
  );
}