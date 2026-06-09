import api from './api';

const ticketService = {
  // User creates a ticket
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  
  // Admin fetches all tickets
  getAdminTickets: () => api.get('/tickets/admin'),
};

export default ticketService;
