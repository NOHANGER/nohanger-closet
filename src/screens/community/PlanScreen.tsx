import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/globalStyles";
import Header from "../../components/common/Header";
import { CommunityStackScreenProps, MainTabParamList } from "../../types/navigation";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

type Props = CommunityStackScreenProps<"CommunityPlan">;

const PlanScreen: React.FC<Props> = ({ navigation }) => {
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const safeAreaEdges: Edge[] = ["top", "left", "right"]; 
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<MainTabParamList, "Community">>();

  const navigateToOutfitCanvas = () => {
    tabNavigation?.navigate("Outfits", { screen: "OutfitCanvas", params: { id: undefined } });
  };

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <Header onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Plan</Text>
        <View style={styles.planHeader}>
          <TouchableOpacity onPress={() => setMonthAnchor((d: Date) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
            <MaterialIcons name="chevron-left" size={22} color={colors.text_primary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {monthAnchor.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </Text>
          <TouchableOpacity onPress={() => setMonthAnchor((d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
            <MaterialIcons name="chevron-right" size={22} color={colors.text_primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
            <Text key={w} style={styles.weekCell}>{w}</Text>
          ))}
        </View>

        {(() => {
          const firstDay = new Date(monthAnchor);
          const startOffset = firstDay.getDay();
          const startDate = new Date(firstDay);
          startDate.setDate(firstDay.getDate() - startOffset);
          const rows: React.ReactElement[] = [];
          let cursor = new Date(startDate);
          for (let r = 0; r < 6; r++) {
            const cells: React.ReactElement[] = [];
            for (let c = 0; c < 7; c++) {
              const isCurrentMonth = cursor.getMonth() === monthAnchor.getMonth();
              const isSelected = !!selectedDate &&
                cursor.getFullYear() === selectedDate.getFullYear() &&
                cursor.getMonth() === selectedDate.getMonth() &&
                cursor.getDate() === selectedDate.getDate();
              const display = cursor.getDate();
              const thisDate = new Date(cursor);
              cells.push(
                <TouchableOpacity
                  key={c}
                  style={[styles.dayCell, !isCurrentMonth && styles.dayCellFaded, isSelected && styles.dayCellSelected]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDate(thisDate)}
                >
                  <Text style={[styles.dayText, !isCurrentMonth && styles.dayTextFaded, isSelected && styles.dayTextSelected]}>{display}</Text>
                </TouchableOpacity>
              );
              cursor.setDate(cursor.getDate() + 1);
            }
            rows.push(
              <View key={r} style={styles.gridRow}>
                {cells}
              </View>
            );
          }
          return <>{rows}</>;
        })()}

        <TouchableOpacity
          style={[styles.createBtn, !selectedDate && { opacity: 0.5 }]}
          disabled={!selectedDate}
          onPress={navigateToOutfitCanvas}
          activeOpacity={0.85}
        >
          <Text style={styles.createBtnText}>Create Outfit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  content: { padding: 16 },
  title: { fontFamily: typography.bold, fontSize: 20, color: colors.text_primary, marginBottom: 8 },
  monthText: { fontFamily: typography.semiBold, color: colors.text_primary },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 4 },
  weekCell: { width: `${100/7}%`, textAlign: 'center', fontFamily: typography.medium, color: colors.text_gray, fontSize: 12 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  dayCell: { width: `${100/7}%`, aspectRatio: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.thumbnail_background },
  dayCellFaded: { backgroundColor: '#EFEDE6' },
  dayCellSelected: { backgroundColor: colors.primary_yellow },
  dayText: { fontFamily: typography.medium, color: colors.text_primary },
  dayTextFaded: { color: colors.text_gray },
  dayTextSelected: { color: colors.text_primary },
  createBtn: { marginTop: 10, height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border_gray_light, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  createBtnText: { fontFamily: typography.medium, color: colors.text_primary },
});

export default PlanScreen;
