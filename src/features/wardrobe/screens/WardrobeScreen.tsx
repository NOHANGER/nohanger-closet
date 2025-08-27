import React, { useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useWardrobeStore } from '../../../store';

export default function WardrobeScreen() {
  const items = useWardrobeStore((s) => s.items);
  const fetch = useWardrobeStore((s) => s.fetch);

  useEffect(() => {
    fetch().catch(() => {});
  }, [fetch]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9', padding: 16 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text style={{ color: '#1C1C1C', fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
            <Text style={{ color: '#555', fontSize: 14 }}>{item.category}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#1C1C1C' }}>No garments yet.</Text>}
      />
    </View>
  );
}
