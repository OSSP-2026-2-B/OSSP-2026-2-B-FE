import api from './axios';

export async function getObservations(signal) {
  const { data } = await api.get('/api/observations', { signal });
  return data;
}
