import React, { useState } from 'react';
import { Plus, Building2, Calendar, Users, MoreHorizontal } from 'lucide-react';
import { useData } from '../../contexts/ProjectContext';
import { useUser } from '../../contexts/UserContext';
import { Project } from '../../contexts/ProjectContext';

export function ProjectsManager() {
  const { projects, addProject, updateProject } = useData();
  const { user } = useUser();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const canEdit = user?.role === 'manager';

  const statusColors = {
    Active: 'text-green-600 bg-green-50',
    Completed: 'text-blue-600 bg-blue-50',
    Paused: 'text-yellow-600 bg-yellow-50'
  };

  const statusLabels = {
    Active: 'Активный',
    Completed: 'Завершен',
    Paused: 'Приостановлен'
  };

  // Защита от undefined - если projects не загрузились, показываем пустой массив
  const safeProjects = projects || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Проекты</h1>
          <p className="text-gray-600">Управление строительными проектами</p>
        </div>
        
        {canEdit && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить проект
          </button>
        )}
      </div>

      {safeProjects.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Проекты не найдены</p>
          {canEdit && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Создать первый проект
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {safeProjects.map((project) => {
            // Защита от undefined для phases
            const phases = project.phases || [];
            
            return (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
                          {statusLabels[project.status]}
                        </span>
                      </div>
                    </div>
                    {canEdit && (
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{project.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Начат: {new Date(project.startDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{phases.length} этапов</span>
                    </div>
                  </div>

                  {phases.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Этапы проекта</h4>
                      <div className="space-y-2">
                        {phases.slice(0, 3).map((phase) => (
                          <div key={phase.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{phase.name}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              phase.status === 'Completed' ? 'bg-green-50 text-green-600' :
                              phase.status === 'Active' ? 'bg-yellow-50 text-yellow-600' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {phase.status === 'Completed' ? 'Завершен' :
                              phase.status === 'Active' ? 'Активный' : 'Планируется'}
                            </span>
                          </div>
                        ))}
                        {phases.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{phases.length - 3} еще
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Добавить новый проект</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                await addProject({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  status: 'Active',
                  startDate: formData.get('startDate') as string,
                  phases: []
                });
                setShowAddForm(false);
              } catch (error) {
                console.error('Error creating project:', error);
                alert('Ошибка при создании проекта');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название проекта *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите название проекта"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание *
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Опишите проект"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата начала *
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Создать проект
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}