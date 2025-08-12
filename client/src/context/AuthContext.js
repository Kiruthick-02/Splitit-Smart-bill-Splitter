import { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/users/profile');
      setUser({ id: data._id, username: data.username, avatar: data.avatar });
    } catch {
      // If profile fetch fails, logout the user
      localStorage.removeItem('token');
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          fetchProfile();
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [fetchProfile]);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUserAvatar = (avatarUrl) => {
    setUser(currentUser => ({
      ...currentUser,
      avatar: avatarUrl,
    }));
  };

  return (
    // The typo in the closing tag below has been fixed.
    <AuthContext.Provider value={{ user, login, logout, loading, updateUserAvatar }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;