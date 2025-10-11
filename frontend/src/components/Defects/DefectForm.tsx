import React, { useState, useRef } from 'react';
import { X, Paperclip, Trash2, Upload, File, Image, Download } from 'lucide-react';
import { useData } from '../../contexts/ProjectContext';
import { useUser } from '../../contexts/UserContext';
import { Defect, DefectStatus, DefectPriority, Attachment } from '../../contexts/ProjectContext';

interface DefectFormProps {
  defect?: Defect;
  onClose: () => void;
  onSave: () => void;
}

export function DefectForm({ defect, onClose, onSave }: DefectFormProps) {
  const { projects, addDefect, updateDefect, uploadAttachment, deleteAttachment, refreshData } = useData(); // Добавьте refreshData
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: defect?.title || '',
    description: defect?.description || '',
    priority: defect?.priority || 1 as DefectPriority,
    status: defect?.status || 0 as DefectStatus,
    projectId: defect?.projectId || '',
    phaseId: defect?.phaseId || '',
    assigneeId: defect?.assigneeId || user?.id || '',
    dueDate: defect?.dueDate ? defect.dueDate.split('T')[0] : ''
  });
  
  // Упростим инициализацию attachments
  const [attachments, setAttachments] = useState(() => {
    if (!defect?.attachments) return [];
    return defect.attachments;
  });
  
  const [uploading, setUploading] = useState(false);

  // Вспомогательная функция для определения типа контента по расширению файла
  const getContentTypeFromFile = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    if (defect) {
      await updateDefect(defect.id, {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      });
    } else {
      // Просто создаем дефект
      await addDefect({
        ...formData,
        reporterId: user?.id || '',
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        attachments: []
      });
    }
    
    onSave();
  } catch (error) {
    console.error('Error saving defect:', error);
  }
};

const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0 || !defect) return;

  setUploading(true);
  try {
    const uploadPromises = Array.from(files).map(file => 
      uploadAttachment(defect.id, file)
    );
    
    const newAttachments = await Promise.all(uploadPromises);
    // Исправленная строка - убираем сложную фильтрацию
    const validAttachments = newAttachments.filter(Boolean) as Attachment[];
    setAttachments(prev => [...prev, ...validAttachments]);
    
    // Обновляем данные
    await refreshData();
  } catch (error) {
    console.error('Error uploading files:', error);
  } finally {
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      await refreshData(); // Обновляем данные после удаления
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const isImageFile = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    if (isImageFile(fileName)) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    
    if (fileName.endsWith('.pdf')) {
      return <File className="w-5 h-5 text-red-500" />;
    }
    
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return <File className="w-5 h-5 text-blue-600" />;
    }
    
    if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return <File className="w-5 h-5 text-green-600" />;
    }
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {defect ? 'Редактировать дефект' : 'Создать новый дефект'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название дефекта *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Секция вложений */}
          {defect && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Вложения
              </label>
              
              {/* Список вложений */}
              {attachments.length > 0 && (
                <div className="mb-4 space-y-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(attachment.fileName)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)} • 
                            {new Date(attachment.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/Attachments/${attachment.id}`}
                          download={attachment.fileName}
                          className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
                          title="Скачать"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Загрузка файлов */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  Перетащите файлы сюда или нажмите для выбора
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Поддерживаются: изображения, PDF, Word, Excel
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Загрузка...' : 'Выбрать файлы'}
                </button>
              </div>
            </div>
          )}

          {!defect && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700">
                  Файлы можно добавить после создания дефекта
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Проект *
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value, phaseId: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Выберите проект</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Этап
              </label>
              <select
                value={formData.phaseId}
                onChange={(e) => setFormData(prev => ({ ...prev, phaseId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedProject}
              >
                <option value="">Выберите этап</option>
                {selectedProject?.phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>{phase.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) as DefectPriority }))}                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value={0}>Низкий</option>
                <option value={1}>Средний</option>
                <option value={2}>Высокий</option>
                <option value={3}>Критический</option>
              </select>
            </div>

            {defect && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: parseInt(e.target.value) as DefectStatus }))}                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Новый</option>
                  <option value={1}>В работе</option>
                  <option value={2}>На проверке</option>
                  <option value={3}>Закрыт</option>
                  <option value={4}>Отменен</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Срок выполнения
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {defect ? 'Сохранить изменения' : 'Создать дефект'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}