import { create } from 'zustand';

type UIState = {
  hasOnboarded: boolean;
  setOnboarded: (value: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  hasOnboarded: false,
  setOnboarded: (value) => set({ hasOnboarded: value }),
}));
