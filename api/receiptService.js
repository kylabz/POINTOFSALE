import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export async function fetchReceipts() {
  const response = await axios.get(`${API_BASE_URL}/receipts`);
  return response.data;
}
