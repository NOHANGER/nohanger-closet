import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";
import Header from "../../components/common/Header";
import { CommunityStackScreenProps } from "../../types/navigation";

type Props = CommunityStackScreenProps<"CommunityReview">;

const ReviewScreen: React.FC<Props> = ({ navigation }) => {
  const safeAreaEdges: Edge[] = ["top", "left", "right"]; 
  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <Header onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Review</Text>
        <Text style={styles.body}>Coming soon — add your review workflows here.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  content: { padding: 16 },
  title: { fontFamily: typography.bold, fontSize: 20, color: colors.text_primary, marginBottom: 8 },
  body: { fontFamily: typography.regular, color: colors.text_gray },
});

export default ReviewScreen;

