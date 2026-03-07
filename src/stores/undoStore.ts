// Undo/Redo system for DAW operations
import { create } from 'zustand';
import type { Track } from '@/types/daw';

interface UndoAction {
  type: string;
  description: string;
  before: Partial<{ tracks: Track[] }>;
  after: Partial<{ tracks: Track[] }>;
}

interface UndoStore {
  undoStack: UndoAction[];
  redoStack: UndoAction[];
  maxHistory: number;
  pushAction: (action: UndoAction) => void;
  undo: () => UndoAction | null;
  redo: () => UndoAction | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

export const useUndoStore = create<UndoStore>((set, get) => ({
  undoStack: [],
  redoStack: [],
  maxHistory: 50,
  
  pushAction: (action) => set((s) => ({
    undoStack: [...s.undoStack.slice(-(s.maxHistory - 1)), action],
    redoStack: [], // Clear redo on new action
  })),
  
  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return null;
    const action = undoStack[undoStack.length - 1];
    set((s) => ({
      undoStack: s.undoStack.slice(0, -1),
      redoStack: [...s.redoStack, action],
    }));
    return action;
  },
  
  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return null;
    const action = redoStack[redoStack.length - 1];
    set((s) => ({
      redoStack: s.redoStack.slice(0, -1),
      undoStack: [...s.undoStack, action],
    }));
    return action;
  },
  
  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
  clear: () => set({ undoStack: [], redoStack: [] }),
}));
