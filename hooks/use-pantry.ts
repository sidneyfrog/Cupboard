import { useCallback, useEffect } from 'react';
import { usePantryStore } from '@/store/pantry-store';
import { useAuthStore } from '@/store/auth-store';
import * as pantryService from '@/services/pantry-service';
import type { CreatePantryItemInput, UpdatePantryItemInput } from '@/types';
import { PANTRY_STRINGS } from '@/constants/strings';

/** Hook providing pantry CRUD operations with loading/error state management. */
export function usePantry() {
  const {
    items,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    setItems,
    addItem,
    updateItem: updateStoreItem,
    removeItem,
    removeItems,
    setLoading,
    setError,
    setSearchQuery,
    setSelectedCategory,
    deductIngredients,
  } = usePantryStore();

  const user = useAuthStore((s) => s.user);

  const loadPantry = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const fetched = await pantryService.fetchPantryItems(user.id);
      setItems(fetched);
    } catch {
      setError(PANTRY_STRINGS.TITLE);
    } finally {
      setLoading(false);
    }
  }, [user, setItems, setLoading, setError]);

  const createItem = useCallback(
    async (input: CreatePantryItemInput) => {
      setError(null);
      try {
        const created = await pantryService.createPantryItem(input);
        addItem(created);
        return created;
      } catch {
        setError(PANTRY_STRINGS.ADD_ITEM);
        return null;
      }
    },
    [addItem, setError]
  );

  const editItem = useCallback(
    async (id: string, updates: UpdatePantryItemInput) => {
      setError(null);
      try {
        const updated = await pantryService.updatePantryItem(id, updates);
        updateStoreItem(id, updated);
        return updated;
      } catch {
        setError(PANTRY_STRINGS.EDIT_ITEM);
        return null;
      }
    },
    [updateStoreItem, setError]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await pantryService.deletePantryItem(id);
        removeItem(id);
      } catch {
        setError(PANTRY_STRINGS.DELETE_ITEM);
      }
    },
    [removeItem, setError]
  );

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      setError(null);
      try {
        await pantryService.deletePantryItems(ids);
        removeItems(ids);
      } catch {
        setError(PANTRY_STRINGS.BULK_DELETE);
      }
    },
    [removeItems, setError]
  );

  /** Returns items filtered by search query and selected category. */
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === null || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  /** Returns items grouped by their category. */
  const groupedItems = filteredItems.reduce<Record<string, typeof filteredItems>>(
    (groups, item) => {
      const key = item.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    },
    {}
  );

  useEffect(() => {
    loadPantry();
  }, [loadPantry]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = pantryService.subscribeToPantryChanges(
      user.id,
      (item) => addItem(item),
      (item) => updateStoreItem(item.id, item),
      (id) => removeItem(id)
    );
    return unsubscribe;
  }, [user, addItem, updateStoreItem, removeItem]);

  return {
    items,
    filteredItems,
    groupedItems,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    createItem,
    editItem,
    deleteItem,
    bulkDelete,
    deductIngredients,
    refresh: loadPantry,
  };
}
