import axios from 'axios';

const api = axios.create({
  // Use environment variable for backend API base URL, fallback to localhost for dev
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 