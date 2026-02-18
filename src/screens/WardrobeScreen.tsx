import React, { useContext, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { MainTabScreenProps } from "../types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { colors } from "../styles/colors";
import { elevation, typography } from "../styles/globalStyles";
import PressableFade from "../components/common/PressableFade";
import { ClothingContext } from "../contexts/ClothingContext";
import { AuthContext } from "../contexts/AuthContext";
import { OutfitContext } from "../contexts/OutfitContext";
import { ClothingItem } from "../types/ClothingItem";

type Props = MainTabScreenProps<"Profile">;

type SortOrder = "newest" | "oldest" | "alphabetical";

const SORT_LABELS: Record<SortOrder, string> = {
  newest: "Newest",
  oldest: "Oldest",
  alphabetical: "A-Z",
};

const SORT_CYCLE: SortOrder[] = ["newest", "oldest", "alphabetical"];

const WardrobeScreen = ({ navigation }: Props) => {
  const clothing = useContext(ClothingContext);
  const outfits = useContext(OutfitContext);
  const auth = useContext(AuthContext);

  const [query, setQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showHiddenItems, setShowHiddenItems] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const items = clothing?.clothingItems || [];
  const favoriteItems = clothing?.favoriteItems || [];

  // Build the display list: filter by search, favorites, hidden, then sort
  const displayItems = useMemo(() => {
    let result = items;

    // Filter: favorites only
    if (showFavoritesOnly) {
      result = result.filter((it) => it.isFavorite);
    }

    // Filter: hidden items visibility
    if (!showHiddenItems) {
      result = result.filter((it) => !it.isHidden);
    }

    // Filter: search query
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (it) =>
          it.tags.some((t) => t.toLowerCase().includes(q)) ||
          it.category.toLowerCase().includes(q) ||
          it.subcategory.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortOrder) {
      case "newest":
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        result = [...result].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "alphabetical":
        result = [...result].sort((a, b) => {
          const nameA = a.subcategory || a.category || "";
          const nameB = b.subcategory || b.category || "";
          return nameA.localeCompare(nameB);
        });
        break;
    }

    return result;
  }, [items, query, showFavoritesOnly, showHiddenItems, sortOrder]);

  const itemCount = items.length;
  const outfitCount = outfits?.outfits?.length || 0;
  const favoritesCount = favoriteItems.length;

  // Profile data from AuthContext
  const displayName = auth?.profile?.displayName || "User";
  const handle = auth?.profile?.handle || "@user";
  const bio = auth?.profile?.bio || "";

  // ---- Handlers ----

  const handleFabPress = useCallback(() => {
    Alert.alert("Add Clothing", "Choose a photo source", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Camera",
        onPress: async () => {
          const permission =
            await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(
              "Permission needed",
              "Camera access is required to take photos."
            );
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]?.uri) {
            clothing?.addClothingItemFromImage(result.assets[0].uri);
          }
        },
      },
      {
        text: "Library",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(
              "Permission needed",
              "Photo library access is required to choose photos."
            );
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]?.uri) {
            clothing?.addClothingItemFromImage(result.assets[0].uri);
          }
        },
      },
    ]);
  }, [clothing]);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      clothing?.toggleFavorite(id);
    },
    [clothing]
  );

  const handleToggleHidden = useCallback(
    (id: string) => {
      clothing?.toggleHidden(id);
    },
    [clothing]
  );

  const handleToggleFavoritesFilter = useCallback(() => {
    setShowFavoritesOnly((prev) => !prev);
  }, []);

  const handleToggleShowHidden = useCallback(() => {
    setShowHiddenItems((prev) => !prev);
  }, []);

  const handleCycleSortOrder = useCallback(() => {
    setSortOrder((prev) => {
      const currentIndex = SORT_CYCLE.indexOf(prev);
      const nextIndex = (currentIndex + 1) % SORT_CYCLE.length;
      return SORT_CYCLE[nextIndex];
    });
  }, []);

  const handleOpenDetail = useCallback(
    (id: string) => {
      navigation
        .getParent<NativeStackNavigationProp<RootStackParamList>>()
        ?.navigate("ClothingDetailModal", { id });
    },
    [navigation]
  );

  const safeAreaEdges: Edge[] = ["top", "left", "right"];

  const renderItem = useCallback(
    ({ item }: { item: ClothingItem }) => {
      const isFav = item.isFavorite;
      const isHid = item.isHidden;

      return (
        <PressableFade
          containerStyle={styles.card}
          style={{ flex: 1 }}
          onPress={() => handleOpenDetail(item.id)}
        >
          <View style={styles.cardTopIcons}>
            <PressableFade
              onPress={() => handleToggleHidden(item.id)}
              style={styles.cardIconHit}
            >
              <MaterialCommunityIcons
                name={isHid ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={isHid ? colors.primary_red : colors.text_gray_light}
              />
            </PressableFade>
            <PressableFade
              onPress={() => handleToggleFavorite(item.id)}
              style={styles.cardIconHit}
            >
              <MaterialCommunityIcons
                name={isFav ? "heart" : "heart-outline"}
                size={18}
                color={isFav ? colors.primary_red : colors.text_gray_light}
              />
            </PressableFade>
          </View>
          <Image
            source={{
              uri: item.backgroundRemovedImageUri || item.imageUri,
            }}
            style={[styles.cardImage, isHid && styles.cardImageHidden]}
            resizeMode="contain"
          />
        </PressableFade>
      );
    },
    [handleOpenDetail, handleToggleFavorite, handleToggleHidden]
  );

  const keyExtractor = useCallback((item: ClothingItem) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header background */}
        <View style={styles.headerBg}>
          <View style={styles.headerRow}>
            {auth?.profile?.avatarUri ? (
              <Image
                key={auth.profile.avatarUri}
                source={{ uri: auth.profile.avatarUri }}
                style={styles.avatar}
              />
            ) : (
              <Image
                source={require("../../assets/icon.png")}
                style={styles.avatar}
              />
            )}
            <View style={styles.headerActions}>
              <PressableFade
                style={styles.headerCircle}
                onPress={handleToggleFavoritesFilter}
              >
                <MaterialIcons
                  name={showFavoritesOnly ? "bookmark" : "bookmark-border"}
                  size={20}
                  color={
                    showFavoritesOnly
                      ? colors.primary_yellow
                      : colors.icon_stroke
                  }
                />
              </PressableFade>
              <HeaderCircleIcon
                icon={
                  <MaterialIcons
                    name="grid-view"
                    size={20}
                    color={colors.icon_stroke}
                  />
                }
              />
              <HeaderCircleIcon
                icon={
                  <MaterialIcons
                    name="insights"
                    size={20}
                    color={colors.icon_stroke}
                  />
                }
              />
            </View>
          </View>
        </View>

        {/* Overflow menu */}
        <PressableFade
          style={styles.overflowMenu}
          onPress={() =>
            Alert.alert("Account", "What would you like to do?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Log out",
                style: "destructive",
                onPress: () => auth?.logout?.(),
              },
            ])
          }
        >
          <MaterialIcons
            name="more-vert"
            size={22}
            color={colors.icon_stroke}
          />
        </PressableFade>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Text style={styles.nameRow}>{displayName}</Text>
          <Text style={styles.handle}>{handle}</Text>
          {bio ? <Text style={styles.bio}>{bio}</Text> : null}

          <View style={styles.statRow}>
            <StatBlock value={itemCount} label="Items" highlight />
            <StatBlock value={outfitCount} label="Outfits" />
            <StatBlock value={favoritesCount} label="Favorites" />
          </View>
        </View>

        {/* Search + inline actions */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialIcons
              name="search"
              size={20}
              color={colors.text_gray_light}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={colors.text_gray_light}
              value={query}
              onChangeText={setQuery}
            />
          </View>
          <SquareIconButton
            icon={
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={20}
                color={
                  showHiddenItems ? colors.primary_yellow : colors.icon_stroke
                }
              />
            }
            onPress={handleToggleShowHidden}
            active={showHiddenItems}
          />
          <SquareIconButton
            icon={
              <MaterialIcons
                name="sort"
                size={20}
                color={colors.icon_stroke}
              />
            }
            onPress={handleCycleSortOrder}
            label={SORT_LABELS[sortOrder]}
          />
        </View>

        {/* Active filter indicators */}
        {(showFavoritesOnly || showHiddenItems || sortOrder !== "newest") && (
          <View style={styles.activeFiltersRow}>
            {showFavoritesOnly && (
              <View style={styles.filterChip}>
                <MaterialIcons
                  name="bookmark"
                  size={14}
                  color={colors.text_primary}
                />
                <Text style={styles.filterChipText}>Favorites only</Text>
              </View>
            )}
            {showHiddenItems && (
              <View style={styles.filterChip}>
                <MaterialCommunityIcons
                  name="eye-off-outline"
                  size={14}
                  color={colors.text_primary}
                />
                <Text style={styles.filterChipText}>Showing hidden</Text>
              </View>
            )}
            {sortOrder !== "newest" && (
              <View style={styles.filterChip}>
                <MaterialIcons
                  name="sort"
                  size={14}
                  color={colors.text_primary}
                />
                <Text style={styles.filterChipText}>
                  {SORT_LABELS[sortOrder]}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Account actions */}
        <PressableFade
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert(
              "Log out",
              "Are you sure you want to log out?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Log out",
                  style: "destructive",
                  onPress: () => auth?.logout?.(),
                },
              ]
            )
          }
        >
          <Text style={styles.logoutText}>Log out</Text>
        </PressableFade>

        {/* Grid */}
        <FlatList
          data={displayItems}
          keyExtractor={keyExtractor}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {showFavoritesOnly
                  ? "No favorite items"
                  : "No items yet"}
              </Text>
              <Text style={styles.emptySub}>
                {showFavoritesOnly
                  ? "Tap the heart icon on items to add favorites"
                  : "Add clothes to see them here"}
              </Text>
            </View>
          }
        />
      </ScrollView>

      {/* Floating Add */}
      <PressableFade style={styles.fab} onPress={handleFabPress}>
        <MaterialIcons name="add" size={26} color={colors.text_primary} />
      </PressableFade>
    </SafeAreaView>
  );
};

const HeaderCircleIcon = ({ icon }: { icon: React.ReactNode }) => (
  <View style={styles.headerCircle}>{icon}</View>
);

const StatBlock = ({
  value,
  label,
  highlight,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) => (
  <View style={styles.statBlock}>
    <Text style={[styles.statValue, highlight && styles.statHighlight]}>
      {value}
    </Text>
    <Text style={[styles.statLabel, highlight && styles.statLabelHighlight]}>
      {label}
    </Text>
  </View>
);

const SquareIconButton = ({
  icon,
  onPress,
  active,
  label,
}: {
  icon: React.ReactNode;
  onPress?: () => void;
  active?: boolean;
  label?: string;
}) => (
  <PressableFade
    style={[
      styles.squareBtn,
      active && styles.squareBtnActive,
    ]}
    onPress={onPress}
  >
    {icon}
    {label ? <Text style={styles.squareBtnLabel}>{label}</Text> : null}
  </PressableFade>
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
    backgroundColor: "#E4D9C6",
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
    borderColor: colors.tag_light,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.tag_light,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#1F2A37",
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
    backgroundColor: colors.tag_light,
    borderRadius: 16,
    padding: 16,
    ...elevation.card,
  },
  nameRow: {
    fontFamily: typography.bold,
    fontSize: 20,
    color: colors.text_primary,
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
    backgroundColor: colors.tag_light,
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
    minWidth: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.tag_light,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    paddingHorizontal: 6,
  },
  squareBtnActive: {
    borderColor: colors.primary_yellow,
    backgroundColor: colors.light_yellow,
  },
  squareBtnLabel: {
    fontFamily: typography.medium,
    fontSize: 8,
    color: colors.text_gray,
    marginTop: 1,
  },
  activeFiltersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.light_yellow,
  },
  filterChipText: {
    fontFamily: typography.medium,
    fontSize: 11,
    color: colors.text_primary,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    rowGap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: colors.tag_light,
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
  cardIconHit: {
    padding: 4,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImageHidden: {
    opacity: 0.35,
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
  logoutBtn: {
    alignSelf: "flex-start",
    marginTop: 14,
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    backgroundColor: colors.tag_light,
  },
  logoutText: {
    color: colors.primary_red,
    fontFamily: typography.medium,
  },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 26,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary_yellow,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border_gray,
    ...elevation.floating,
  },
});

export default WardrobeScreen;
