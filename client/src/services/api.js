import axios from 'axios';



const api = axios.create({
  baseURL: 'https://splitit-smart-bill-splitter.onrender.com/', // Replace with your Render URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;