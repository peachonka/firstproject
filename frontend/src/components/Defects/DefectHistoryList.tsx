import React from 'react';
import { History, User, Calendar } from 'lucide-react';
import { DefectHistory } from '../../services/apiService';

interface DefectHistoryProps {
  history: DefectHistory[];
}

// Функции для форматирования значений полей
const formatFieldName = (fieldName: string): string => {
  const fieldMap: Record<string, string> = {
    'title': 'Название',
    'description': 'Описание',
    'status': 'Статус',
    'priority': 'Приоритет',
    'assigneeId': 'Исполнитель',
    'dueDate': 'Срок выполнения',
    'projectId': 'Проект',
    'phaseId': 'Фаза'
  };
  return fieldMap[fieldName] || fieldName;
};

const formatFieldValue = (fieldName: string, value: string): string => {
  if (!value) return 'Не задано';
  
  switch (fieldName) {
    case 'status':
      const statusMap: Record<string, string> = {
        '0': 'Новый',
        '1': 'В работе',
        '2': 'На проверке',
        '3': 'Закрыт',
        '4': 'Отменен'
      };
      return statusMap[value] || value;
    
    case 'priority':
      const priorityMap: Record<string, string> = {
        '0': 'Низкий',
        '1': 'Средний',
        '2': 'Высокий',
        '3': 'Критический'
      };
      return priorityMap[value] || value;
    
    case 'dueDate':
      return new Date(value).toLocaleDateString('ru-RU');
    
    default:
      return value;
  }
};

export function DefectHistoryList({ history }: DefectHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>История изменений отсутствует</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <History className="w-5 h-5" />
        История изменений
      </h3>
      
      <div className="space-y-3">
        {history.map((record) => (
          <div
            key={record.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  {record.changedByName}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {new Date(record.changedAt).toLocaleDateString('ru-RU')}
                <span className="text-gray-400">
                  {new Date(record.changedAt).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-700">
              <span className="font-medium">
                {formatFieldName(record.fieldName)}:
              </span>{' '}
              <span className="line-through text-red-600">
                {formatFieldValue(record.fieldName, record.oldValue)}
              </span>{' '}
              →{' '}
              <span className="text-green-600 font-medium">
                {formatFieldValue(record.fieldName, record.newValue)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}