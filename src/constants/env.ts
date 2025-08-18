import Constants from 'expo-constants';
type Extra = { apiBaseUrl?: string };
const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
export const ENV = { API_BASE_URL: extra.apiBaseUrl || 'https://api.example.com' };
