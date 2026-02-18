import "react-native-gesture-handler";
import "react-native-reanimated";
import "react-native-get-random-values";
import { useFonts } from "expo-font";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import AppNavigator from "./src/navigation";
import { ClothingProvider } from "./src/contexts/ClothingContext";
import { VirtualTryOnProvider } from "./src/contexts/VirtualTryOnContext";
import { OutfitProvider } from "./src/contexts/OutfitContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { PlannerProvider } from "./src/contexts/PlannerContext";
import { SettingsProvider } from "./src/contexts/SettingsContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, ActivityIndicator, View } from "react-native";

export default function App() {
  const [fontsLoaded] = useFonts({
    "PlusJakartaSans-Regular": PlusJakartaSans_400Regular,
    "PlusJakartaSans-Medium": PlusJakartaSans_500Medium,
    "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
    "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SettingsProvider>
        <AuthProvider>
          <ClothingProvider>
            <OutfitProvider>
              <PlannerProvider>
                <VirtualTryOnProvider>
                  <AppNavigator />
                </VirtualTryOnProvider>
              </PlannerProvider>
            </OutfitProvider>
          </ClothingProvider>
        </AuthProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
