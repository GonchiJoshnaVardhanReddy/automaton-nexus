/**
 * API Service - Handles all backend API calls
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  extractErrorMessage(payload, fallback = 'Request failed') {
    if (!payload) {
      return fallback;
    }

    if (typeof payload === 'string') {
      return payload;
    }

    if (Array.isArray(payload)) {
      return payload
        .map((item) => this.extractErrorMessage(item, ''))
        .filter(Boolean)
        .join(', ') || fallback;
    }

    if (typeof payload === 'object') {
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message;
      }

      if (typeof payload.detail === 'string' && payload.detail.trim()) {
        return payload.detail;
      }

      if (Array.isArray(payload.detail)) {
        return this.extractErrorMessage(payload.detail, fallback);
      }

      if (Array.isArray(payload.errors)) {
        return this.extractErrorMessage(payload.errors, fallback);
      }
    }

    return fallback;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('auth_token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('user');
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    let payload = options.body;
    if (typeof payload === 'string' && headers['Content-Type'] === 'application/json') {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = options.body;
      }
    }

    try {
      const response = await axios({
        url,
        method: options.method || 'GET',
        headers,
        data: payload,
        validateStatus: () => true,
      });

      if (response.status === 401) {
        this.logout();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      const data = response.data;

      if (response.status < 200 || response.status >= 300) {
        throw new Error(this.extractErrorMessage(data, 'Request failed'));
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async register(name, email, password) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setToken(data.access_token);
    localStorage.setItem('user', JSON.stringify({ name, email }));
    return data;
  }

  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    localStorage.setItem('user', JSON.stringify({ email }));
    return data;
  }

  // Agent endpoints
  async getAgents() {
    return this.request('/api/agents');
  }

  async getAgent(id) {
    return this.request(`/api/agents/${id}`);
  }

  async createAgent(agentData) {
    return this.request('/api/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  async updateAgent(id, agentData) {
    return this.request(`/api/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });
  }

  async deleteAgent(id) {
    return this.request(`/api/agents/${id}`, {
      method: 'DELETE',
    });
  }

  async activateAgent(id) {
    return this.request(`/api/agents/${id}/activate`, {
      method: 'POST',
    });
  }

  async pauseAgent(id) {
    return this.request(`/api/agents/${id}/pause`, {
      method: 'POST',
    });
  }

  // Campaign endpoints
  async getCampaigns() {
    return this.request('/api/campaigns');
  }

  async getCampaign(id) {
    return this.request(`/api/campaigns/${id}`);
  }

  async createCampaign(campaignData) {
    return this.request('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async startCampaign(id) {
    return this.request(`/api/campaigns/${id}/start`, {
      method: 'POST',
    });
  }

  async pauseCampaign(id) {
    return this.request(`/api/campaigns/${id}/pause`, {
      method: 'POST',
    });
  }

  async getCampaignCalls(id) {
    return this.request(`/api/campaigns/${id}/calls`);
  }

  // Results endpoints
  async getDashboardStats(days = 7) {
    return this.request(`/api/results/stats?days=${days}`);
  }

  async getAllCalls(limit = 100, skip = 0) {
    return this.request(`/api/results/calls?limit=${limit}&skip=${skip}`);
  }

  async getDailyStats(days = 7) {
    return this.request(`/api/results/daily?days=${days}`);
  }

  // Community Skills endpoints
  async getSkills(params = {}) {
    const qs = new URLSearchParams();
    if (params.tag) qs.set('tag', params.tag);
    if (params.language) qs.set('language', params.language);
    if (params.sort) qs.set('sort', params.sort);
    if (params.search) qs.set('search', params.search);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return this.request(`/api/skills${query}`);
  }

  async getMySkills() {
    return this.request('/api/skills/my');
  }

  async getSkill(id) {
    return this.request(`/api/skills/${id}`);
  }

  async createSkill(skillData) {
    return this.request('/api/skills', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async updateSkill(id, skillData) {
    return this.request(`/api/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skillData),
    });
  }

  async deleteSkill(id) {
    return this.request(`/api/skills/${id}`, {
      method: 'DELETE',
    });
  }

  async cloneSkill(id) {
    return this.request(`/api/skills/${id}/clone`, {
      method: 'POST',
    });
  }

  async useSkill(id) {
    return this.request(`/api/skills/${id}/use`, {
      method: 'POST',
    });
  }

  async generateAgentFromSkill(payload) {
    return this.request('/api/skills/generate-agent', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // WebSocket connection
  connectWebSocket(onMessage) {
    const token = this.getToken();
    if (!token) return null;

    const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(`${wsUrl}/api/ws/${token}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return ws;
  }
}

export const api = new ApiService();
export default api;
