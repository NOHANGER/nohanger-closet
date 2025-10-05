import React, { useMemo, useState, useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../styles/colors";
import { typography } from "../styles/globalStyles";
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";
import { CommunityStackParamList } from "../types/navigation";
import SideDrawer from "../components/community/SideDrawer";
import { Share, Alert } from "react-native";

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
    image: require("../../assets/community/all_outfits.png"),
    suggested: true,
  },
  {
    id: "2",
    title: "Minimal street style",
    image: require("../../assets/community/outfit_canvas.png"),
  },
];

const FILTERS = ["For You", "Outfit Selfies", "Style Submissions: All"] as const;

const QuickAction: React.FC<{ icon: React.ReactNode; label: string; onPress?: () => void }> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.85} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
    <View style={styles.quickIcon}>{icon}</View>
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

const CommunityScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>(FILTERS[0]);
  const [reactions, setReactions] = useState<Record<string, number>>({});

  const feed = useMemo(() => DUMMY_FEED, []);
  const auth = useContext(AuthContext);
  const avatarUri = auth?.profile?.avatarUri;
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Dedicated screens now handle plan/upload flows

  const navigation = useNavigation<any>();

  const react = (id: string) => {
    setReactions((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  // Upload quick action now navigates to separate screen

  const handleUpload = () => {
    // Navigate to dedicated Upload screen
    // @ts-ignore narrowed by navigator params at runtime
    navigation.navigate('Community', { screen: 'CommunityUpload' });
  };

  const safeAreaEdges: Edge[] = ["top", "left", "right"]; // Bottom handled by TabBar

  const ListHeader = () => (
    <>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.profileWrap} onPress={() => setDrawerOpen(true)} activeOpacity={0.8}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {avatarUri ? (
                <Image key={avatarUri} source={{ uri: avatarUri }} style={styles.avatarImg} resizeMode="cover" />
              ) : null}
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>30%</Text>
            </View>
          </View>
          <Text style={styles.greeting}>Hey!</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => auth?.logout?.()} activeOpacity={0.7}>
            <MaterialCommunityIcons name="logout-variant" size={22} color={colors.text_primary} />
          </TouchableOpacity>
          <View style={{ width: 16 }} />
          <MaterialIcons name="search" size={22} color={colors.text_primary} />
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.quickRow}>
        <QuickAction
          icon={<MaterialCommunityIcons name="cloud-upload-outline" size={20} color={colors.text_primary} />}
          label="Upload"
          onPress={handleUpload}
        />
        <QuickAction
          icon={<MaterialIcons name="add-circle-outline" size={20} color={colors.text_primary} />}
          label="Create"
          onPress={() => navigation.navigate('Community', { screen: 'CommunityCreate' })}
        />
        <QuickAction
          icon={<Ionicons name="calendar-outline" size={20} color={colors.text_primary} />}
          label="Plan"
          onPress={() => navigation.navigate('Community', { screen: 'CommunityPlan' })}
        />
        <QuickAction
          icon={<MaterialIcons name="rate-review" size={20} color={colors.text_primary} />}
          label="Review"
          onPress={() => navigation.navigate('Community', { screen: 'CommunityReview' })}
        />
        <QuickAction
          icon={<Ionicons name="book-outline" size={20} color={colors.text_primary} />}
          label="Read"
          onPress={() => navigation.navigate('Community', { screen: 'CommunityRead' })}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const selected = f === activeFilter;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, selected && styles.filterPillSelected]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  const renderCard = ({ item }: { item: FeedItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.suggested && <View style={styles.suggestedDot} />}
      </View>
      <View style={styles.cardImageWrap}>
        <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
      </View>
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.reactBtn} onPress={() => react(item.id)} activeOpacity={0.85}>
          <MaterialCommunityIcons name="hand-clap" size={18} color={colors.text_primary} />
          <Text style={styles.reactText}>Tap to react</Text>
        </TouchableOpacity>
        <Text style={styles.reactCount}>{reactions[item.id] || 0}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <FlatList
        data={feed}
        keyExtractor={(it) => it.id}
        renderItem={renderCard}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      {/* Dedicated screens now handle Upload and Plan */}
      <SideDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        profile={{ name: auth?.profile?.displayName || 'Esdan', handle: auth?.profile?.handle || '@esdanali', avatarUri }}
        following={3}
        followers={0}
        onOpenConnections={(tab) => navigation.navigate('Community', { screen: 'CommunityConnections', params: { tab } })}
        onOpenSettings={() => navigation.navigate('Community', { screen: 'CommunitySettings' })}
        onInvite={() => Alert.alert('Invite friends', 'Share an invite link with your friends!')}
        onRate={() => Alert.alert('Thanks!', 'Rating flow coming soon.')}
        onHelp={() => Alert.alert('Help', 'Help center coming soon.')}
        onShare={async () => { try { await Share.share({ message: 'Check out my profile on Nohanger Closet!' }); } catch {} }}
        onLogout={() => auth?.logout?.()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  profileWrap: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { position: "relative", marginRight: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.thumbnail_background, overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%" },
  progressBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    backgroundColor: colors.light_yellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border_gray_light,
  },
  progressText: { fontFamily: typography.medium, fontSize: 10, color: colors.text_primary },
  greeting: { fontFamily: typography.bold, fontSize: 18, color: colors.text_primary },
  headerIcons: { flexDirection: "row", alignItems: "center" },

  quickRow: { paddingVertical: 12, flexDirection: "row", justifyContent: "space-between" },
  quickAction: {
    width: 72,
    height: 86,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border_gray_light,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.light_yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { marginTop: 8, fontFamily: typography.medium, fontSize: 12, color: colors.text_primary },

  filterRow: { paddingBottom: 8 },
  filterPill: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardTitle: { fontFamily: typography.semiBold, fontSize: 14, color: colors.text_primary },
  suggestedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary_yellow },
  cardImageWrap: { width: "100%", aspectRatio: 3 / 4, backgroundColor: colors.thumbnail_background },
  cardImage: { width: "100%", height: "100%" },
  cardFooter: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border_gray_light,
  },
  reactBtn: { flexDirection: "row", alignItems: "center" },
  reactText: { marginLeft: 8, fontFamily: typography.medium, color: colors.text_primary },
  reactCount: { fontFamily: typography.medium, color: colors.text_gray },

  // Removed bottom sheet styles after refactor
});

export default CommunityScreen;
