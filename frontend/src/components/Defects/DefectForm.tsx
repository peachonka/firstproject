import React, { useState, useEffect } from 'react';
import { X, Save, Upload, FileText } from 'lucide-react';
import { useData } from '../../contexts/ProjectContext';
import { useUser } from '../../contexts/UserContext';
import { Defect } from '../../contexts/ProjectContext';
import { apiService } from '../../services/apiService';

interface DefectFormProps {
  defect?: Defect;
  onClose: () => void;
  onSave: () => void;
}

// Определяем enum'ы как константы с правильными типами
const DefectStatus = {
  New: 0 as const,
  InProgress: 1 as const,
  UnderReview: 2 as const,
  Closed: 3 as const,
  Cancelled: 4 as const
};

const DefectPriority = {
  Low: 0 as const,
  Medium: 1 as const,
  High: 2 as const,
  Critical: 3 as const
};

type DefectStatusType = typeof DefectStatus[keyof typeof DefectStatus];
type DefectPriorityType = typeof DefectPriority[keyof typeof DefectPriority];

export function DefectForm({ defect, onClose, onSave }: DefectFormProps) {
  const { projects, addDefect, updateDefect, refreshData } = useData();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: defect?.title || '',
    description: defect?.description || '',
    status: (defect?.status ?? DefectStatus.New) as DefectStatusType,
    priority: (defect?.priority ?? DefectPriority.Medium) as DefectPriorityType,
    projectId: defect?.projectId || '',
    phaseId: defect?.phaseId || '',
    assigneeId: defect?.assigneeId || '',
    dueDate: defect?.dueDate ? new Date(defect.dueDate).toISOString().split('T')[0] : ''
  });

  // Получаем фазы для выбранного проекта
  const selectedProject = projects.find(p => p.id === formData.projectId);
  const phases = selectedProject?.phases || [];

  const statusOptions = [
    { value: DefectStatus.New, label: 'Новый' },
    { value: DefectStatus.InProgress, label: 'В работе' },
    { value: DefectStatus.UnderReview, label: 'На проверке' },
    { value: DefectStatus.Closed, label: 'Закрыт' },
    { value: DefectStatus.Cancelled, label: 'Отменен' }
  ];

  const priorityOptions = [
    { value: DefectPriority.Low, label: 'Низкий' },
    { value: DefectPriority.Medium, label: 'Средний' },
    { value: DefectPriority.High, label: 'Высокий' },
    { value: DefectPriority.Critical, label: 'Критический' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // В DefectForm.tsx в handleSubmit
const defectData = {
  title: formData.title,
  description: formData.description,
  status: formData.status, // уже должно быть числом из состояния
  priority: formData.priority, // уже должно быть числом из состояния
  projectId: formData.projectId,
  phaseId: formData.phaseId || undefined,
  assigneeId: formData.assigneeId,
  reporterId: user.id,
  dueDate: formData.dueDate || undefined,
  attachments: []
};

      let savedDefectId: string;

      if (defect) {
        // Обновление существующего дефекта
        await updateDefect(defect.id, defectData);
        savedDefectId = defect.id;
      } else {
        // Создание нового дефекта
        const newDefect = await addDefect(defectData);
        // Получаем ID нового дефекта после обновления данных
        await refreshData();
        // Находим последний созданный дефект
        const defects = await apiService.getDefects();
        const lastDefect = defects[defects.length - 1];
        savedDefectId = lastDefect.id;
      }

      // Загрузка вложений если есть
      if (attachments.length > 0 && savedDefectId) {
        for (const file of attachments) {
          await apiService.uploadAttachment(savedDefectId, file);
        }
      }

      await refreshData();
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving defect:', error);
      alert('Ошибка при сохранении дефекта');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value) as DefectStatusType;
    setFormData({ ...formData, status: value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value) as DefectPriorityType;
    setFormData({ ...formData, priority: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {defect ? 'Редактирование дефекта' : 'Создание дефекта'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите название дефекта"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Проект *
              </label>
              <select
                required
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value, phaseId: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Выберите проект</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Фаза и исполнитель */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фаза
              </label>
              <select
                value={formData.phaseId}
                onChange={(e) => setFormData({ ...formData, phaseId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.projectId}
              >
                <option value="">Не выбрана</option>
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Исполнитель *
              </label>
              <select
                required
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Выберите исполнителя</option>
                <option value="1">Анна Петрова (Менеджер)</option>
                <option value="2">Дмитрий Иванов (Инженер)</option>
                <option value="3">Елена Сидорова (Наблюдатель)</option>
              </select>
            </div>
          </div>

          {/* Статус и приоритет */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус *
              </label>
              <select
                required
                value={formData.status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет *
              </label>
              <select
                required
                value={formData.priority}
                onChange={handlePriorityChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Подробное описание дефекта..."
            />
          </div>

          {/* Срок выполнения */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Срок выполнения
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Вложения */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Вложения
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Нажмите для загрузки файлов или перетащите их сюда
                </span>
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{file.name}</span>
                    <span className="text-gray-400">({Math.round(file.size / 1024)} KB)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Сохранение...' : (defect ? 'Обновить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}