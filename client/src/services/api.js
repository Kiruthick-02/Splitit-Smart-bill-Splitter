import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://splitit-smart-bill-splitter.onrender.com/',
  headers: {
    'Content-Type': 'application/json',
  },
});


export default api;