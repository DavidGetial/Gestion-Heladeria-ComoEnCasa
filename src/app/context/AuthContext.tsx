import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkActiveShift = async () => {
    const { data } = await supabase
      .from('shifts')
      .select('*, profiles(name)')
      .eq('status', 'open')
      .maybeSingle();
    setActiveShift(data);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('fruti_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    checkActiveShift();
    setLoading(false);
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('fruti_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fruti_user');
  };

  return (
    <AuthContext.Provider value={{ user, activeShift, login, logout, checkActiveShift, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
