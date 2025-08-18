import 'dotenv/config';
export default {
  expo: {
    name: 'Nohanger Closet',
    slug: 'nohanger-closet',
    scheme: 'nohanger',
    orientation: 'portrait',
    icon: './assets/icons/app-icon.png',
    userInterfaceStyle: 'automatic',
    splash: { image: './assets/images/splash.png', resizeMode: 'contain', backgroundColor: '#F9F9F9' },
    ios: { supportsTablet: true, bundleIdentifier: 'com.nohanger.closet' },
    android: { package: 'com.nohanger.closet', adaptiveIcon: { foregroundImage: './assets/icons/adaptive-icon.png', backgroundColor: '#FFFFFF' } },
    web: { bundler: 'metro' },
    extra: { apiBaseUrl: process.env.API_BASE_URL }
  }
};
