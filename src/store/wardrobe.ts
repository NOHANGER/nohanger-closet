import { create } from 'zustand';
import { wardrobeApi, type Garment } from '../api/wardrobe';

export type WardrobeState = {
  items: Garment[];
  fetch: () => Promise<void>;
};

export const useWardrobeStore = create<WardrobeState>((set) => ({
  items: [],
  fetch: async () => {
    const items = await wardrobeApi.list();
    set({ items });
  },
}));
