import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiService, UpdateProjectRequest, UpdateDefectRequest } from '../services/apiService';

export type DefectStatus = 'new' | 'in_progress' | 'under_review' | 'closed' | 'cancelled';
export type DefectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
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
  status: 'planned' | 'active' | 'completed';
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
  attachments: string[];
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
      await apiService.addComment(defectId, { content, userId, userName });
      // Обновляем локальное состояние
      setDefects(prev => prev.map(defect => 
        defect.id === defectId ? {
          ...defect,
          comments: [...defect.comments, {
            id: Date.now().toString(),
            defectId,
            userId,
            userName,
            content,
            createdAt: new Date().toISOString()
          }]
        } : defect
      ));
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const refreshData = async () => {
    await loadData();
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
      refreshData
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