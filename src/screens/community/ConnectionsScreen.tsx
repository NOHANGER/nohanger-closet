import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/globalStyles';
import Header from '../../components/common/Header';
import { CommunityStackScreenProps } from '../../types/navigation';

type Props = CommunityStackScreenProps<'CommunityConnections'>;

type Person = { id: string; name: string; handle: string; avatar?: any; };

const SUGGESTED: Person[] = [
  { id: '1', name: 'Maya', handle: 'maya_maddox' },
  { id: '2', name: 'Chloe', handle: 'achloething' },
  { id: '3', name: 'Taylor', handle: 'buscemilover' },
];

const ConnectionsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [active, setActive] = useState<'suggested' | 'following' | 'followers'>(route.params?.tab || 'following');
  const [query, setQuery] = useState('');
  const [following, setFollowing] = useState(new Set<string>(['2']));

  const list = useMemo(() => {
    const base = SUGGESTED; // simple demo for all tabs
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(p => p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q));
  }, [query, active]);

  const toggleFollow = (id: string) => {
    setFollowing(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const safeAreaEdges: Edge[] = ['top', 'left', 'right'];
  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <Header onBack={() => navigation.goBack()} />
      <View style={styles.headerRow}>
        <Text style={styles.title}>My community</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* icons placeholders for share/search per mock */}
        </View>
      </View>

      <View style={styles.tabs}>
        {(['suggested','following','followers'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, active===t && styles.tabActive]} onPress={() => setActive(t)}>
            <Text style={[styles.tabText, active===t && styles.tabTextActive]}>
              {t === 'suggested' ? 'Suggested' : t === 'following' ? '3 Following' : '0 Followers'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchBox}>
        <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor={colors.text_gray} value={query} onChangeText={setQuery} />
      </View>

      <FlatList
        data={list}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <View style={styles.personRow}>
            <View style={styles.avatar}>
              {item.avatar ? <Image source={item.avatar} style={{ width: '100%', height: '100%' }} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.personName}>{item.name}</Text>
              <Text style={styles.personHandle}>@{item.handle}</Text>
            </View>
            <TouchableOpacity style={[styles.followBtn, following.has(item.id) && styles.unfollowBtn]} onPress={() => toggleFollow(item.id)}>
              <Text style={[styles.followBtnText, following.has(item.id) && styles.unfollowBtnText]}>
                {following.has(item.id) ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },
  title: { fontFamily: typography.bold, fontSize: 18, color: colors.text_primary },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { paddingHorizontal: 10, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border_gray_light, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.tag_dark, borderColor: colors.tag_dark },
  tabText: { fontFamily: typography.medium, fontSize: 12, color: colors.text_gray },
  tabTextActive: { color: colors.tag_dark_text },
  searchBox: { marginHorizontal: 16, marginBottom: 8, height: 40, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border_gray_light, paddingHorizontal: 10, justifyContent: 'center' },
  searchInput: { fontFamily: typography.regular, color: colors.text_primary, padding: 0 },
  personRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border_gray_light },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.thumbnail_background, marginRight: 10, overflow: 'hidden' },
  personName: { fontFamily: typography.semiBold, color: colors.text_primary },
  personHandle: { fontFamily: typography.regular, color: colors.text_gray },
  followBtn: { height: 32, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.accent_lime, alignItems: 'center', justifyContent: 'center' },
  unfollowBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border_gray_light },
  followBtnText: { fontFamily: typography.semiBold, color: colors.text_primary },
  unfollowBtnText: { color: colors.text_primary },
});

export default ConnectionsScreen;

