import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('miskara_user')) || null; }
    catch { return null; }
  });

  const login = useCallback(async (creds) => {
    const { data } = await authService.login(creds);
    localStorage.setItem('miskara_user', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await authService.register(userData);
    localStorage.setItem('miskara_user', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('miskara_user');
    setUser(null);
    toast.success('Logged out');
  }, []);

  const updateUser = useCallback((data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('miskara_user', JSON.stringify(updated));
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isAdmin: user?.role === 'admin',
      isVerified: user?.isEmailVerified,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
