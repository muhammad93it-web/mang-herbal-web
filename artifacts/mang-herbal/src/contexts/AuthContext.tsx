import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, useGetMe, getGetMeQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('mang_token'));
  
  // Custom headers approach using fetch in the client is typically handled by setting default headers or interceptors. 
  // For the auto-generated hooks, if standard fetch is used, we usually rely on credentials or modifying custom-fetch.
  // Assuming the token is in localstorage and customFetch can be patched, or we just rely on standard auth.
  // Actually, we are asked to store JWT in localStorage under "mang_token".
  // Let's use the token state.
  
  const { data: user, isLoading, isError } = useGetMe({ 
    query: { 
      enabled: !!token, 
      queryKey: getGetMeQueryKey(),
      retry: false
    },
    request: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    }
  });

  const setAuth = (newUser: User, newToken: string) => {
    localStorage.setItem('mang_token', newToken);
    setTokenState(newToken);
    queryClient.setQueryData(getGetMeQueryKey(), newUser);
  };

  const logout = () => {
    localStorage.removeItem('mang_token');
    setTokenState(null);
    queryClient.setQueryData(getGetMeQueryKey(), null);
  };

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError]);

  return (
    <AuthContext.Provider value={{ user: user || null, token, isLoading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
