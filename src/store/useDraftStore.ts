import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Define Draft types
export interface RecipeDraft {
  id: string;
  type: 'recipe';
  title: string;
  description: string;
  images: any[]; // Store asset objects or uris
  video: any | null;
  ingredients: { name: string; amount: string }[];
  steps: { description: string; image?: string }[];
  difficulty: string;
  cookingTime: string;
  category: string;
  tags: string[];
  updatedAt: number;
}

export interface StoreDraft {
  id: string;
  type: 'store';
  title: string;
  content: string;
  rating: number;
  images: any[];
  video: any | null;
  address: string;
  location: any | null;
  hours: string;
  phone: string;
  updatedAt: number;
}

export type Draft = RecipeDraft | StoreDraft;

interface DraftState {
  drafts: Draft[];
  addDraft: (draft: Draft) => void;
  removeDraft: (id: string) => void;
  updateDraft: (draft: Draft) => void;
  getDraft: (id: string) => Draft | undefined;
}

const STORAGE_KEY = 'draft-storage';

// Helper functions for storage
const loadDraftsFromStorage = async (): Promise<Draft[]> => {
  try {
    let jsonValue: string | null = null;
    if (Platform.OS === 'web') {
      jsonValue = localStorage.getItem(STORAGE_KEY);
    } else {
      const fileUri = FileSystem.documentDirectory + STORAGE_KEY + '.json';
      const info = await FileSystem.getInfoAsync(fileUri);
      if (info.exists) {
        jsonValue = await FileSystem.readAsStringAsync(fileUri);
      }
    }

    if (jsonValue != null) {
      const data = JSON.parse(jsonValue);
      // Handle zustand persist format if existing data is from persist middleware
      // persist format: { state: { drafts: [...] }, version: 0 }
      if (data && data.state && Array.isArray(data.state.drafts)) {
          return data.state.drafts;
      }
      // Or direct array if saved manually later
      if (Array.isArray(data)) {
          return data;
      }
    }
  } catch (e) {
    console.error('Failed to load drafts', e);
  }
  return [];
};

const saveDraftsToStorage = async (drafts: Draft[]) => {
  try {
    // Save as direct array to simplify
    const jsonValue = JSON.stringify(drafts);
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEY, jsonValue);
    } else {
      const fileUri = FileSystem.documentDirectory + STORAGE_KEY + '.json';
      await FileSystem.writeAsStringAsync(fileUri, jsonValue);
    }
  } catch (e) {
    console.error('Failed to save drafts', e);
  }
};

export const useDraftStore = create<DraftState>((set, get) => ({
  drafts: [],
  addDraft: (draft) => {
    set((state) => {
      const index = state.drafts.findIndex(d => d.id === draft.id);
      let newDrafts;
      if (index >= 0) {
          newDrafts = [...state.drafts];
          newDrafts[index] = { ...draft, updatedAt: Date.now() };
      } else {
          newDrafts = [{ ...draft, updatedAt: Date.now() }, ...state.drafts];
      }
      saveDraftsToStorage(newDrafts);
      return { drafts: newDrafts };
    });
  },
  updateDraft: (draft) => {
    set((state) => {
        const newDrafts = state.drafts.map((d) => (d.id === draft.id ? { ...draft, updatedAt: Date.now() } : d));
        saveDraftsToStorage(newDrafts);
        return { drafts: newDrafts };
    });
  },
  removeDraft: (id) => {
    set((state) => {
        const newDrafts = state.drafts.filter((d) => d.id !== id);
        saveDraftsToStorage(newDrafts);
        return { drafts: newDrafts };
    });
  },
  getDraft: (id) => get().drafts.find((d) => d.id === id),
}));

// Initialize
loadDraftsFromStorage().then((drafts) => {
    if (drafts && drafts.length > 0) {
        useDraftStore.setState({ drafts });
    }
});
