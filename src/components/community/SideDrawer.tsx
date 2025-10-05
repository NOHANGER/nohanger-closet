import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions, Pressable, ViewStyle } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/globalStyles';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  profile: { name?: string; handle?: string; avatarUri?: string };
  following: number;
  followers: number;
  onOpenConnections: (tab?: 'suggested' | 'following' | 'followers') => void;
  onOpenSettings: () => void;
  onInvite: () => void;
  onRate: () => void;
  onHelp: () => void;
  onShare: () => void;
  onLogout: () => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);

type RowProps = { icon: React.ReactNode; label: string; onPress?: () => void; chevron?: boolean; danger?: boolean };
const Row: React.FC<RowProps> = ({ icon, label, onPress, chevron = true, danger = false }) => (
  <TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={onPress}>
    <View style={styles.rowIcon}>{icon}</View>
    <Text style={[styles.rowText, danger && styles.rowTextDanger]} numberOfLines={1}>{label}</Text>
    {chevron && <MaterialIcons name="chevron-right" size={20} color={colors.text_gray} />}
  </TouchableOpacity>
);

const SideDrawer: React.FC<Props> = ({ visible, onClose, profile, following, followers, onOpenConnections, onOpenSettings, onInvite, onRate, onHelp, onShare, onLogout }) => {
  const x = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(x, { toValue: visible ? 0 : -PANEL_WIDTH, duration: 200, useNativeDriver: true }).start();
  }, [visible]);

  if (!visible) {
    // still render for exit animation; overlay press catches during visible only
  }

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />
      {/* Panel */}
      <Animated.View style={[styles.panel, { paddingTop: insets.top + 16, transform: [{ translateX: x }], width: PANEL_WIDTH }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {profile.avatarUri ? (
                <Image key={profile.avatarUri} source={{ uri: profile.avatarUri }} style={{ width: '100%', height: '100%' }} />
              ) : null}
            </View>
            <View>
              <Text style={styles.name}>{profile.name || 'Esdan'}</Text>
              <Text style={styles.handle}>{profile.handle || '@esdanali'}</Text>
            </View>
          </View>
          <View style={styles.followRow}>
            <TouchableOpacity onPress={() => { onClose(); onOpenConnections('following'); }}>
              <Text style={styles.followStat}>{following} Following</Text>
            </TouchableOpacity>
            <Text style={styles.dot}>·</Text>
            <TouchableOpacity onPress={() => { onClose(); onOpenConnections('followers'); }}>
              <Text style={styles.followStat}>{followers} Followers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Options */}
        <View style={styles.list}>
          <Row icon={<MaterialCommunityIcons name="account-multiple-plus-outline" size={20} color={colors.text_primary} />} label="Invite friends" onPress={() => { onClose(); onInvite(); }} />
          <Row icon={<MaterialCommunityIcons name="shield-lock-outline" size={20} color={colors.text_primary} />} label="Privacy & settings" onPress={() => { onClose(); onOpenSettings(); }} />
          <Row icon={<MaterialCommunityIcons name="help-circle-outline" size={20} color={colors.text_primary} />} label="Help" onPress={() => { onClose(); onHelp(); }} />
          <Row icon={<MaterialIcons name="star-rate" size={20} color={colors.text_primary} />} label="Rate Whering" onPress={() => { onClose(); onRate(); }} />
          <Row icon={<MaterialCommunityIcons name="share-outline" size={20} color={colors.text_primary} />} label="Share profile" onPress={() => { onClose(); onShare(); }} />
          <Row icon={<MaterialCommunityIcons name="logout" size={20} color={colors.primary_red} />} label="Logout" chevron={false} danger onPress={() => { onClose(); onLogout(); }} />
        </View>

        <View style={styles.versionWrap}>
          <Text style={styles.version}>Version: 3.2.49</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: { ...(StyleSheet.absoluteFillObject as ViewStyle), backgroundColor: 'rgba(0,0,0,0.25)' },
  panel: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: colors.screen_background, paddingTop: 16, paddingHorizontal: 16, borderRightWidth: 1, borderRightColor: colors.border_gray_light },
  header: { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border_gray_light, marginBottom: 10 },
  avatarWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.thumbnail_background, overflow: 'hidden' },
  name: { fontFamily: typography.semiBold, fontSize: 16, color: colors.text_primary },
  handle: { fontFamily: typography.regular, fontSize: 12, color: colors.text_gray },
  followRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  followStat: { fontFamily: typography.medium, fontSize: 12, color: colors.text_primary },
  dot: { color: colors.text_gray },
  list: { marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderBottomWidth: 1, borderBottomColor: colors.border_gray_light },
  rowIcon: { width: 32, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, fontFamily: typography.medium, color: colors.text_primary },
  rowTextDanger: { color: colors.primary_red },
  versionWrap: { marginTop: 'auto', paddingTop: 12, paddingBottom: 16, borderTopWidth: 1, borderTopColor: colors.border_gray_light },
  version: { textAlign: 'center', color: colors.text_gray, fontFamily: typography.regular, fontSize: 12 },
});

export default SideDrawer;
