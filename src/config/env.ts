// Environment configuration with safe defaults
// Uses EXPO_PUBLIC_ prefix for Expo-managed env vars

type EnvConfig = {
  // API endpoints
  TAGGING_API_URL: string;
  TAGGING_API_TOKEN: string;

  // FAL.ai background removal
  FAL_API_KEY: string;

  // Kwai Virtual Try-On
  KWAI_ACCESS_KEY: string;
  KWAI_SECRET_KEY: string;

  // Feature flags
  ENABLE_BACKGROUND_REMOVAL: boolean;
  ENABLE_COLOR_DETECTION: boolean;
  ENABLE_REMOTE_CATEGORIZATION: boolean;
  ENABLE_VIRTUAL_TRYON: boolean;
  ENABLE_COMMUNITY: boolean;
};

function getEnvVar(key: string, defaultValue: string = ""): string {
  // Expo public env vars
  const value = (process.env as Record<string, string | undefined>)[`EXPO_PUBLIC_${key}`];
  return value ?? defaultValue;
}

function getEnvBool(key: string, defaultValue: boolean = true): boolean {
  const value = getEnvVar(key, "");
  if (value === "") return defaultValue;
  return value === "true" || value === "1";
}

export const env: EnvConfig = {
  // API endpoints
  TAGGING_API_URL: getEnvVar("TAGGING_API_URL"),
  TAGGING_API_TOKEN: getEnvVar("TAGGING_API_TOKEN"),

  // FAL.ai
  FAL_API_KEY: getEnvVar("FAL_API_KEY"),

  // Kwai
  KWAI_ACCESS_KEY: getEnvVar("KWAI_ACCESS_KEY"),
  KWAI_SECRET_KEY: getEnvVar("KWAI_SECRET_KEY"),

  // Feature flags — default ON for core features, OFF for external services
  ENABLE_BACKGROUND_REMOVAL: getEnvBool("ENABLE_BACKGROUND_REMOVAL", true),
  ENABLE_COLOR_DETECTION: getEnvBool("ENABLE_COLOR_DETECTION", true),
  ENABLE_REMOTE_CATEGORIZATION: getEnvBool("ENABLE_REMOTE_CATEGORIZATION", false),
  ENABLE_VIRTUAL_TRYON: getEnvBool("ENABLE_VIRTUAL_TRYON", true),
  ENABLE_COMMUNITY: getEnvBool("ENABLE_COMMUNITY", true),
};

export const isApiConfigured = {
  tagging: () => Boolean(env.TAGGING_API_URL && env.TAGGING_API_TOKEN),
  fal: () => Boolean(env.FAL_API_KEY),
  kwai: () => Boolean(env.KWAI_ACCESS_KEY && env.KWAI_SECRET_KEY),
};
