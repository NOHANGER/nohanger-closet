import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

type FeedItem = {
  id: string;
  title: string;
  image: any; // static require
  suggested?: boolean;
};

const DUMMY_FEED: FeedItem[] = [
  {
    id: "1",
    title: "Suggested for you",
    image: require("../../release_assets/all_outfits.png"),
    suggested: true,
  },
  {
    id: "2",
    title: "Minimal street style",
    image: require("../../release_assets/outfit_canvas.png"),
  },
];

const FILTERS = ["For You", "Outfit Selfies", "Style Submissions: All"] as const;

const QuickAction: React.FC<{ icon: React.ReactNode; label: string; onPress?: () => void }> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.quickIcon}>{icon}</View>
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

const CommunityScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>(FILTERS[0]);
  const [reactions, setReactions] = useState<Record<string, number>>({});

  const feed = useMemo(() => DUMMY_FEED, []);

  const react = (id: string) => {
    setReactions((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.profileWrap}>
          <View style={styles.avatar} />
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>30%</Text>
          </View>
          <Text style={styles.greeting}>Hey!</Text>
        </View>
        <View style={styles.headerIcons}>
          <MaterialIcons name="notifications-none" size={22} color={colors.text_primary} />
          <View style={{ width: 12 }} />
          <MaterialIcons name="search" size={22} color={colors.text_primary} />
        </View>
      </View>

      {/* Quick actions */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
        <QuickAction icon={<MaterialCommunityIcons name="cloud-upload-outline" size={20} color={colors.text_primary} />} label="Upload" />
        <QuickAction icon={<MaterialIcons name="add-circle-outline" size={20} color={colors.text_primary} />} label="Create" />
        <QuickAction icon={<Ionicons name="calendar-outline" size={20} color={colors.text_primary} />} label="Plan" />
        <QuickAction icon={<MaterialIcons name="rate-review" size={20} color={colors.text_primary} />} label="Review" />
        <QuickAction icon={<Ionicons name="book-outline" size={20} color={colors.text_primary} />} label="Read" />
      </ScrollView>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => {
          const selected = f === activeFilter;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, selected ? styles.filterPillSelected : undefined]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, selected ? styles.filterTextSelected : undefined]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Feed */}
      {feed.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.suggested && <View style={styles.suggestedDot} />}
          </View>
          <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.reactBtn} onPress={() => react(item.id)}>
              <MaterialCommunityIcons name="hand-clap" size={18} color={colors.text_primary} />
              <Text style={styles.reactText}>Tap to react</Text>
            </TouchableOpacity>
            <Text style={styles.reactCount}>{reactions[item.id] || 0}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  content: { padding: 16, paddingBottom: 32 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  profileWrap: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.thumbnail_background, marginRight: 10 },
  progressBadge: {
    position: "absolute",
    left: 22,
    top: -6,
    backgroundColor: colors.light_yellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
  },
  progressText: { fontFamily: typography.medium, fontSize: 10, color: colors.text_primary },
  greeting: { fontFamily: typography.bold, fontSize: 18, color: colors.text_primary, marginLeft: 8 },
  headerIcons: { flexDirection: "row", alignItems: "center" },

  quickRow: { paddingVertical: 16 },
  quickAction: {
    width: 84,
    height: 84,
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  quickIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.light_yellow, alignItems: "center", justifyContent: "center" },
  quickLabel: { marginTop: 8, fontFamily: typography.medium, fontSize: 12, color: colors.text_primary },

  filterRow: { paddingBottom: 8 },
  filterPill: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.tag_light,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  filterPillSelected: { backgroundColor: colors.tag_dark, borderColor: colors.tag_dark },
  filterText: { fontFamily: typography.medium, fontSize: 12, color: colors.text_gray },
  filterTextSelected: { color: colors.tag_dark_text },

  card: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border_gray_light,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10 },
  cardTitle: { fontFamily: typography.medium, fontSize: 13, color: colors.text_primary },
  suggestedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary_yellow },
  cardImage: { width: "100%", height: 240, backgroundColor: colors.thumbnail_background },
  cardFooter: { paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reactBtn: { flexDirection: "row", alignItems: "center" },
  reactText: { marginLeft: 8, fontFamily: typography.medium, color: colors.text_primary },
  reactCount: { fontFamily: typography.medium, color: colors.text_gray },
});

export default CommunityScreen;

