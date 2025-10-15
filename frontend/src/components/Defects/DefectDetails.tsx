import React, { useState } from 'react';
import { X, Calendar, Building2, MessageCircle, Send, Edit, History, Paperclip, Download, Eye } from 'lucide-react';
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
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);

  // Защита от undefined - находим актуальный дефект или используем переданный
  const safeDefects = defects || [];
  const currentDefect = safeDefects.find(d => d.id === defect.id) || defect;

  const project = projects.find(p => p.id === currentDefect.projectId);
  const phase = project?.phases?.find(p => p.id === currentDefect.phaseId);

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

  const handleDownloadAttachment = async (attachment: any) => {
    try {
      // Предполагаем, что у вас есть endpoint для скачивания файлов
      const response = await fetch(`/api/attachments/${attachment.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = attachment.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download attachment');
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  const handleViewAttachment = (attachment: any) => {
    setSelectedAttachment(attachment);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

              {/* Attachments Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Paperclip className="w-5 h-5" />
                  Вложения ({currentDefect.attachments?.length || 0})
                </h3>
                
                {currentDefect.attachments && currentDefect.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentDefect.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getFileIcon(attachment.fileName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {attachment.fileName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)}
                            </div>
                            
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewAttachment(attachment)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Просмотреть"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadAttachment(attachment)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Скачать"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Вложения отсутствуют</p>
                  </div>
                )}
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