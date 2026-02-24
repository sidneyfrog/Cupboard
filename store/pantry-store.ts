import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PantryItem } from '@/types';

interface PantryState {
  items: PantryItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  setItems: (items: PantryItem[]) => void;
  addItem: (item: PantryItem) => void;
  updateItem: (id: string, updates: Partial<PantryItem>) => void;
  removeItem: (id: string) => void;
  removeItems: (ids: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  deductIngredients: (deductions: { name: string; quantity: number }[]) => void;
}

/** Pantry state store with offline persistence via AsyncStorage. */
export const usePantryStore = create<PantryState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedCategory: null,

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state;
          return { items: [...state.items, item] };
        }),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      removeItems: (ids) =>
        set((state) => ({
          items: state.items.filter((item) => !ids.includes(item.id)),
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

      deductIngredients: (deductions) =>
        set((state) => {
          const updatedItems = [...state.items];
          for (const deduction of deductions) {
            const matchIndex = updatedItems.findIndex(
              (item) => item.name.toLowerCase() === deduction.name.toLowerCase()
            );
            if (matchIndex !== -1) {
              const item = updatedItems[matchIndex];
              const newQuantity = item.quantity - deduction.quantity;
              if (newQuantity <= 0) {
                updatedItems.splice(matchIndex, 1);
              } else {
                updatedItems[matchIndex] = { ...item, quantity: newQuantity };
              }
            }
          }
          return { items: updatedItems };
        }),
    }),
    {
      name: 'cupboard-pantry-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
