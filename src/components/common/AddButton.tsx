import React from "react";
import { StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { elevation } from "../../styles/globalStyles";
import PressableFade from "./PressableFade";

const AddButton = ({ onPress }: { onPress: () => void }) => (
  <PressableFade style={styles.button} onPress={onPress}>
    <MaterialIcons name="add" size={24} color={colors.icon_stroke} />
  </PressableFade>
);

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 26,
    right: 22,
    backgroundColor: colors.primary_yellow,
    borderRadius: 28,
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border_gray,
    ...elevation.floating,
  },
});

export default AddButton;
