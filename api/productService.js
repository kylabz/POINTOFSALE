import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export async function fetchProducts() {
  const response = await axios.get(`${API_BASE_URL}/products`);
  return response.data;
}
