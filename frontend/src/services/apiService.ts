// Типы для API
export interface CreateProjectRequest {
  name: string;
  description: string;
  status: 'Active' | 'Completed' | 'Paused';
  startDate: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'Active' | 'Completed' | 'Paused';
  startDate?: string;
  endDate?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export interface CreateDefectRequest {
  title: string;
  description: string;
  status: 0 | 1 | 2 | 3 | 4;
  priority: 0 | 1 | 2 | 3;
  projectId: string;
  phaseId?: string;
  assigneeId: string;
  reporterId: string;
  dueDate?: string;
  attachments: Attachment[];
}

export interface UpdateDefectRequest {
  title?: string;
  description?: string;
  status?: 0 | 1 | 2 | 3 | 4;
  priority?: 0 | 1 | 2 | 3;
  projectId?: string;
  phaseId?: string;
  assigneeId?: string;
  dueDate?: string;
  attachments?: Attachment[];
}

export interface CommentRequest {
  content: string;
  userId: string;
  userName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Типы для истории изменений
export interface DefectHistory {
  id: string;
  defectId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedByName: string;
  changedAt: string;
}

export interface CreateDefectHistoryRequest {
  defectId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedByName: string;
}

// Типы для ответов API (совместимые с вашими моделями)
export interface ApiProject {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Completed' | 'Paused';
  startDate: string;
  endDate?: string;
  phases: ApiPhase[];
  defects: ApiDefect[];
}

export interface ApiPhase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: 'Planned' | 'Active' | 'Completed';
}

export interface ApiDefect {
  id: string;
  title: string;
  description: string;
  status: 0 | 1 | 2 | 3 | 4;
  priority: 0 | 1 | 2 | 3;
  projectId: string;
  phaseId?: string;
  assigneeId: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  attachments: Attachment[];
  comments: ApiComment[];
  history: DefectHistory[];
}

export interface ApiComment {
  id: string;
  defectId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: 'manager' | 'engineer' | 'observer';
  avatar?: string;
}

const API_BASE_URL = 'http://localhost:5269';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.status === 204) {
        return null as T;
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Projects API
  async getProjects(): Promise<ApiProject[]> {
    return this.request<ApiProject[]>('/api/Projects');
  }

  async getProject(id: string): Promise<ApiProject> {
    return this.request<ApiProject>(`/api/Projects/${id}`);
  }

  async createProject(projectData: CreateProjectRequest): Promise<ApiProject> {
    return this.request<ApiProject>('/api/Projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: UpdateProjectRequest): Promise<void> {
    return this.request<void>(`/api/Projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/api/Projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Defects API
  async getDefects(): Promise<ApiDefect[]> {
    return this.request<ApiDefect[]>('/api/Defects');
  }

  async getDefectsByProject(projectId: string): Promise<ApiDefect[]> {
    return this.request<ApiDefect[]>(`/api/Defects/project/${projectId}`);
  }

  async getDefect(id: string): Promise<ApiDefect> {
    return this.request<ApiDefect>(`/api/Defects/${id}`);
  }

  async createDefect(defectData: CreateDefectRequest): Promise<ApiDefect> {
    return this.request<ApiDefect>('/api/Defects', {
      method: 'POST',
      body: JSON.stringify(defectData),
    });
  }

  // services/apiService.ts
async updateDefect(id: string, defectData: any): Promise<void> {
  return this.request<void>(`/api/Defects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(defectData),
  });
}

  async deleteDefect(id: string): Promise<void> {
    return this.request<void>(`/api/Defects/${id}`, {
      method: 'DELETE',
    });
  }

  // Comments API
  async addComment(defectId: string, commentData: CommentRequest): Promise<void> {
    return this.request<void>(`/api/Defects/${defectId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  // Attachment API
  async uploadAttachment(defectId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/Attachments/${defectId}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    return this.request<void>(`/api/Attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  async getDefectAttachments(defectId: string): Promise<Attachment[]> {
    return this.request<Attachment[]>(`/api/Attachments/defect/${defectId}`);
  }

  getAttachmentUrl(attachmentId: string): string {
    return `${this.baseURL}/api/Attachments/${attachmentId}`;
  }

  // History API
  async getDefectHistory(defectId: string): Promise<DefectHistory[]> {
    return this.request<DefectHistory[]>(`/api/Defects/${defectId}/history`);
  }

  async addDefectHistory(historyData: CreateDefectHistoryRequest): Promise<void> {
    return this.request<void>('/api/Defects/history', {
      method: 'POST',
      body: JSON.stringify(historyData),
    });
  }

  // Auth API
  async login(credentials: LoginRequest): Promise<ApiUser> {
    return this.request<ApiUser>('/api/Auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getUsers(): Promise<ApiUser[]> {
    return this.request<ApiUser[]>('/api/Auth/users');
  }

  async getUser(id: string): Promise<ApiUser> {
    return this.request<ApiUser>(`/api/Auth/users/${id}`);
  }
}

export const apiService = new ApiService(API_BASE_URL);