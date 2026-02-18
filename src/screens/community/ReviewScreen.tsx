import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";
import Header from "../../components/common/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CommunityStackScreenProps } from "../../types/navigation";
import { OutfitContext } from "../../contexts/OutfitContext";

type Props = CommunityStackScreenProps<"CommunityReview">;

type OutfitRating = {
  rating: number;
  note: string;
};

const StarRating: React.FC<{
  rating: number;
  onRate: (star: number) => void;
}> = ({ rating, onRate }) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => onRate(star)} activeOpacity={0.7}>
        <MaterialCommunityIcons
          name={star <= rating ? "star" : "star-outline"}
          size={28}
          color={star <= rating ? colors.primary_yellow : colors.border_gray}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const ReviewScreen: React.FC<Props> = ({ navigation }) => {
  const safeAreaEdges: Edge[] = ["top", "left", "right"];
  const outfitCtx = useContext(OutfitContext);
  const outfits = outfitCtx?.outfits ?? [];

  const [ratings, setRatings] = useState<Record<string, OutfitRating>>({});

  const getRating = (id: string): OutfitRating =>
    ratings[id] ?? { rating: 0, note: "" };

  const setOutfitRating = (id: string, star: number) => {
    setRatings((prev) => ({
      ...prev,
      [id]: { ...getRating(id), rating: star },
    }));
  };

  const setOutfitNote = (id: string, note: string) => {
    setRatings((prev) => ({
      ...prev,
      [id]: { ...getRating(id), note },
    }));
  };

  const recentOutfits = [...outfits]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <Header onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Rate This Look</Text>
        <Text style={styles.subtitle}>
          Review your recent outfits and rate them to track your favorites.
        </Text>

        {recentOutfits.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="hanger"
              size={64}
              color={colors.border_gray}
            />
            <Text style={styles.emptyTitle}>No outfits yet</Text>
            <Text style={styles.emptyBody}>
              Create some outfits first, then come back to rate them.
            </Text>
          </View>
        ) : (
          recentOutfits.map((outfit) => {
            const current = getRating(outfit.id);
            return (
              <View key={outfit.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Image
                    source={{ uri: outfit.imageUri }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardDate}>
                      {new Date(outfit.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                    {outfit.tags.length > 0 && (
                      <View style={styles.tagRow}>
                        {outfit.tags.slice(0, 3).map((tag) => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {outfit.occasion.length > 0 && (
                      <Text style={styles.occasionText}>
                        {outfit.occasion.join(", ")}
                      </Text>
                    )}
                    <StarRating
                      rating={current.rating}
                      onRate={(star) => setOutfitRating(outfit.id, star)}
                    />
                    {current.rating > 0 && (
                      <Text style={styles.ratingLabel}>
                        {current.rating === 5
                          ? "Love it!"
                          : current.rating === 4
                          ? "Great look"
                          : current.rating === 3
                          ? "It's okay"
                          : current.rating === 2
                          ? "Not my best"
                          : "Skip this one"}
                      </Text>
                    )}
                  </View>
                </View>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Add a note about this outfit..."
                  placeholderTextColor={colors.text_gray}
                  value={current.note}
                  onChangeText={(text) => setOutfitNote(outfit.id, text)}
                  multiline
                  maxLength={200}
                />
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  content: { padding: 16, paddingBottom: 40 },
  title: {
    fontFamily: typography.bold,
    fontSize: 20,
    color: colors.text_primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: typography.regular,
    fontSize: 14,
    color: colors.text_gray,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: typography.semiBold,
    fontSize: 18,
    color: colors.text_primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyBody: {
    fontFamily: typography.regular,
    fontSize: 14,
    color: colors.text_gray,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: "row",
    padding: 12,
  },
  thumbnail: {
    width: 90,
    height: 110,
    borderRadius: 8,
    backgroundColor: colors.thumbnail_background,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  cardDate: {
    fontFamily: typography.medium,
    fontSize: 13,
    color: colors.text_gray,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: colors.tag_light,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: typography.medium,
    fontSize: 11,
    color: colors.tag_light_text,
  },
  occasionText: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: colors.text_gray,
    marginBottom: 8,
  },
  starRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  ratingLabel: {
    fontFamily: typography.medium,
    fontSize: 12,
    color: colors.primary_yellow,
    marginTop: 4,
  },
  noteInput: {
    borderTopWidth: 1,
    borderTopColor: colors.border_gray_light,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: typography.regular,
    fontSize: 13,
    color: colors.text_primary,
    minHeight: 40,
  },
});

export default ReviewScreen;
