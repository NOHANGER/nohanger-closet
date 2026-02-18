import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const typography = {
  regular: "PlusJakartaSans-Regular",
  medium: "PlusJakartaSans-Medium",
  semiBold: "PlusJakartaSans-SemiBold",
  bold: "PlusJakartaSans-Bold",
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
};

export const elevation = {
  card: {
    elevation: 2,
    shadowColor: "#1F2A37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  floating: {
    elevation: 4,
    shadowColor: "#1F2A37",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },
  titleText: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.text_gray,
  },
  bodyText: {
    fontFamily: typography.regular,
    fontSize: 16,
    color: colors.text_primary,
  },
});
