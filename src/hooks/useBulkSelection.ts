import { useState, useCallback } from 'react';

export interface BulkSelectionState {
  selectedItems: string[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export function useBulkSelection(allItemIds: string[]) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const isAllSelected = selectedItems.length === allItemIds.length && allItemIds.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < allItemIds.length;

  const toggleItem = useCallback((itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedItems(isAllSelected ? [] : [...allItemIds]);
  }, [allItemIds, isAllSelected]);

  const selectAll = useCallback(() => {
    setSelectedItems([...allItemIds]);
  }, [allItemIds]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const selectItems = useCallback((itemIds: string[]) => {
    setSelectedItems(itemIds);
  }, []);

  return {
    selectedItems,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    selectAll,
    clearSelection,
    selectItems,
    hasSelection: selectedItems.length > 0,
    selectionCount: selectedItems.length,
  };
}