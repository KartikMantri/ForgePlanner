import axios from 'axios';
import type {
  DSAProgressUpdate,
  DSAProgress,
  DSASheetSummary,
  DSATopicGroup,
  NotePage,
  NotePageWithBlocks,
  SaveBlocksRequest,
  NoteBlock,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// DSA Module
// ============================================================================

export const dsaApi = {
  seedSheet: async (goalId: string) => {
    const { data } = await apiClient.post(`/dsa/seed/${goalId}`);
    return data;
  },

  getSummary: async (goalId: string): Promise<DSASheetSummary> => {
    const { data } = await apiClient.get(`/dsa/sheet/${goalId}/summary`);
    return data;
  },

  getSheet: async (goalId: string, params?: Record<string, any>): Promise<DSATopicGroup[]> => {
    const { data } = await apiClient.get(`/dsa/sheet/${goalId}`, { params });
    return data;
  },

  updateProgress: async (progressId: string, update: DSAProgressUpdate): Promise<DSAProgress> => {
    const { data } = await apiClient.put(`/dsa/progress/${progressId}`, update);
    return data;
  },
};

// ============================================================================
// Notes Module
// ============================================================================

export const notesApi = {
  createPage: async (goalId: string, title: string): Promise<NotePage> => {
    const { data } = await apiClient.post(`/notes/goals/${goalId}/pages`, { title });
    return data;
  },

  listPages: async (goalId: string): Promise<NotePage[]> => {
    const { data } = await apiClient.get(`/notes/goals/${goalId}/pages`);
    return data;
  },

  getPage: async (pageId: string): Promise<NotePageWithBlocks> => {
    const { data } = await apiClient.get(`/notes/pages/${pageId}`);
    return data;
  },

  updatePage: async (pageId: string, updates: Partial<NotePage>): Promise<NotePage> => {
    const { data } = await apiClient.put(`/notes/pages/${pageId}`, updates);
    return data;
  },

  deletePage: async (pageId: string) => {
    await apiClient.delete(`/notes/pages/${pageId}`);
  },

  saveBlocks: async (pageId: string, request: SaveBlocksRequest): Promise<NoteBlock[]> => {
    const { data } = await apiClient.put(`/notes/pages/${pageId}/blocks`, request);
    return data;
  },
};

// ============================================================================
// Onboarding Module
// ============================================================================

export const onboardingApi = {
  parseUrl: async (url: string) => {
    const { data } = await apiClient.post('/onboarding/parse-url', { url });
    return data;
  },
  parseFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/onboarding/parse-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  analyze: async (context_text: string, milestones: any[], availability: any) => {
    const { data } = await apiClient.post('/onboarding/analyze', {
      context_text,
      milestones,
      availability
    });
    return data;
  }
};

// ============================================================================
// Goals Module
// ============================================================================

export const goalsApi = {
  createGoal: async (payload: any) => {
    const { data } = await apiClient.post('/goals', payload);
    return data;
  },
  listGoals: async () => {
    const { data } = await apiClient.get('/goals');
    return data;
  },
  getGoal: async (goalId: string) => {
    const { data } = await apiClient.get(`/goals/${goalId}`);
    return data;
  },
  deleteGoal: async (goalId: string) => {
    await apiClient.delete(`/goals/${goalId}`);
  },
};

// ============================================================================
// Milestones Module
// ============================================================================

export const milestonesApi = {
  createMilestone: async (goalId: string, title: string, targetDate: string) => {
    const { data } = await apiClient.post('/milestones', { goal_id: goalId, title, target_date: targetDate });
    return data;
  },
  updateMilestone: async (milestoneId: string, update: { title?: string; target_date?: string; status?: string }) => {
    const { data } = await apiClient.put(`/milestones/${milestoneId}`, update);
    return data;
  },
  deleteMilestone: async (milestoneId: string) => {
    await apiClient.delete(`/milestones/${milestoneId}`);
  },
};

// ============================================================================
// Tasks Module
// ============================================================================

export const tasksApi = {
  listTasks: async (goalId: string) => {
    const { data } = await apiClient.get('/tasks', { params: { goal_id: goalId } });
    return data as any[];
  },
  createTask: async (title: string, goalId: string, xpValue = 10) => {
    const { data } = await apiClient.post('/tasks', { title, goal_id: goalId, xp_value: xpValue });
    return data;
  },
  updateTask: async (taskId: string, update: { status?: string; title?: string }) => {
    const { data } = await apiClient.put(`/tasks/${taskId}`, update);
    return data;
  },
  deleteTask: async (taskId: string) => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};

// ============================================================================
// Resources Module
// ============================================================================

export const resourcesApi = {
  listResources: async (goalId: string) => {
    const { data } = await apiClient.get('/resources', { params: { goal_id: goalId } });
    return data as any[];
  },
  createResource: async (goalId: string, filename: string, url: string, fileType = 'url') => {
    const { data } = await apiClient.post('/resources', { goal_id: goalId, filename, url, file_type: fileType });
    return data;
  },
  deleteResource: async (resourceId: string) => {
    await apiClient.delete(`/resources/${resourceId}`);
  },
};

export default apiClient;
