import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, StyleSheet, View, ActivityIndicator } from "react-native";
import { MaterialIcons, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import ClothingManagementScreen from "../screens/ClothingManagementScreen";
import ClothingDetailScreen from "../screens/ClothingDetailScreen";
import OutfitManagementScreen from "../screens/OutfitManagementScreen";
import OutfitCanvasScreen from "../screens/OutfitCanvasScreen";
import OutfitDetailScreen from "../screens/OutfitDetailScreen";
import VirtualTryOnScreen from "../screens/VirtualTryOnScreen";
import CommunityScreen from "../screens/CommunityScreen";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import {
  RootStackParamList,
  MainTabParamList,
  ClosetStackParamList,
  OutfitStackParamList,
  TryOnStackParamList,
  AuthStackParamList,
} from "../types/navigation";
import LoginScreen from "../screens/LoginScreen";
import WardrobeScreen from "../screens/WardrobeScreen";
import { AuthContext } from "../contexts/AuthContext";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const ClosetStack = createNativeStackNavigator<ClosetStackParamList>();
const OutfitStack = createNativeStackNavigator<OutfitStackParamList>();
const TryOnStack = createNativeStackNavigator<TryOnStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const ProfileScreen = () => <></>;

// Stack Navigators
const ClosetStackNavigator = () => (
  <ClosetStack.Navigator screenOptions={{ headerShown: false }}>
    <ClosetStack.Screen name="ClothingManagement" component={ClothingManagementScreen} />
    <ClosetStack.Screen name="ClothingDetail" component={ClothingDetailScreen} />
  </ClosetStack.Navigator>
);

const OutfitStackNavigator = () => (
  <OutfitStack.Navigator screenOptions={{ headerShown: false }}>
    <OutfitStack.Screen name="OutfitManagement" component={OutfitManagementScreen} />
    <OutfitStack.Screen name="OutfitCanvas" component={OutfitCanvasScreen} />
    <OutfitStack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
  </OutfitStack.Navigator>
);

const TryOnStackNavigator = () => (
  <TryOnStack.Navigator screenOptions={{ headerShown: false }}>
    <TryOnStack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
  </TryOnStack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.text_primary,
      tabBarInactiveTintColor: colors.text_gray,
      tabBarLabelStyle: styles.tabBarLabel,
      tabBarIconStyle: styles.tabBarIcon,
    }}
  >
    <Tab.Screen
      name="Community"
      component={CommunityScreen}
      options={{
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Closet"
      component={ClosetStackNavigator}
      options={{
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="wardrobe" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Outfits"
      component={OutfitStackNavigator}
      options={{
        tabBarIcon: ({ color, size }) => <MaterialIcons name="style" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="TryOn"
      component={TryOnStackNavigator}
      options={{
        tabBarLabel: "Try-On",
        tabBarIcon: ({ color, size }) => <FontAwesome6 name="wand-magic-sparkles" size={20} color={color} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={WardrobeScreen}
      options={{
        tabBarLabel: "Wardrobe",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="wardrobe-outline" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  const auth = useContext(AuthContext);

  return (
    <NavigationContainer>
      {auth?.isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : auth?.isAuthenticated ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
          <RootStack.Group screenOptions={{ presentation: "modal" }}>
            <RootStack.Screen name="ClothingDetailModal" component={ClothingDetailScreen} />
            <RootStack.Screen name="OutfitDetailModal" component={OutfitDetailScreen} />
          </RootStack.Group>
        </RootStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === "ios" ? 90 : 60,
    paddingBottom: Platform.OS === "ios" ? 32 : 10,
    paddingTop: 10,
    backgroundColor: colors.screen_background,
    borderTopColor: colors.divider_light,
    borderTopWidth: 1,
    elevation: 0,
  },
  tabBarLabel: {
    fontFamily: typography.medium,
    fontSize: 12,
    marginTop: 4,
  },
  tabBarIcon: {
    marginTop: 4,
  },
});

export default AppNavigator;
