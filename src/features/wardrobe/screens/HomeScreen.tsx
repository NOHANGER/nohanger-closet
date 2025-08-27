import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9', padding: 16 }}>
      <Text style={{ color: '#1C1C1C', fontSize: 24, fontWeight: '600', marginBottom: 16 }}>
        Nohanger Closet
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('Wardrobe')} style={{ backgroundColor: '#34C759', padding: 16, borderRadius: 12 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Open Wardrobe</Text>
      </TouchableOpacity>
    </View>
  );
}
