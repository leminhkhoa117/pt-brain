import { api, unwrap } from './client.js';

export const listClients = (params = {}) =>
  api.get('/clients', { params }).then(unwrap);
export const createClient = (payload) => api.post('/clients', payload).then(unwrap);
export const updateClient = (id, payload) =>
  api.patch(`/clients/${id}`, payload).then(unwrap);
export const deleteClient = (id) => api.delete(`/clients/${id}`).then(unwrap);
