export interface OutfitItem {
  id: string; // id of the clothing item
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  zIndex: number;
}

export interface Outfit {
  id: string;
  imageUri: string;
  createdAt: string;
  updatedAt: string;
  clothingItems: OutfitItem[]; // Array of clothing item references with their canvas positions and zIndex
  tags: string[]; // custom tags, e.g., 'summer looks', 'date night'
  season: string[]; // Spring, Summer, Fall, Winter
  occasion: string[]; // Casual, Work, Formal, Party
  isFavorite: boolean;
}

export interface PlannedOutfit {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  outfitId?: string; // Reference to a saved Outfit
  photoUri?: string; // Direct photo URI (for "Add outfit photo" flow)
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerEvent {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  title: string;
  description: string;
  createdAt: string;
}
