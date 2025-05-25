import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export async function fetchAdmins() {
  const response = await axios.get(`${API_BASE_URL}/admin`);
  return response.data;
}
