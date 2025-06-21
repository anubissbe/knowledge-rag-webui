import { useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import type { Memory } from '../types';

interface UseRealtimeMemoriesOptions {
  onMemoryCreated?: (memory: Memory) => void;
  onMemoryUpdated?: (memory: Memory) => void;
  onMemoryDeleted?: (data: { id: string }) => void;
}

export function useRealtimeMemories({
  onMemoryCreated,
  onMemoryUpdated,
  onMemoryDeleted,
}: UseRealtimeMemoriesOptions = {}) {
  const { on, isConnected } = useWebSocket();

  const handleMemoryCreated = useCallback((memory: Memory) => {
    console.log('Memory created:', memory);
    onMemoryCreated?.(memory);
  }, [onMemoryCreated]);

  const handleMemoryUpdated = useCallback((memory: Memory) => {
    console.log('Memory updated:', memory);
    onMemoryUpdated?.(memory);
  }, [onMemoryUpdated]);

  const handleMemoryDeleted = useCallback((data: { id: string }) => {
    console.log('Memory deleted:', data);
    onMemoryDeleted?.(data);
  }, [onMemoryDeleted]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeCreated = on('memory:created', handleMemoryCreated);
    const unsubscribeUpdated = on('memory:updated', handleMemoryUpdated);
    const unsubscribeDeleted = on('memory:deleted', handleMemoryDeleted);

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [isConnected, on, handleMemoryCreated, handleMemoryUpdated, handleMemoryDeleted]);

  return { isConnected };
}