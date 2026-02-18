import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/globalStyles';
import Header from '../../components/common/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityStackScreenProps } from '../../types/navigation';
import { SettingsContext } from '../../contexts/SettingsContext';

type Props = CommunityStackScreenProps<'CommunitySettings'>;

const Row: React.FC<{
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
}> = ({ icon, label, onPress, right }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    activeOpacity={0.85}
    disabled={!onPress && !right}
  >
    <View style={styles.rowIcon}>{icon}</View>
    <Text style={styles.rowText}>{label}</Text>
    {right ?? (
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text_gray} />
    )}
  </TouchableOpacity>
);

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const safeAreaEdges: Edge[] = ['top', 'left', 'right'];
  const ctx = useContext(SettingsContext);

  if (!ctx) return null;

  const { settings, updateSetting, resetSettings } = ctx;

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, 'Feature coming soon');
  };

  const handleFeedVisibility = () => {
    const options: Array<{ label: string; value: 'public' | 'followers' | 'private' }> = [
      { label: 'Public', value: 'public' },
      { label: 'Followers Only', value: 'followers' },
      { label: 'Private', value: 'private' },
    ];

    Alert.alert(
      'Activity Feed Visibility',
      `Current: ${settings.feedVisibility}\n\nChoose who can see your activity feed:`,
      [
        ...options.map((opt) => ({
          text: `${opt.label}${settings.feedVisibility === opt.value ? ' (current)' : ''}`,
          onPress: () => updateSetting('feedVisibility', opt.value),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  };

  const handleLanguage = () => {
    Alert.alert('Language', 'Select your preferred language:', [
      {
        text: `English${settings.language === 'English' ? ' (current)' : ''}`,
        onPress: () => updateSetting('language', 'English'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to their defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetSettings,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => Alert.alert('Account Deletion', 'Feature coming soon'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <Header onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy & settings</Text>

        {/* Account Section */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <Row
            icon={<MaterialCommunityIcons name="account-circle-outline" size={18} color={colors.text_primary} />}
            label="Edit profile"
            onPress={() => navigation.navigate('CommunityEditProfile')}
          />
          <Row
            icon={<MaterialCommunityIcons name="file-document-outline" size={18} color={colors.text_primary} />}
            label="Personal Information"
            onPress={() => showComingSoon('Personal Information')}
          />
          <Row
            icon={<MaterialCommunityIcons name="lock-outline" size={18} color={colors.text_primary} />}
            label="Passwords & Privacy"
            onPress={() => showComingSoon('Passwords & Privacy')}
          />
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <Row
            icon={<MaterialCommunityIcons name="bell-ring-outline" size={18} color={colors.text_primary} />}
            label="Notifications & reminders"
            right={
              <Switch
                value={settings.notifications}
                onValueChange={(val) => updateSetting('notifications', val)}
                trackColor={{ false: colors.border_gray, true: colors.primary_yellow }}
                thumbColor="#fff"
              />
            }
          />
          <Row
            icon={<MaterialCommunityIcons name="rss" size={18} color={colors.text_primary} />}
            label="Activity Feed"
            onPress={handleFeedVisibility}
            right={
              <View style={styles.badgeRow}>
                <Text style={styles.badgeText}>{settings.feedVisibility}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text_gray} />
              </View>
            }
          />
          <Row
            icon={<MaterialCommunityIcons name="translate" size={18} color={colors.text_primary} />}
            label="Language"
            onPress={handleLanguage}
            right={
              <View style={styles.badgeRow}>
                <Text style={styles.badgeText}>{settings.language}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text_gray} />
              </View>
            }
          />
        </View>

        {/* Processing Section */}
        <Text style={styles.sectionLabel}>Processing</Text>
        <View style={styles.card}>
          <Row
            icon={<MaterialCommunityIcons name="image-auto-adjust" size={18} color={colors.text_primary} />}
            label="Auto Background Removal"
            right={
              <Switch
                value={settings.autoBackgroundRemoval}
                onValueChange={(val) => updateSetting('autoBackgroundRemoval', val)}
                trackColor={{ false: colors.border_gray, true: colors.primary_yellow }}
                thumbColor="#fff"
              />
            }
          />
          <Row
            icon={<MaterialCommunityIcons name="palette-outline" size={18} color={colors.text_primary} />}
            label="Auto Color Detection"
            right={
              <Switch
                value={settings.autoColorDetection}
                onValueChange={(val) => updateSetting('autoColorDetection', val)}
                trackColor={{ false: colors.border_gray, true: colors.primary_yellow }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Reset Settings */}
        <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings} activeOpacity={0.8}>
          <MaterialCommunityIcons name="restore" size={18} color={colors.primary_yellow} />
          <Text style={styles.resetButtonText}>Reset Settings</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} activeOpacity={0.8}>
          <MaterialCommunityIcons name="delete-outline" size={18} color={colors.primary_red} />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version: 3.2.49</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontFamily: typography.bold, fontSize: 20, color: colors.text_primary, marginBottom: 16 },
  sectionLabel: {
    fontFamily: typography.semiBold,
    fontSize: 13,
    color: colors.text_gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border_gray_light,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border_gray_light,
  },
  rowIcon: { width: 28, alignItems: 'center' },
  rowText: { flex: 1, fontFamily: typography.medium, color: colors.text_primary },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: {
    fontFamily: typography.regular,
    fontSize: 13,
    color: colors.text_gray,
    textTransform: 'capitalize',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary_yellow,
    backgroundColor: '#fff',
  },
  resetButtonText: {
    fontFamily: typography.semiBold,
    fontSize: 15,
    color: colors.primary_yellow,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary_red,
    backgroundColor: '#fff',
  },
  deleteButtonText: {
    fontFamily: typography.semiBold,
    fontSize: 15,
    color: colors.primary_red,
  },
  version: {
    marginTop: 24,
    textAlign: 'center',
    color: colors.text_gray,
    fontFamily: typography.regular,
    fontSize: 12,
  },
});

export default SettingsScreen;
