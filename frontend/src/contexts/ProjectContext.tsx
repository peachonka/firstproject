import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiService, UpdateProjectRequest, UpdateDefectRequest } from '../services/apiService';

export type DefectStatus = 0 | 1 | 2 | 3 | 4;
export type DefectPriority = 0 | 1 | 2 | 3;

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Completed' | 'Paused';
  startDate: string;
  endDate?: string;
  phases: Phase[];
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  // startDate: string;
  // endDate?: string;
  status: 'Planned' | 'Active' | 'Completed';
}

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export interface Defect {
  id: string;
  title: string;
  description: string;
  status: DefectStatus;
  priority: DefectPriority;
  projectId: string;
  phaseId?: string;
  assigneeId: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  attachments: Attachment[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  defectId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface DataContextType {
  projects: Project[];
  defects: Defect[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, project: UpdateProjectRequest) => Promise<void>;
  addDefect: (defect: Omit<Defect, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => Promise<void>;
  updateDefect: (id: string, defect: UpdateDefectRequest) => Promise<void>;
  addComment: (defectId: string, content: string, userId: string, userName: string) => Promise<void>;
  refreshData: () => Promise<void>;
  uploadAttachment: (defectId: string, file: File) => Promise<Attachment>;
  deleteAttachment: (attachmentId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectsData, defectsData] = await Promise.all([
        apiService.getProjects(),
        apiService.getDefects()
      ]);
      setProjects(projectsData);
      setDefects(defectsData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProject = await apiService.createProject(project);
      setProjects(prev => [...prev, newProject]);
    } catch (err) {
      console.error('Error adding project:', err);
      throw err;
    }
  };

  const updateProject = async (id: string, updatedProject: UpdateProjectRequest) => {
    try {
      await apiService.updateProject(id, updatedProject);
      setProjects(prev => prev.map(project => 
        project.id === id ? { ...project, ...updatedProject } : project
      ));
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const addDefect = async (defect: Omit<Defect, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    try {
      const newDefect = await apiService.createDefect(defect);
      setDefects(prev => [...prev, newDefect]);
    } catch (err) {
      console.error('Error adding defect:', err);
      throw err;
    }
  };

  const updateDefect = async (id: string, updatedDefect: UpdateDefectRequest) => {
    try {
      await apiService.updateDefect(id, updatedDefect);
      setDefects(prev => prev.map(defect => 
        defect.id === id ? { ...defect, ...updatedDefect } : defect
      ));
    } catch (err) {
      console.error('Error updating defect:', err);
      throw err;
    }
  };

  const addComment = async (defectId: string, content: string, userId: string, userName: string) => {
  try {
    // Оптимистичное обновление - сразу добавляем комментарий в UI
    const tempComment = {
      id: `temp-${Date.now()}`,
      defectId,
      userId,
      userName,
      content,
      createdAt: new Date().toISOString()
    };

    setDefects(prev => prev.map(defect => 
      defect.id === defectId ? {
        ...defect,
        comments: [...defect.comments, tempComment]
      } : defect
    ));

    // Отправляем запрос к API
    await apiService.addComment(defectId, { content, userId, userName });

    // После успеха обновляем данные чтобы получить правильный ID комментария
    await refreshData();
    
  } catch (err) {
    // Если ошибка - откатываем оптимистичное обновление
    setDefects(prev => prev.map(defect => 
      defect.id === defectId ? {
        ...defect,
        comments: defect.comments.filter(comment => !comment.id.startsWith('temp-'))
      } : defect
    ));
    
    console.error('Error adding comment:', err);
    throw err;
  }
};

  const refreshData = async () => {
    await loadData();
  };

  const uploadAttachment = async (defectId: string, file: File): Promise<Attachment> => {
  try {
    const attachment = await apiService.uploadAttachment(defectId, file);
    await refreshData();
    return attachment; // Возвращаем attachment
  } catch (err) {
    console.error('Error uploading attachment:', err);
    throw err;
  }
};

const deleteAttachment = async (attachmentId: string) => {
  try {
    await apiService.deleteAttachment(attachmentId);
    await refreshData();
  } catch (err) {
    console.error('Error deleting attachment:', err);
    throw err;
  }
};

  return (
    <DataContext.Provider value={{
      projects,
      defects,
      loading,
      error,
      addProject,
      updateProject,
      addDefect,
      updateDefect,
      addComment,
      refreshData,
      uploadAttachment,
      deleteAttachment
    }}>
      {children}
    </DataContext.Provider>
  );

}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}