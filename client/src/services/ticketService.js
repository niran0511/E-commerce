import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopsmart-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const ticketService = {
  // User creates a ticket
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  
  // Admin fetches all tickets
  getAdminTickets: () => api.get('/tickets/admin'),
};

export default ticketService;
