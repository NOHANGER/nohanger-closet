import React, { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserProfile = {
  avatarUri?: string;
  coverUri?: string;
  displayName?: string;
  handle?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  location?: string;
  bio?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: UserProfile | null;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  signup: (email: string, password: string, profile?: Partial<UserProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "@auth_token";
const PROFILE_KEY = "@auth_profile";
const USERS_KEY = "@users"; // Demo user store (per device)

type UserRecord = {
  id: string;
  email: string;
  password: string; // NOTE: plain text for demo only
  profile: UserProfile;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<Record<string, UserRecord>>({}); // keyed by email (lowercased)

  // Load persisted auth state
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        setIsAuthenticated(Boolean(token));
        // Load demo user store
        const usersJson = await AsyncStorage.getItem(USERS_KEY);
        if (usersJson) setUsers(JSON.parse(usersJson));
        // Load profile if exists
        const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
        if (profileJson) {
          setProfile(JSON.parse(profileJson));
        } else {
          // seed a minimal profile to keep UI consistent
          setProfile({ displayName: "Hey!", handle: "@you" });
        }
      } catch (e) {
        console.error("Auth load error", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Demo login using local AsyncStorage user store
    const e = email.trim().toLowerCase();
    if (!e || !password) throw new Error("Email and password are required");
    const record = users[e];
    if (!record) throw new Error("No account found. Please sign up.");
    if (record.password !== password) throw new Error("Invalid password");

    // Set token + profile
    const token = `demo.${Date.now()}`;
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(record.profile));
    setProfile(record.profile);
    setIsAuthenticated(true);
  }, [users]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setIsAuthenticated(false);
    // Keep profile cached so UI can persist avatar between sessions if desired
  }, []);

  const updateProfile = useCallback(async (patch: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...(prev || {}), ...patch } as UserProfile;
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)).catch(() => {});
      // Also update current user record if logged in
      (async () => {
        try {
          const token = await AsyncStorage.getItem(TOKEN_KEY);
          if (!token) return; // not logged in
          // find user by matching email in profile (demo uses handle/displayName; store by email in users map)
          // In this demo, we cannot infer email from token; skip updating users map here.
        } catch {}
      })();
      return next;
    });
  }, []);

  const signup = useCallback(
    async (email: string, password: string, p?: Partial<UserProfile>) => {
      const e = email.trim().toLowerCase();
      if (!e || !password) throw new Error("Email and password are required");
      if (users[e]) throw new Error("An account with this email already exists");

      const record: UserRecord = {
        id: `user_${Date.now()}`,
        email: e,
        password, // DEMO ONLY
        profile: {
          displayName: p?.displayName || "Hey!",
          handle: p?.handle || `@${e.split("@")[0]}`,
          avatarUri: p?.avatarUri,
        },
      };

      const nextUsers = { ...users, [e]: record };
      setUsers(nextUsers);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));

      // Auto-login after signup
      const token = `demo.${Date.now()}`;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(record.profile));
      setProfile(record.profile);
      setIsAuthenticated(true);
    },
    [users]
  );

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, profile, updateProfile, signup, login, logout }),
    [isAuthenticated, isLoading, profile, updateProfile, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
