import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const PlannerScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const week = useMemo(() => {
    // build current week starting Monday
    const today = new Date();
    const day = (today.getDay() + 6) % 7; // 0..6 with Monday=0
    const monday = new Date(today);
    monday.setDate(today.getDate() - day);
    monday.setHours(0, 0, 0, 0);
    return new Array(7).fill(0).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, []);

  const safeAreaEdges: Edge[] = ["top", "left", "right"]; // bottom handled by TabBar

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      {/* Header with weather + quick icons */}
      <View style={styles.header}>
        <View style={styles.weatherRow}>
          <Text style={styles.temp}>84 · 2°F</Text>
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

      {/* Week strip */}
      <View style={styles.weekStrip}>
        {week.map((d, idx) => {
          const isSelected =
            d.getDate() === selectedDate.getDate() &&
            d.getMonth() === selectedDate.getMonth() &&
            d.getFullYear() === selectedDate.getFullYear();
          return (
            <TouchableOpacity key={idx} onPress={() => setSelectedDate(d)} activeOpacity={0.85}>
              <View style={[styles.dayWrap, isSelected && styles.dayWrapSelected]}>
                <Text style={styles.dayName}>{daysOfWeek[idx]}</Text>
                <View style={styles.dayNumberWrap}>
                  <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>{d.getDate()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Prompt */}
      <View style={styles.prompt}>
        <Text style={styles.promptTitle}>Track today’s outfit.</Text>
        <Text style={styles.promptTitle}>Plan tomorrow’s.</Text>
      </View>

      {/* Actions grid */}
      <FlatList
        data={[
          { key: "wardrobe", label: "Add from wardrobe", icon: <MaterialCommunityIcons name="wardrobe-outline" size={22} color={colors.text_primary} /> },
          { key: "create", label: "Create new outfit", icon: <MaterialCommunityIcons name="tshirt-crew-outline" size={22} color={colors.text_primary} /> },
          { key: "discover", label: "Discover new outfits", icon: <MaterialCommunityIcons name="compass-outline" size={22} color={colors.text_primary} /> },
          { key: "photo", label: "Add outfit photo", icon: <MaterialCommunityIcons name="camera-outline" size={22} color={colors.text_primary} /> },
        ]}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} style={styles.actionCard}>
            <View style={styles.actionIcon}>{item.icon}</View>
            <Text style={styles.actionLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(it) => it.key}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.actions}
        scrollEnabled={false}
      />

      <TouchableOpacity activeOpacity={0.9} style={styles.eventsCta}>
        <Text style={styles.eventsText}>Add or view events</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const CARD_BG = {
  wardrobe: "#E5F6FF",
  create: "#EFE7FF",
  discover: "#FFF0E1",
  photo: "#EAF8E9",
} as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
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

  weekStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dayWrap: { alignItems: "center", paddingVertical: 6, paddingHorizontal: 6, borderRadius: 12 },
  dayWrapSelected: { backgroundColor: "#F2F0E8" },
  dayName: { fontFamily: typography.medium, fontSize: 12, color: colors.text_gray },
  dayNumberWrap: { marginTop: 6, width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border_gray_light },
  dayNumber: { fontFamily: typography.semiBold, color: colors.text_primary },
  dayNumberSelected: { backgroundColor: colors.accent_lime, overflow: "hidden", paddingHorizontal: 8, borderRadius: 8 },

  prompt: { alignItems: "center", marginTop: 8 },
  promptTitle: { fontFamily: typography.bold, fontSize: 18, color: colors.text_primary },

  actions: { paddingHorizontal: 16, marginTop: 12, paddingBottom: 12, rowGap: 12 },
  actionCard: {
    flex: 1,
    height: 110,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.light_yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { marginTop: 8, textAlign: "center", fontFamily: typography.medium, fontSize: 12, color: colors.text_primary },

  eventsCta: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAE4FF",
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    marginBottom: 20,
  },
  eventsText: { fontFamily: typography.semiBold, color: colors.text_primary },
});

export default PlannerScreen;
