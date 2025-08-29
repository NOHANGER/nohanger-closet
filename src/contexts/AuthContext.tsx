import React, { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "@auth_token";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted auth state
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        setIsAuthenticated(Boolean(token));
      } catch (e) {
        console.error("Auth load error", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Placeholder login: accept any non-empty values and persist a dummy token.
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const token = `demo.${Date.now()}`;
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(() => ({ isAuthenticated, isLoading, login, logout }), [isAuthenticated, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

