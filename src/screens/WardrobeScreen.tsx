import React, { useContext, useMemo, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, TextInput, ScrollView } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { MainTabScreenProps } from "../types/navigation";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import PressableFade from "../components/common/PressableFade";
import { ClothingContext } from "../contexts/ClothingContext";
import { OutfitContext } from "../contexts/OutfitContext";

type Props = MainTabScreenProps<"Profile">;

const demoTags = ["ANDROGYNOUS", "BIKER", "BOHO"];

const WardrobeScreen = (_props: Props) => {
  const clothing = useContext(ClothingContext);
  const outfits = useContext(OutfitContext);

  const [query, setQuery] = useState("");

  const items = clothing?.clothingItems || [];
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (it) =>
        it.tags.some((t) => t.toLowerCase().includes(q)) ||
        it.category.toLowerCase().includes(q) ||
        it.subcategory.toLowerCase().includes(q)
    );
  }, [items, query]);

  const itemCount = items.length;
  const outfitCount = outfits?.outfits?.length || 0;

  const safeAreaEdges: Edge[] = ["top", "left", "right"]; // bottom handled by TabBar

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header background */}
        <View style={styles.headerBg}>
          <View style={styles.headerRow}>
            <Image source={require("../../assets/icon.png")} style={styles.avatar} />
            <View style={styles.headerActions}>
              <HeaderCircleIcon icon={<MaterialIcons name="bookmark-border" size={20} color={colors.icon_stroke} />} />
              <HeaderCircleIcon icon={<MaterialIcons name="grid-view" size={20} color={colors.icon_stroke} />} />
              <HeaderCircleIcon icon={<MaterialIcons name="insights" size={20} color={colors.icon_stroke} />} />
            </View>
          </View>
        </View>

        {/* Overflow menu (visual only) */}
        <View style={styles.overflowMenu}>
          <MaterialIcons name="more-vert" size={22} color={colors.icon_stroke} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Text style={styles.nameRow}>
            Esdan <Text style={styles.emoji}>💎</Text>
          </Text>
          <Text style={styles.handle}>@esdanali</Text>
          <Text style={styles.bio}>testing</Text>

          <View style={styles.tagRow}>
            {demoTags.map((t) => (
              <View style={styles.tagChip} key={t}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={styles.statRow}>
            <StatBlock value={itemCount} label="Items" highlight />
            <StatBlock value={outfitCount} label="Outfits" />
            <StatBlock value={0} label="Lookbooks" />
          </View>
        </View>

        {/* Search + inline actions */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color={colors.text_gray_light} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={colors.text_gray_light}
              value={query}
              onChangeText={setQuery}
            />
          </View>
          <SquareIconButton icon={<MaterialIcons name="tune" size={20} color={colors.icon_stroke} />} />
          <SquareIconButton icon={<MaterialCommunityIcons name="eye-off-outline" size={20} color={colors.icon_stroke} />} />
          <SquareIconButton icon={<MaterialIcons name="sort" size={20} color={colors.icon_stroke} />} />
        </View>

        {/* Grid */}
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTopIcons}>
                <MaterialCommunityIcons name="eye-outline" size={18} color={colors.text_gray_light} />
                <MaterialCommunityIcons name="heart-outline" size={18} color={colors.text_gray_light} />
              </View>
              <Image
                source={{ uri: item.backgroundRemovedImageUri || item.imageUri }}
                style={styles.cardImage}
                resizeMode="contain"
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items yet</Text>
              <Text style={styles.emptySub}>Add clothes to see them here</Text>
            </View>
          }
        />
      </ScrollView>

      {/* Floating Add */}
      <PressableFade style={styles.fab} onPress={() => {}}>
        <MaterialIcons name="add" size={26} color="#fff" />
      </PressableFade>
    </SafeAreaView>
  );
};

const HeaderCircleIcon = ({ icon }: { icon: React.ReactNode }) => (
  <View style={styles.headerCircle}>{icon}</View>
);

const StatBlock = ({ value, label, highlight }: { value: number; label: string; highlight?: boolean }) => (
  <View style={styles.statBlock}>
    <Text style={[styles.statValue, highlight && styles.statHighlight]}>{value}</Text>
    <Text style={[styles.statLabel, highlight && styles.statLabelHighlight]}>{label}</Text>
  </View>
);

const SquareIconButton = ({ icon }: { icon: React.ReactNode }) => (
  <PressableFade style={styles.squareBtn}>{icon}</PressableFade>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen_background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerBg: {
    height: 140,
    backgroundColor: "#D9C2FF", // soft purple to match mock
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 6,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  overflowMenu: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  profileCard: {
    marginTop: -28,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  nameRow: {
    fontFamily: typography.bold,
    fontSize: 20,
    color: colors.text_primary,
  },
  emoji: {
    fontSize: 18,
  },
  handle: {
    marginTop: 2,
    fontFamily: typography.medium,
    fontSize: 14,
    color: colors.text_gray,
  },
  bio: {
    marginTop: 2,
    fontFamily: typography.regular,
    fontSize: 13,
    color: colors.text_gray_light,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.tag_light,
  },
  tagText: {
    fontFamily: typography.medium,
    fontSize: 12,
    color: colors.text_primary,
    letterSpacing: 0.2,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14,
  },
  statBlock: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: typography.bold,
    fontSize: 16,
    color: colors.text_primary,
  },
  statLabel: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: colors.text_gray,
  },
  statHighlight: {
    color: colors.text_primary,
  },
  statLabelHighlight: {
    fontFamily: typography.semiBold,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontFamily: typography.regular,
    color: colors.text_primary,
    paddingVertical: 0,
  },
  squareBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    rowGap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 6,
    height: 190,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
  },
  cardTopIcons: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 1,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: typography.semiBold,
    color: colors.text_primary,
    fontSize: 16,
  },
  emptySub: {
    marginTop: 6,
    fontFamily: typography.regular,
    color: colors.text_gray,
    fontSize: 13,
  },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 26,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#22C7FB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
});

export default WardrobeScreen;

