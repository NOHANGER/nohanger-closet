import React from 'react';
import * as SystemUI from 'expo-system-ui';
import AppNavigator from '../navigation/AppNavigator';
export default function App() {
  React.useEffect(() => { SystemUI.setBackgroundColorAsync('#F9F9F9').catch(() => {}); }, []);
  return <AppNavigator />;
}
