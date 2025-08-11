import { useReducer, useCallback } from 'react';

// UI State type
export interface UIState {
  activeTab: string;
  isFormOpen: boolean;
  isWatchlistMode: boolean;
  globalSearchTerm: string;
  isMobileMenuOpen: boolean;
}

// Action types
export type TabAction =
  | { type: 'TAB_SET'; payload: string }
  | { type: 'FORM_TOGGLE'; payload?: boolean }
  | { type: 'FORM_OPEN' }
  | { type: 'FORM_CLOSE' }
  | { type: 'WATCHLIST_MODE_TOGGLE'; payload?: boolean }
  | { type: 'SEARCH_TERM_SET'; payload: string }
  | { type: 'MOBILE_MENU_TOGGLE'; payload?: boolean }
  | { type: 'RESET' };

// Initial state
const initialUIState: UIState = {
  activeTab: "dashboard",
  isFormOpen: false,
  isWatchlistMode: false,
  globalSearchTerm: "",
  isMobileMenuOpen: false,
};

// Reducer function
function tabReducer(state: UIState, action: TabAction): UIState {
  switch (action.type) {
    case 'TAB_SET':
      return { ...state, activeTab: action.payload };
    
    case 'FORM_TOGGLE':
      return { 
        ...state, 
        isFormOpen: action.payload !== undefined ? action.payload : !state.isFormOpen 
      };
    
    case 'FORM_OPEN':
      return { ...state, isFormOpen: true };
    
    case 'FORM_CLOSE':
      return { ...state, isFormOpen: false };
    
    case 'WATCHLIST_MODE_TOGGLE':
      return { 
        ...state, 
        isWatchlistMode: action.payload !== undefined ? action.payload : !state.isWatchlistMode 
      };
    
    case 'SEARCH_TERM_SET':
      return { ...state, globalSearchTerm: action.payload };
    
    case 'MOBILE_MENU_TOGGLE':
      return { 
        ...state, 
        isMobileMenuOpen: action.payload !== undefined ? action.payload : !state.isMobileMenuOpen 
      };
    
    case 'RESET':
      return initialUIState;
    
    default:
      return state;
  }
}

// Custom hook with typed dispatch actions
export function useTabReducer() {
  const [state, dispatch] = useReducer(tabReducer, initialUIState);

  // Memoized action creators using useCallback for stable identity
  const setActiveTab = useCallback((tab: string) => {
    dispatch({ type: 'TAB_SET', payload: tab });
  }, []);

  const setIsFormOpen = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    if (typeof open === 'function') {
      dispatch({ type: 'FORM_TOGGLE', payload: open(state.isFormOpen) });
    } else {
      dispatch({ type: 'FORM_TOGGLE', payload: open });
    }
  }, [state.isFormOpen]);

  const setIsWatchlistMode = useCallback((mode: boolean | ((prev: boolean) => boolean)) => {
    if (typeof mode === 'function') {
      dispatch({ type: 'WATCHLIST_MODE_TOGGLE', payload: mode(state.isWatchlistMode) });
    } else {
      dispatch({ type: 'WATCHLIST_MODE_TOGGLE', payload: mode });
    }
  }, [state.isWatchlistMode]);

  const setGlobalSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SEARCH_TERM_SET', payload: term });
  }, []);

  const setIsMobileMenuOpen = useCallback((open: boolean) => {
    dispatch({ type: 'MOBILE_MENU_TOGGLE', payload: open });
  }, []);

  const resetUIState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    uiState: state,
    dispatch,
    // Stable action creators
    setActiveTab,
    setIsFormOpen,
    setIsWatchlistMode,
    setGlobalSearchTerm,
    setIsMobileMenuOpen,
    resetUIState,
  };
}
