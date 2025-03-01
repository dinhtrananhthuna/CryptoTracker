// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = '/api'; // Sử dụng proxy, không cần http://localhost:5000

export const getCoins = async () => {
  const response = await axios.get(`${API_BASE_URL}/coins`);
  return response.data;
};

// Thêm các hàm gọi API khác (addCoin, updateCoin, ...)