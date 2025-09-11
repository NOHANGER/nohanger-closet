import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";
import { CommunityStackScreenProps } from "../../types/navigation";
import Header from "../../components/common/Header";
import { ClothingContext } from "../../contexts/ClothingContext";

type Props = CommunityStackScreenProps<"CommunityUpload">;

const UploadScreen: React.FC<Props> = ({ navigation }) => {
  const clothing = useContext(ClothingContext);

  const chooseLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "We need gallery permission to select photos.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!res.canceled) {
      try {
        const id = await clothing?.addClothingItemFromImage?.(res.assets[0].uri);
        if (id) {
          Alert.alert("Added", "Item added to your wardrobe.");
        }
      } catch (e) {
        console.error("Failed adding clothing item from library", e);
        Alert.alert("Error", "Failed to add item. Please try again.");
      }
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "We need camera permission to take a photo.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!res.canceled) {
      try {
        const id = await clothing?.addClothingItemFromImage?.(res.assets[0].uri);
        if (id) {
          Alert.alert("Added", "Item added to your wardrobe.");
        }
      } catch (e) {
        console.error("Failed adding clothing item from camera", e);
        Alert.alert("Error", "Failed to add item. Please try again.");
      }
    }
  };

  const safeAreaEdges: Edge[] = ["top", "left", "right"]; 

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <Header onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Upload</Text>
        <TouchableOpacity style={styles.btn} onPress={chooseLibrary} activeOpacity={0.85}>
          <MaterialIcons name="photo-library" size={20} color={colors.text_primary} />
          <Text style={styles.btnText}>Choose from Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={takePhoto} activeOpacity={0.85}>
          <MaterialIcons name="photo-camera" size={20} color={colors.text_primary} />
          <Text style={styles.btnText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  content: { padding: 16 },
  title: { fontFamily: typography.bold, fontSize: 20, color: colors.text_primary, marginBottom: 12 },
  btn: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  btnText: { fontFamily: typography.medium, color: colors.text_primary },
});

export default UploadScreen;
