const API_BASE = 'http://localhost:3500';

export const apiService = {
  async getProjects() {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return await res.json();
    } catch (error) {
      console.error('Projects error:', error);
      return [];
    }
  },

  async createProject(data: any) {
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create project');
      }
      return await res.json();
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  },

  async deleteProject(id: string) {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete project');
      return await res.json();
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  },

  async chat(projectId: string, messages: any[]) {
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, messages }),
      });
      if (!res.ok) throw new Error('Failed to send chat message');
      return await res.json();
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  },

  async ls(path?: string) {
    try {
      const url = path ? `${API_BASE}/api/fs/ls?path=${encodeURIComponent(path)}` : `${API_BASE}/api/fs/ls`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to list files');
      return await res.json();
    } catch (error) {
      console.error('LS error:', error);
      return { path: '', files: [] };
    }
  },

  async openSystemDialog() {
    try {
      const res = await fetch(`${API_BASE}/api/fs/open-dialog`);
      if (!res.ok) throw new Error('Failed to open system dialog');
      return await res.json();
    } catch (error) {
      console.error('System dialog error:', error);
      return { cancelled: true };
    }
  },

  async getGlobalPrompts(phase: string) {
    try {
      const res = await fetch(`${API_BASE}/api/prompts/global/${phase}`);
      if (!res.ok) throw new Error('Failed to fetch global prompts');
      return await res.json();
    } catch (error) {
      console.error('Global prompts error:', error);
      return [];
    }
  },

  async getGlobalPrompt(phase: string, id: string) {
    try {
      const res = await fetch(`${API_BASE}/api/prompts/global/${phase}/${id}`);
      if (!res.ok) throw new Error('Failed to fetch global prompt content');
      return await res.text();
    } catch (error) {
      console.error('Global prompt content error:', error);
      return '';
    }
  },

  async updateGlobalPrompt(phase: string, id: string, content: string) {
    try {
      const res = await fetch(`${API_BASE}/api/prompts/global/${phase}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to update global prompt');
      return await res.json();
    } catch (error) {
      console.error('Update global prompt error:', error);
      throw error;
    }
  },

  async getProjectPrompts(projectId: string, phase: string) {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/prompts/${phase}`);
      if (!res.ok) throw new Error('Failed to fetch project prompts');
      return await res.json();
    } catch (error) {
      console.error('Project prompts error:', error);
      return [];
    }
  },

  async getProjectPrompt(projectId: string, phase: string, filename: string) {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/prompts/${phase}/${filename}`);
      if (!res.ok) throw new Error('Failed to fetch project prompt content');
      return await res.text();
    } catch (error) {
      console.error('Project prompt content error:', error);
      return '';
    }
  },

  async updateProjectPrompt(projectId: string, phase: string, filename: string, content: string) {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/prompts/${phase}/${filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to update project prompt');
      return await res.json();
    } catch (error) {
      console.error('Update project prompt error:', error);
      throw error;
    }
  },

  async getRoadmap(projectId: string) {
    try {
      const res = await fetch(`${API_BASE}/api/roadmap?projectId=${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch roadmap');
      return await res.json();
    } catch (error) {
      console.error('Roadmap error:', error);
      return [];
    }
  },

  async getGit() {
    try {
      const res = await fetch(`${API_BASE}/api/git`);
      if (!res.ok) throw new Error('Failed to fetch git');
      return await res.json();
    } catch (error) {
      console.error('Git error:', error);
      return { branch: 'unknown', changes: [], commits: [] };
    }
  },

  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return await res.json();
    } catch (error) {
      console.error('Stats error:', error);
      return {};
    }
  },

  async getDocker() {
    try {
      const res = await fetch(`${API_BASE}/api/docker`);
      if (!res.ok) throw new Error('Failed to fetch docker');
      return await res.json();
    } catch (error) {
      console.error('Docker error:', error);
      return [];
    }
  },

  async getTests() {
    try {
      const res = await fetch(`${API_BASE}/api/tests`);
      if (!res.ok) throw new Error('Failed to fetch tests');
      return await res.json();
    } catch (error) {
      console.error('Tests error:', error);
      return {};
    }
  },

  async getSecurity() {
    try {
      const res = await fetch(`${API_BASE}/api/security`);
      if (!res.ok) throw new Error('Failed to fetch security');
      return await res.json();
    } catch (error) {
      console.error('Security error:', error);
      return { keys: [] };
    }
  },

  streamLogs(onMessage: (logs: string) => void) {
    try {
      const eventSource = new EventSource(`${API_BASE}/logs`);
      eventSource.onmessage = (event) => {
        onMessage(event.data);
      };
      return () => eventSource.close();
    } catch (error) {
      console.error('Stream logs error:', error);
      return () => {};
    }
  }
};
