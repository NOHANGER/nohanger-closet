import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";
import Header from "../../components/common/Header";
import { CommunityStackScreenProps } from "../../types/navigation";

type Props = CommunityStackScreenProps<"CommunityCreate">;

const CreateScreen: React.FC<Props> = ({ navigation }) => {
  const safeAreaEdges: Edge[] = ["top", "left", "right"]; 
  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <Header onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Create</Text>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => {
            try {
              navigation.navigate('Outfits', { screen: 'OutfitCanvas', params: { id: undefined } });
            } catch {
              navigation.navigate('Outfits');
            }
          }}
        >
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="tshirt-crew-outline" size={22} color={colors.text_primary} />
          </View>
          <Text style={styles.label}>Create new outfit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  content: { padding: 16 },
  title: { fontFamily: typography.bold, fontSize: 20, color: colors.text_primary, marginBottom: 12 },
  card: {
    height: 90,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: { width: 42, height: 42, borderRadius: 10, backgroundColor: colors.light_yellow, alignItems: 'center', justifyContent: 'center' },
  label: { marginTop: 8, fontFamily: typography.medium, color: colors.text_primary },
});

export default CreateScreen;

