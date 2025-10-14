import React, { useState } from 'react';
import { X, Calendar, Building2, MessageCircle, Send, Edit, History } from 'lucide-react';
import { useData } from '../../contexts/ProjectContext';
import { useUser } from '../../contexts/UserContext';
import { Defect } from '../../contexts/ProjectContext';

interface DefectDetailsProps {
  defect: Defect;
  onClose: () => void;
  onEdit?: () => void;
  onShowHistory?: () => void;
}

export function DefectDetails({ defect, onClose, onEdit, onShowHistory }: DefectDetailsProps) {
  const { projects, addComment, defects } = useData();
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');

  // Находим актуальный дефект из состояния контекста
  const currentDefect = defects.find(d => d.id === defect.id) || defect;
  const project = projects.find(p => p.id === currentDefect.projectId);
  const phase = project?.phases.find(p => p.id === currentDefect.phaseId);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && user) {
      try {
        await addComment(currentDefect.id, newComment.trim(), user.id, user.name);
        setNewComment('');
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const statusLabels: Record<number, string> = {
    0: 'Новый',
    1: 'В работе', 
    2: 'На проверке',
    3: 'Закрыт',
    4: 'Отменен'
  };

  const priorityLabels: Record<number, string> = {
    0: 'Низкий',
    1: 'Средний',
    2: 'Высокий', 
    3: 'Критический'
  };

  const statusColors: Record<number, string> = {
    0: 'text-blue-600 bg-blue-50 border-blue-200',
    1: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    2: 'text-purple-600 bg-purple-50 border-purple-200',
    3: 'text-green-600 bg-green-50 border-green-200',
    4: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  const priorityColors: Record<number, string> = {
    0: 'text-green-600 bg-green-50 border-green-200',
    1: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    2: 'text-orange-600 bg-orange-50 border-orange-200',
    3: 'text-red-600 bg-red-50 border-red-200'
  };

  const isOverdue = currentDefect.dueDate && 
                   new Date(currentDefect.dueDate) < new Date() && 
                   currentDefect.status !== 3;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">{currentDefect.title}</h2>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${statusColors[currentDefect.status]}`}>
                {statusLabels[currentDefect.status]}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[currentDefect.priority]}`}>
                {priorityLabels[currentDefect.priority]}
              </span>
              {isOverdue && (
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full border border-red-200 bg-red-50 text-red-600">
                  Просрочен
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onShowHistory && (
              <button
                onClick={onShowHistory}
                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="История изменений"
              >
                <History className="w-5 h-5" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Редактировать"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Описание</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {currentDefect.description}
                </p>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Комментарии ({currentDefect.comments?.length || 0})
                </h3>
                
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {currentDefect.comments && currentDefect.comments.length > 0 ? (
                    currentDefect.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{comment.userName}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Комментариев пока нет</p>
                  )}
                </div>

                {user && (
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Добавить комментарий..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Defect Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Детали дефекта</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-600">Проект:</span>
                      <span className="font-medium ml-1">{project?.name || 'Не указан'}</span>
                    </div>
                  </div>
                  
                  {phase && (
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-gray-600">Этап:</span>
                        <span className="font-medium ml-1">{phase.name}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-600">Создан:</span>
                      <span className="font-medium ml-1">
                        {new Date(currentDefect.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-600">Изменен:</span>
                      <span className="font-medium ml-1">
                        {new Date(currentDefect.updatedAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  
                  {currentDefect.dueDate && (
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-gray-600">Срок:</span>
                        <span className={`font-medium ml-1 ${
                          isOverdue ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {new Date(currentDefect.dueDate).toLocaleDateString('ru-RU')}
                          {isOverdue && ' (просрочен)'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Reporter and Assignee Info */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      <div>Автор: {currentDefect.reporterId}</div>
                      <div>Исполнитель: {currentDefect.assigneeId}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {currentDefect.attachments && currentDefect.attachments.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Вложения</h3>
                  <div className="space-y-2">
                    {currentDefect.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={`/api/Attachments/${attachment.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer p-2 hover:bg-blue-50 rounded transition-colors"
                      >
                        <div className="flex-1 truncate">
                          {attachment.fileName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round(attachment.size / 1024)} KB
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Действия</h3>
                <div className="space-y-2">
                  {onShowHistory && (
                    <button
                      onClick={onShowHistory}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded transition-colors"
                    >
                      <History className="w-4 h-4" />
                      Показать историю изменений
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Редактировать дефект
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}