import { api } from './client';
export type Garment = { id: string; name: string; category: string; color?: string; imageUri?: string };
export const wardrobeApi = {
  list: async (): Promise<Garment[]> => [
    { id: '1', name: 'Black Tee', category: 'Top', color: 'Black' },
    { id: '2', name: 'Blue Jeans', category: 'Bottom', color: 'Blue' },
  ],
  create: async (g: Omit<Garment, 'id'>) => (await api.post('/wardrobe', g)).data,
};
