/**
 * Backend API Client Service
 * Bridges React Frontend with Python FastAPI Scientific Routing Engine
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async getNetworkStatus(): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/traffic/network`);
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  }

  async optimizeRoute(params: {
    origin: string;
    destination: string;
    weights: {
      timeWeight: number;
      congestionWeight: number;
      distanceWeight: number;
      fuelWeight: number;
      emissionsWeight: number;
    };
  }): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/routes/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  }
}

export const api = new ApiService();
