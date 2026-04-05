import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hizzs-user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username, email = '') => {
    const userData = {
      username,
      email,
      initial: username[0]?.toUpperCase() || '?',
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem('hizzs-user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('hizzs-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
