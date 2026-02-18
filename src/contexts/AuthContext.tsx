import React, { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

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

// Basic email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string; // SHA-256 hash, not plain text
  profile: UserProfile;
};

// Hash a password with a fixed salt for demo purposes.
// In production, use bcrypt with a per-user salt via a backend.
const hashPassword = async (password: string): Promise<string> => {
  const salted = `nohanger_demo_salt:${password}`;
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salted);
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
        if (__DEV__) console.error("Auth load error", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const e = email.trim().toLowerCase();
    if (!e || !password) throw new Error("Email and password are required");
    if (!EMAIL_REGEX.test(e)) throw new Error("Please enter a valid email address");
    const record = users[e];
    // Use generic error to avoid account enumeration
    if (!record) throw new Error("Invalid email or password");
    const candidateHash = await hashPassword(password);
    // Support legacy plain-text records (migration path)
    const storedValue = record.passwordHash ?? (record as any).password;
    const isPlainText = !record.passwordHash && (record as any).password;
    if (isPlainText) {
      if (storedValue !== password) throw new Error("Invalid email or password");
    } else {
      if (storedValue !== candidateHash) throw new Error("Invalid email or password");
    }

    // Set token + profile
    const token = Crypto.randomUUID();
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
      const next = { ...(prev ?? {}), ...patch } as UserProfile;
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)).catch((e) => {
        if (__DEV__) console.error("Failed to persist profile update:", e);
      });
      return next;
    });
  }, []);

  const signup = useCallback(
    async (email: string, password: string, p?: Partial<UserProfile>) => {
      const e = email.trim().toLowerCase();
      if (!e || !password) throw new Error("Email and password are required");
      if (!EMAIL_REGEX.test(e)) throw new Error("Please enter a valid email address");
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      if (users[e]) throw new Error("An account with this email already exists");

      const passwordHash = await hashPassword(password);

      const record: UserRecord = {
        id: Crypto.randomUUID(),
        email: e,
        passwordHash,
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
      const token = Crypto.randomUUID();
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
