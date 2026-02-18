import React, { createContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppSettings = {
  notifications: boolean;
  feedVisibility: "public" | "followers" | "private";
  language: string;
  showHiddenItems: boolean;
  autoBackgroundRemoval: boolean;
  autoColorDetection: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  notifications: true,
  feedVisibility: "public",
  language: "English",
  showHiddenItems: false,
  autoBackgroundRemoval: true,
  autoColorDetection: true,
};

type SettingsContextType = {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

const SETTINGS_KEY = "@app_settings";

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(SETTINGS_KEY);
        if (json) {
          const saved = JSON.parse(json);
          setSettings({ ...DEFAULT_SETTINGS, ...saved });
        }
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch((e) =>
      console.error("Error saving settings:", e)
    );
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({ settings, updateSetting, resetSettings }),
    [settings, updateSetting, resetSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
