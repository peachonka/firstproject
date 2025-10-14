// utils/historyUtils.ts
import { apiService, CreateDefectHistoryRequest } from '../services/apiService';

export const recordDefectChange = async (
  defectId: string,
  fieldName: string,
  oldValue: any,
  newValue: any,
  changedBy: string,
  changedByName: string
) => {
  // Преобразуем значения в строки для хранения
  const oldValueStr = String(oldValue || '');
  const newValueStr = String(newValue || '');

  // Записываем только если значение изменилось
  if (oldValueStr !== newValueStr) {
    const historyData: CreateDefectHistoryRequest = {
      defectId,
      fieldName,
      oldValue: oldValueStr,
      newValue: newValueStr,
      changedBy,
      changedByName
    };

    try {
      await apiService.addDefectHistory(historyData);
    } catch (error) {
      console.error('Error recording defect history:', error);
    }
  }
};