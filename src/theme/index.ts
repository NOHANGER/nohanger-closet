import { useColorScheme } from 'react-native';
export const useTheme = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: {
      background: isDark ? '#0B0B0B' : '#F9F9F9',
      text: isDark ? '#EFEFEF' : '#1C1C1C',
      accent: '#34C759',
      card: isDark ? '#141414' : '#FFFFFF',
      border: isDark ? '#222' : '#E6E6E6',
    },
    spacing: (n = 1) => n * 8,
    radius: { sm: 8, md: 16, lg: 24 },
  };
};
