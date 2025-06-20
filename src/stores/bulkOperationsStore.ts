import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface BulkOperationsState {
  selectedItems: Set<string>;
  isSelectionMode: boolean;
  
  // Actions
  toggleSelectionMode: () => void;
  toggleItemSelection: (id: string) => void;
  selectAllItems: (ids: string[]) => void;
  clearSelection: () => void;
  isItemSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  getSelectedIds: () => string[];
}

export const useBulkOperationsStore = create<BulkOperationsState>()(
  devtools(
    (set, get) => ({
      selectedItems: new Set(),
      isSelectionMode: false,

      toggleSelectionMode: () => set((state) => ({
        isSelectionMode: !state.isSelectionMode,
        selectedItems: state.isSelectionMode ? new Set() : state.selectedItems
      })),

      toggleItemSelection: (id: string) => set((state) => {
        const newSelection = new Set(state.selectedItems);
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }
        return { selectedItems: newSelection };
      }),

      selectAllItems: (ids: string[]) => set(() => ({
        selectedItems: new Set(ids)
      })),

      clearSelection: () => set(() => ({
        selectedItems: new Set(),
        isSelectionMode: false
      })),

      isItemSelected: (id: string) => {
        return get().selectedItems.has(id);
      },

      getSelectedCount: () => {
        return get().selectedItems.size;
      },

      getSelectedIds: () => {
        return Array.from(get().selectedItems);
      }
    }),
    {
      name: 'bulk-operations-store',
    }
  )
);