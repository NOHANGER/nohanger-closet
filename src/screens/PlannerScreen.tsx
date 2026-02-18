import React, { useContext, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../styles/colors";
import { elevation, typography } from "../styles/globalStyles";
import { PlannerContext } from "../contexts/PlannerContext";
import { OutfitContext } from "../contexts/OutfitContext";
import { MainTabParamList } from "../types/navigation";
import { Outfit } from "../types/Outfit";

const SCREEN_WIDTH = Dimensions.get("window").width;
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const WEATHER_ICONS: Array<{ name: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; label: string }> = [
  { name: "weather-sunny", label: "Sun" },
  { name: "weather-partly-cloudy", label: "Cloud" },
  { name: "weather-rainy", label: "Rain" },
  { name: "weather-snowy", label: "Snow" },
  { name: "weather-windy", label: "Wind" },
  { name: "thermometer", label: "Temp" },
  { name: "water-percent", label: "Humid" },
];

/** Returns "YYYY-MM-DD" for a given Date object */
const formatDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Returns the Monday of the week that contains `ref` */
const getMondayOfWeek = (ref: Date): Date => {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const dayIndex = (d.getDay() + 6) % 7; // 0=Mon .. 6=Sun
  d.setDate(d.getDate() - dayIndex);
  return d;
};

const PlannerScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, "Planner">>();
  const plannerCtx = useContext(PlannerContext);
  const outfitCtx = useContext(OutfitContext);

  // Week offset: 0 = current week, -1 = previous, +1 = next
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Modal states
  const [outfitPickerVisible, setOutfitPickerVisible] = useState(false);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");

  // Build week days based on offset
  const weekDays = useMemo(() => {
    const today = new Date();
    const monday = getMondayOfWeek(today);
    monday.setDate(monday.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const selectedDateKey = formatDate(selectedDate);
  const todayKey = formatDate(new Date());

  // Data from context
  const datesWithPlans = useMemo(() => plannerCtx?.getDatesWithPlans() ?? new Set<string>(), [plannerCtx]);
  const plannedOutfitsForDate = useMemo(
    () => plannerCtx?.getPlannedOutfitsForDate(selectedDateKey) ?? [],
    [plannerCtx, selectedDateKey]
  );
  const eventsForDate = useMemo(
    () => plannerCtx?.getEventsForDate(selectedDateKey) ?? [],
    [plannerCtx, selectedDateKey]
  );

  // Week navigation
  const goToPrevWeek = useCallback(() => setWeekOffset((prev) => prev - 1), []);
  const goToNextWeek = useCallback(() => setWeekOffset((prev) => prev + 1), []);

  // Lookup outfit thumbnail by ID
  const getOutfitThumbnail = useCallback(
    (outfitId: string): string | undefined => {
      const outfit = outfitCtx?.getOutfit(outfitId);
      return outfit?.imageUri;
    },
    [outfitCtx]
  );

  // --- Action handlers ---

  const handleAddFromWardrobe = useCallback(() => {
    setOutfitPickerVisible(true);
  }, []);

  const handleCreateNewOutfit = useCallback(() => {
    navigation.getParent()?.navigate("Outfits", {
      screen: "OutfitCanvas",
      params: { id: undefined },
    });
  }, [navigation]);

  const handleDiscoverOutfits = useCallback(() => {
    navigation.getParent()?.navigate("Community", {
      screen: "CommunityHome",
    });
  }, [navigation]);

  const handleAddOutfitPhoto = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Please grant access to your photo library to add outfit photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        plannerCtx?.addPlannedOutfit(selectedDateKey, undefined, result.assets[0].uri, "");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick an image. Please try again.");
    }
  }, [plannerCtx, selectedDateKey]);

  // Select outfit from wardrobe modal
  const handleSelectOutfit = useCallback(
    (outfit: Outfit) => {
      plannerCtx?.addPlannedOutfit(selectedDateKey, outfit.id, undefined, "");
      setOutfitPickerVisible(false);
    },
    [plannerCtx, selectedDateKey]
  );

  // Remove planned outfit
  const handleRemovePlannedOutfit = useCallback(
    (id: string) => {
      Alert.alert("Remove outfit", "Remove this planned outfit?", [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => plannerCtx?.removePlannedOutfit(id) },
      ]);
    },
    [plannerCtx]
  );

  // Add event
  const handleAddEvent = useCallback(() => {
    const title = newEventTitle.trim();
    if (!title) return;
    plannerCtx?.addEvent(selectedDateKey, title);
    setNewEventTitle("");
  }, [plannerCtx, selectedDateKey, newEventTitle]);

  // Remove event
  const handleRemoveEvent = useCallback(
    (id: string) => {
      Alert.alert("Remove event", "Remove this event?", [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => plannerCtx?.removeEvent(id) },
      ]);
    },
    [plannerCtx]
  );

  // Action card data
  const actionCards = useMemo(
    () => [
      {
        key: "wardrobe" as const,
        label: "Add from wardrobe",
        icon: <MaterialCommunityIcons name="wardrobe-outline" size={22} color={colors.text_primary} />,
        onPress: handleAddFromWardrobe,
      },
      {
        key: "create" as const,
        label: "Create new outfit",
        icon: <MaterialCommunityIcons name="tshirt-crew-outline" size={22} color={colors.text_primary} />,
        onPress: handleCreateNewOutfit,
      },
      {
        key: "discover" as const,
        label: "Discover new outfits",
        icon: <MaterialCommunityIcons name="compass-outline" size={22} color={colors.text_primary} />,
        onPress: handleDiscoverOutfits,
      },
      {
        key: "photo" as const,
        label: "Add outfit photo",
        icon: <MaterialCommunityIcons name="camera-outline" size={22} color={colors.text_primary} />,
        onPress: handleAddOutfitPhoto,
      },
    ],
    [handleAddFromWardrobe, handleCreateNewOutfit, handleDiscoverOutfits, handleAddOutfitPhoto]
  );

  const safeAreaEdges: Edge[] = ["top", "left", "right"];

  // Month/year label for the current week
  const weekLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    if (first.getMonth() === last.getMonth()) {
      return `${monthNames[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${monthNames[first.getMonth()].slice(0, 3)} - ${monthNames[last.getMonth()].slice(0, 3)} ${last.getFullYear()}`;
  }, [weekDays]);

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with weather placeholder + icons */}
        <View style={styles.header}>
          <View style={styles.weatherRow}>
            <Text style={styles.temp}>84 / 72°F</Text>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={18} color={colors.text_primary} />
            <View style={{ width: 6 }} />
            <MaterialCommunityIcons name="clock-outline" size={18} color={colors.text_primary} />
            <View style={{ width: 6 }} />
            <MaterialCommunityIcons name="bell-outline" size={18} color={colors.text_primary} />
          </View>
          <View style={styles.headerIcons}>
            <MaterialIcons name="tune" size={20} color={colors.text_primary} />
            <View style={{ width: 12 }} />
            <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.text_primary} />
          </View>
        </View>

        {/* Weather placeholder row */}
        <View style={styles.weatherIconRow}>
          {WEATHER_ICONS.map((item, idx) => (
            <View key={idx} style={styles.weatherIconItem}>
              <MaterialCommunityIcons name={item.name} size={20} color={colors.text_gray} />
              <Text style={styles.weatherIconLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Week navigation + label */}
        <View style={styles.weekNav}>
          <TouchableOpacity onPress={goToPrevWeek} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={22} color={colors.text_primary} />
          </TouchableOpacity>
          <Text style={styles.weekLabel}>{weekLabel}</Text>
          <TouchableOpacity onPress={goToNextWeek} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-forward" size={22} color={colors.text_primary} />
          </TouchableOpacity>
        </View>

        {/* Week strip */}
        <View style={styles.weekStrip}>
          {weekDays.map((d, idx) => {
            const dateKey = formatDate(d);
            const isSelected = dateKey === selectedDateKey;
            const isToday = dateKey === todayKey;
            const hasPlan = datesWithPlans.has(dateKey);
            return (
              <TouchableOpacity key={dateKey} onPress={() => setSelectedDate(d)} activeOpacity={0.85}>
                <View style={[styles.dayWrap, isSelected && styles.dayWrapSelected]}>
                  <Text style={[styles.dayName, isToday && styles.dayNameToday]}>{daysOfWeek[idx]}</Text>
                  <View
                    style={[
                      styles.dayNumberWrap,
                      isSelected && styles.dayNumberWrapSelected,
                      isToday && !isSelected && styles.dayNumberWrapToday,
                    ]}
                  >
                    <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                      {d.getDate()}
                    </Text>
                  </View>
                  {/* Dot indicator for days with plans */}
                  <View style={styles.dotContainer}>
                    {hasPlan && <View style={styles.dot} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Prompt */}
        <View style={styles.prompt}>
          <Text style={styles.promptTitle}>Track today's outfit.</Text>
          <Text style={styles.promptTitle}>Plan tomorrow's.</Text>
        </View>

        {/* Action cards grid */}
        <View style={styles.actionsGrid}>
          {actionCards.map((item) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.9}
              style={styles.actionCard}
              onPress={item.onPress}
            >
              <View style={styles.actionIcon}>{item.icon}</View>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Events CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.eventsCta}
          onPress={() => setEventsModalVisible(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.text_primary} style={{ marginRight: 8 }} />
          <Text style={styles.eventsText}>Add or view events</Text>
          {eventsForDate.length > 0 && (
            <View style={styles.eventsBadge}>
              <Text style={styles.eventsBadgeText}>{eventsForDate.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Planned outfits for selected date */}
        {plannedOutfitsForDate.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Planned outfits for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Text>
            {plannedOutfitsForDate.map((item) => {
              const thumbnailUri = item.outfitId
                ? getOutfitThumbnail(item.outfitId)
                : item.photoUri;
              return (
                <View key={item.id} style={styles.plannedOutfitRow}>
                  <View style={styles.plannedOutfitThumbnail}>
                    {thumbnailUri ? (
                      <Image source={{ uri: thumbnailUri }} style={styles.thumbnailImage} />
                    ) : (
                      <MaterialCommunityIcons
                        name="tshirt-crew-outline"
                        size={28}
                        color={colors.text_gray_light}
                      />
                    )}
                  </View>
                  <View style={styles.plannedOutfitInfo}>
                    <Text style={styles.plannedOutfitLabel} numberOfLines={1}>
                      {item.outfitId ? "Saved outfit" : "Photo outfit"}
                    </Text>
                    {item.note ? (
                      <Text style={styles.plannedOutfitNote} numberOfLines={2}>
                        {item.note}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemovePlannedOutfit(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.deleteButton}
                  >
                    <MaterialCommunityIcons name="close-circle-outline" size={22} color={colors.primary_red} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Events for selected date */}
        {eventsForDate.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Events for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Text>
            {eventsForDate.map((event) => (
              <View key={event.id} style={styles.eventRow}>
                <Ionicons name="calendar" size={18} color={colors.primary_yellow} style={{ marginRight: 10 }} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                  {event.description ? (
                    <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveEvent(event.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.deleteButton}
                >
                  <MaterialCommunityIcons name="close-circle-outline" size={22} color={colors.primary_red} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ===================== Outfit Picker Modal ===================== */}
      <Modal visible={outfitPickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select an outfit</Text>
              <TouchableOpacity onPress={() => setOutfitPickerVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text_primary} />
              </TouchableOpacity>
            </View>

            {outfitCtx && outfitCtx.outfits.length > 0 ? (
              <FlatList
                data={outfitCtx.outfits}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.outfitGrid}
                columnWrapperStyle={styles.outfitGridRow}
                renderItem={({ item }: { item: Outfit }) => (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.outfitGridItem}
                    onPress={() => handleSelectOutfit(item)}
                  >
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.outfitGridImage} />
                    ) : (
                      <View style={styles.outfitGridPlaceholder}>
                        <MaterialCommunityIcons
                          name="tshirt-crew-outline"
                          size={32}
                          color={colors.text_gray_light}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="wardrobe-outline" size={48} color={colors.text_gray_light} />
                <Text style={styles.emptyStateText}>No outfits saved yet.</Text>
                <Text style={styles.emptyStateSubtext}>Create an outfit first to add it to your plan.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ===================== Events Modal ===================== */}
      <Modal visible={eventsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Events for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Text>
              <TouchableOpacity onPress={() => setEventsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text_primary} />
              </TouchableOpacity>
            </View>

            {/* Add event form */}
            <View style={styles.addEventForm}>
              <TextInput
                style={styles.eventInput}
                placeholder="Event title..."
                placeholderTextColor={colors.text_gray_light}
                value={newEventTitle}
                onChangeText={setNewEventTitle}
                onSubmitEditing={handleAddEvent}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addEventButton, !newEventTitle.trim() && styles.addEventButtonDisabled]}
                onPress={handleAddEvent}
                disabled={!newEventTitle.trim()}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={22} color={newEventTitle.trim() ? colors.tag_light : colors.text_gray_light} />
              </TouchableOpacity>
            </View>

            {/* Event list */}
            {eventsForDate.length > 0 ? (
              <FlatList
                data={eventsForDate}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 16 }}
                renderItem={({ item }) => (
                  <View style={styles.eventModalRow}>
                    <Ionicons name="calendar" size={18} color={colors.primary_yellow} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>{item.title}</Text>
                      {item.description ? (
                        <Text style={styles.eventDescription}>{item.description}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveEvent(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.primary_red} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.text_gray_light} />
                <Text style={styles.emptyStateText}>No events for this day.</Text>
                <Text style={styles.emptyStateSubtext}>Add an event above to get started.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const GRID_GAP = 12;
const ACTION_CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - GRID_GAP) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weatherRow: { flexDirection: "row", alignItems: "center" },
  temp: { fontFamily: typography.semiBold, fontSize: 16, color: colors.text_primary, marginRight: 8 },
  headerIcons: { flexDirection: "row", alignItems: "center" },

  // Weather icon row
  weatherIconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_gray_light,
  },
  weatherIconItem: { alignItems: "center" },
  weatherIconLabel: {
    fontFamily: typography.regular,
    fontSize: 10,
    color: colors.text_gray_light,
    marginTop: 2,
  },

  // Week navigation
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
  },
  weekLabel: { fontFamily: typography.semiBold, fontSize: 14, color: colors.text_primary },

  // Week strip
  weekStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dayWrap: { alignItems: "center", paddingVertical: 6, paddingHorizontal: 6, borderRadius: 12 },
  dayWrapSelected: { backgroundColor: colors.thumbnail_background },
  dayName: { fontFamily: typography.medium, fontSize: 12, color: colors.text_gray },
  dayNameToday: { color: colors.primary_yellow },
  dayNumberWrap: {
    marginTop: 6,
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.tag_light,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
  },
  dayNumberWrapSelected: {
    backgroundColor: colors.accent_lime,
    borderColor: colors.accent_lime,
  },
  dayNumberWrapToday: {
    borderColor: colors.primary_yellow,
    borderWidth: 2,
  },
  dayNumber: { fontFamily: typography.semiBold, color: colors.text_primary, fontSize: 13 },
  dayNumberSelected: { color: colors.text_primary },

  // Dot indicator
  dotContainer: { height: 8, marginTop: 3, alignItems: "center", justifyContent: "center" },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary_yellow,
  },

  // Prompt
  prompt: { alignItems: "center", marginTop: 8 },
  promptTitle: { fontFamily: typography.bold, fontSize: 18, color: colors.text_primary },

  // Action cards
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: GRID_GAP,
  },
  actionCard: {
    width: ACTION_CARD_WIDTH,
    height: 110,
    backgroundColor: colors.tag_light,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    alignItems: "center",
    justifyContent: "center",
    ...elevation.card,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.light_yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: typography.medium,
    fontSize: 12,
    color: colors.text_primary,
  },

  // Events CTA
  eventsCta: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light_yellow,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    flexDirection: "row",
  },
  eventsText: { fontFamily: typography.semiBold, color: colors.text_primary },
  eventsBadge: {
    marginLeft: 8,
    backgroundColor: colors.primary_yellow,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  eventsBadgeText: { fontFamily: typography.semiBold, fontSize: 11, color: colors.text_primary },

  // Planned outfits section
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: typography.semiBold,
    fontSize: 15,
    color: colors.text_primary,
    marginBottom: 10,
  },
  plannedOutfitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.tag_light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    padding: 10,
    marginBottom: 8,
  },
  plannedOutfitThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.thumbnail_background,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbnailImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  plannedOutfitInfo: {
    flex: 1,
    marginLeft: 12,
  },
  plannedOutfitLabel: {
    fontFamily: typography.semiBold,
    fontSize: 14,
    color: colors.text_primary,
  },
  plannedOutfitNote: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: colors.text_gray,
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },

  // Event rows
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.tag_light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    padding: 12,
    marginBottom: 8,
  },
  eventInfo: { flex: 1 },
  eventTitle: {
    fontFamily: typography.semiBold,
    fontSize: 14,
    color: colors.text_primary,
  },
  eventDescription: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: colors.text_gray,
    marginTop: 2,
  },

  // Modal shared
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background_dim,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.screen_background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_gray_light,
  },
  modalTitle: {
    fontFamily: typography.bold,
    fontSize: 18,
    color: colors.text_primary,
  },

  // Outfit picker grid
  outfitGrid: { padding: 16 },
  outfitGridRow: { gap: 10 },
  outfitGridItem: {
    width: (SCREEN_WIDTH - 32 - 20) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.thumbnail_background,
    marginBottom: 10,
    overflow: "hidden",
  },
  outfitGridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  outfitGridPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontFamily: typography.semiBold,
    fontSize: 16,
    color: colors.text_primary,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontFamily: typography.regular,
    fontSize: 13,
    color: colors.text_gray,
    marginTop: 4,
    textAlign: "center",
  },

  // Event modal
  addEventForm: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  eventInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.tag_light,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    paddingHorizontal: 14,
    fontFamily: typography.regular,
    fontSize: 14,
    color: colors.text_primary,
  },
  addEventButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primary_yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  addEventButtonDisabled: {
    backgroundColor: colors.border_gray_light,
  },
  eventModalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_gray_light,
  },
});

export default PlannerScreen;
