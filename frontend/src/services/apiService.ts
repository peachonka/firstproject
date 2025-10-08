// Типы для API
export interface CreateProjectRequest {
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'paused';
  startDate?: string;
  endDate?: string;
}

export interface CreateDefectRequest {
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'under_review' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  phaseId?: string;
  assigneeId: string;
  reporterId: string;
  dueDate?: string;
  attachments: string[];
}

export interface UpdateDefectRequest {
  title?: string;
  description?: string;
  status?: 'new' | 'in_progress' | 'under_review' | 'closed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  phaseId?: string;
  assigneeId?: string;
  dueDate?: string;
  attachments?: string[];
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

// Типы для ответов API (совместимые с вашими моделями)
export interface ApiProject {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
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
  status: 'planned' | 'active' | 'completed';
}

export interface ApiDefect {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'under_review' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  phaseId?: string;
  assigneeId: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  attachments: string[];
  comments: ApiComment[];
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

const API_BASE_URL = 'http://localhost:5269'; // Замените на ваш URL

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

    // Если есть body и это объект, преобразуем в JSON
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Для DELETE запросов может не быть тела ответа
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

  async updateDefect(id: string, defectData: UpdateDefectRequest): Promise<void> {
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

  async addComment(defectId: string, commentData: CommentRequest): Promise<void> {
    return this.request<void>(`/api/Defects/${defectId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
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