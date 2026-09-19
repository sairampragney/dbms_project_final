import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('disaster_app_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Health & Dashboard
export const getHealth = () => api.get('/health');
export const getDashboardStats = () => api.get('/dashboard/stats');

// Auth API
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');

// Disaster Alerts API
export const getAlerts = (params) => api.get('/alerts', { params });
export const getAlertById = (id) => api.get(`/alerts/${id}`);
export const createAlert = (data) => api.post('/alerts', data);
export const updateAlert = (id, data) => api.put(`/alerts/${id}`, data);
export const deleteAlert = (id) => api.delete(`/alerts/${id}`);

// Incidents API
export const getIncidents = (params) => api.get('/incidents', { params });
export const getIncidentById = (id) => api.get(`/incidents/${id}`);
export const createIncident = (data) => api.post('/incidents', data);
export const updateIncident = (id, data) => api.put(`/incidents/${id}`, data);
export const deleteIncident = (id) => api.delete(`/incidents/${id}`);

// Emergency Assistance Requests API
export const getRequests = (params) => api.get('/emergency-requests', { params });
export const getRequestById = (id) => api.get(`/emergency-requests/${id}`);
export const createRequest = (data) => api.post('/emergency-requests', data);
export const updateRequest = (id, data) => api.put(`/emergency-requests/${id}`, data);
export const deleteRequest = (id) => api.delete(`/emergency-requests/${id}`);

// Safe Locations Shelters API
export const getLocations = (params) => api.get('/safe-locations', { params });
export const getLocationById = (id) => api.get(`/safe-locations/${id}`);
export const createLocation = (data) => api.post('/safe-locations', data);
export const updateLocation = (id, data) => api.put(`/safe-locations/${id}`, data);
export const deleteLocation = (id) => api.delete(`/safe-locations/${id}`);

// Volunteers API
export const getVolunteers = (params) => api.get('/volunteers', { params });
export const getVolunteerById = (id) => api.get(`/volunteers/${id}`);
export const registerVolunteer = (data) => api.post('/volunteers', data);
export const updateVolunteer = (id, data) => api.put(`/volunteers/${id}`, data);
export const deleteVolunteer = (id) => api.delete(`/volunteers/${id}`);

// Response Records API
export const getResponses = (params) => api.get('/response-records', { params });
export const getResponseById = (id) => api.get(`/response-records/${id}`);
export const assignResponse = (data) => api.post('/response-records', data);
export const updateResponse = (id, data) => api.put(`/response-records/${id}`, data);
export const deleteResponse = (id) => api.delete(`/response-records/${id}`);

export default api;
