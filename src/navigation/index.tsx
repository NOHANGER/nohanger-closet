import React, { useContext } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
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
import PlannerScreen from "../screens/PlannerScreen";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import {
  RootStackParamList,
  MainTabParamList,
  ClosetStackParamList,
  OutfitStackParamList,
  TryOnStackParamList,
  AuthStackParamList,
  CommunityStackParamList,
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
const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();

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

const CommunityStackNavigator = () => (
  <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
    <CommunityStack.Screen name="CommunityHome" component={CommunityScreen} />
    <CommunityStack.Screen name="CommunityUpload" component={require("../screens/community/UploadScreen").default} />
    <CommunityStack.Screen name="CommunityCreate" component={require("../screens/community/CreateScreen").default} />
    <CommunityStack.Screen name="CommunityPlan" component={require("../screens/community/PlanScreen").default} />
    <CommunityStack.Screen name="CommunityReview" component={require("../screens/community/ReviewScreen").default} />
    <CommunityStack.Screen name="CommunityRead" component={require("../screens/community/ReadScreen").default} />
    <CommunityStack.Screen name="CommunitySettings" component={require("../screens/community/SettingsScreen").default} />
    <CommunityStack.Screen name="CommunityConnections" component={require("../screens/community/ConnectionsScreen").default} />
    <CommunityStack.Screen name="CommunityEditProfile" component={require("../screens/community/EditProfileScreen").default} />
  </CommunityStack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    sceneContainerStyle={{ backgroundColor: colors.screen_background }}
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.text_primary,
      tabBarInactiveTintColor: colors.text_gray,
      tabBarShowLabel: false,
      tabBarIconStyle: styles.tabBarIcon,
      // Exact color match across all tabs
      tabBarBackground: () => (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.screen_background,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border_gray_light,
          }}
        />
      ),
      tabBarHideOnKeyboard: true,
    }}
  >
    <Tab.Screen
      name="Community"
      component={CommunityStackNavigator}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="earth" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Outfits"
      component={OutfitStackNavigator}
      options={{
        tabBarLabel: "Styling",
        tabBarIcon: ({ color, size }) => (
          <FontAwesome6 name="wand-magic-sparkles" size={20} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Planner"
      component={PlannerScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="calendar-blank-outline" size={size} color={color} />
        ),
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

  // Ensure navigation background matches app background
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.screen_background,
      card: colors.screen_background,
    },
  } as const;

  return (
    <NavigationContainer theme={navigationTheme}>
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
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    height: Platform.OS === "ios" ? 78 : 64,
    paddingBottom: Platform.OS === "ios" ? 22 : 10,
    paddingTop: 10,
    // Use transparent here since we draw an explicit background via tabBarBackground
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
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
