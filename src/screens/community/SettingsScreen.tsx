import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/globalStyles';
import Header from '../../components/common/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityStackScreenProps } from '../../types/navigation';

type Props = CommunityStackScreenProps<'CommunitySettings'>;

const Row: React.FC<{ icon: React.ReactNode; label: string; onPress?: () => void }> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.rowIcon}>{icon}</View>
    <Text style={styles.rowText}>{label}</Text>
    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text_gray} />
  </TouchableOpacity>
);

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const safeAreaEdges: Edge[] = ['top', 'left', 'right'];
  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <Header onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy & settings</Text>
        <View style={styles.card}>
          <Row icon={<MaterialCommunityIcons name="account-circle-outline" size={18} color={colors.text_primary} />} label="Edit profile" onPress={() => navigation.navigate('CommunityEditProfile')} />
          <Row icon={<MaterialCommunityIcons name="file-document-outline" size={18} color={colors.text_primary} />} label="Personal Information" />
          <Row icon={<MaterialCommunityIcons name="lock-outline" size={18} color={colors.text_primary} />} label="Passwords & Privacy" />
          <Row icon={<MaterialCommunityIcons name="bell-ring-outline" size={18} color={colors.text_primary} />} label="Notifications & reminders" />
          <Row icon={<MaterialCommunityIcons name="rss" size={18} color={colors.text_primary} />} label="Activity Feed" />
          <Row icon={<MaterialCommunityIcons name="translate" size={18} color={colors.text_primary} />} label="Language" />
        </View>
        <Text style={styles.version}>Version: 3.2.49</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  content: { padding: 16 },
  title: { fontFamily: typography.bold, fontSize: 20, color: colors.text_primary, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border_gray_light, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', height: 48, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.border_gray_light },
  rowIcon: { width: 28, alignItems: 'center' },
  rowText: { flex: 1, fontFamily: typography.medium, color: colors.text_primary },
  version: { marginTop: 16, textAlign: 'center', color: colors.text_gray, fontFamily: typography.regular, fontSize: 12 },
});

export default SettingsScreen;
