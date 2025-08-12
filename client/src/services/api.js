import axios from 'axios';

const isLocal = window.location.hostname === 'localhost';

const api = axios.create({
  baseURL: isLocal
    ? 'http://localhost:5001/api' // local backend
    : 'https://splitit-smart-bill-splitter.onrender.com/api', // render backend
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // important if you're sending cookies or sessions
});

export default api;
