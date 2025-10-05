import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView, Edge, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/globalStyles';
import Header from '../../components/common/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CommunityStackScreenProps } from '../../types/navigation';
import { AuthContext } from '../../contexts/AuthContext';

type Props = CommunityStackScreenProps<'CommunityEditProfile'>;

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const auth = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const initial = auth?.profile || {};

  const [firstName, setFirstName] = useState(initial.firstName || '');
  const [lastName, setLastName] = useState(initial.lastName || '');
  const [username, setUsername] = useState(initial.username || (initial.handle ? initial.handle.replace(/^@/, '') : ''));
  const [location, setLocation] = useState(initial.location || '');
  const [bio, setBio] = useState(initial.bio || '');
  const [avatarUri, setAvatarUri] = useState(initial.avatarUri || '');
  const [coverUri, setCoverUri] = useState(initial.coverUri || '');

  const safeAreaEdges: Edge[] = ['top', 'left', 'right'];

  const pickImage = async (fromCamera: boolean): Promise<string | null> => {
    try {
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission required', 'Camera access is needed.');
          return null;
        }
        const res = await ImagePicker.launchCameraAsync({ quality: 1 });
        return res.canceled ? null : res.assets[0].uri;
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission required', 'Photo library access is needed.');
          return null;
        }
        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
        return res.canceled ? null : res.assets[0].uri;
      }
    } catch (e) {
      return null;
    }
  };

  const chooseFor = (setter: (uri: string) => void) => {
    Alert.alert('Select Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: async () => {
          const u = await pickImage(true);
          if (u) setter(u);
        },
      },
      {
        text: 'Library',
        onPress: async () => {
          const u = await pickImage(false);
          if (u) setter(u);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const isDirty = useMemo(() => (
    firstName !== (initial.firstName || '') ||
    lastName !== (initial.lastName || '') ||
    username !== (initial.username || (initial.handle ? initial.handle.replace(/^@/, '') : '')) ||
    location !== (initial.location || '') ||
    bio !== (initial.bio || '') ||
    avatarUri !== (initial.avatarUri || '') ||
    coverUri !== (initial.coverUri || '')
  ), [firstName, lastName, username, location, bio, avatarUri, coverUri]);

  const onSave = async () => {
    if (!auth?.updateProfile) return;
    const displayName = [firstName, lastName].filter(Boolean).join(' ').trim() || initial.displayName;
    const handle = username ? (username.startsWith('@') ? username : `@${username}`) : initial.handle;
    await auth.updateProfile({ firstName, lastName, username, location, bio, avatarUri, coverUri, displayName, handle });
    Alert.alert('Saved', 'Your profile has been updated.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <Header onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: Math.max(120, insets.bottom + 80) }}>
        <Text style={styles.title}>Edit profile</Text>

        {/* Cover with avatar */}
        <View style={styles.cover}>
          {coverUri ? <Image source={{ uri: coverUri }} style={styles.coverImg} resizeMode="cover" /> : null}
          <TouchableOpacity style={styles.coverCam} onPress={() => chooseFor(setCoverUri)}>
            <MaterialCommunityIcons name="camera-outline" size={18} color={'#000'} />
          </TouchableOpacity>
          <View style={styles.avatarWrap}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => chooseFor(setAvatarUri)}>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  {avatarUri ? <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} /> : null}
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarCam} onPress={() => chooseFor(setAvatarUri)}>
              <MaterialCommunityIcons name="camera-outline" size={18} color={'#000'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Field label="First Name" value={firstName} onChangeText={setFirstName} />
          <Field label="Last Name" value={lastName} onChangeText={setLastName} />
          <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
          <Field label="Location" value={location} onChangeText={setLocation} />
          <Field label="Bio" value={bio} onChangeText={setBio} multiline />

          <TouchableOpacity
            style={[styles.saveBtnBase, isDirty ? styles.saveBtnEnabled : styles.saveBtnDisabled, { marginBottom: insets.bottom + 16 }]}
            disabled={!isDirty}
            onPress={onSave}
            activeOpacity={0.9}
          >
            <Text style={[styles.saveText, !isDirty && styles.saveTextDisabled]}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}> = ({ label, value, onChangeText, multiline, autoCapitalize }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textarea]}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={colors.text_gray}
      multiline={multiline}
      autoCapitalize={autoCapitalize}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen_background },
  title: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8, fontFamily: typography.bold, fontSize: 18, color: colors.text_primary },
  cover: { height: 160, marginHorizontal: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#D9C2FF', overflow: 'hidden', position: 'relative' },
  coverImg: { ...StyleSheet.absoluteFillObject as any },
  coverCam: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', zIndex: 2, elevation: 2 },
  avatarWrap: { position: 'absolute', left: 16, bottom: 8 },
  avatarRing: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.thumbnail_background, overflow: 'hidden' },
  avatarCam: { position: 'absolute', right: -6, bottom: -6, width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', zIndex: 3, elevation: 3 },

  form: { marginTop: 16, paddingHorizontal: 16 },
  label: { fontFamily: typography.medium, color: colors.text_primary, marginBottom: 6 },
  input: { height: 42, borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border_gray_light, fontFamily: typography.regular, color: colors.text_primary },
  textarea: { minHeight: 90, paddingTop: 10, textAlignVertical: 'top' },
  saveBtnBase: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  saveBtnEnabled: { backgroundColor: colors.primary_yellow },
  saveBtnDisabled: { backgroundColor: '#EAE6DA', borderWidth: 1, borderColor: colors.border_gray_light },
  saveText: { fontFamily: typography.semiBold, color: colors.text_primary },
  saveTextDisabled: { color: colors.text_gray },
});

export default EditProfileScreen;
