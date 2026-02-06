// FlyOn — SearchContext v1.3.1 | 2026-02-06

'use client';

import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react';
import type { SearchState, SearchAction, Flight, FilterState } from '@/lib/types';
import { DEFAULT_FILTER_STATE } from '@/lib/constants';

const initialState: SearchState = {
  flights: [],
  carriers: {},
  filters: { ...DEFAULT_FILTER_STATE },
  searchParams: {
    origin: null,
    destination: null,
    departureDate: '',
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'ECONOMY',
    tripType: 'roundTrip',
  },
  loading: false,
  error: null,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_FLIGHTS':
      return {
        ...state,
        flights: action.payload.flights,
        carriers: action.payload.carriers,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: { ...DEFAULT_FILTER_STATE },
      };
    case 'SET_SORT':
      return {
        ...state,
        filters: { ...state.filters, sortBy: action.payload },
      };
    case 'SET_SEARCH_PARAMS':
      return {
        ...state,
        searchParams: { ...state.searchParams, ...action.payload },
      };
    default:
      return state;
  }
}

function applyFilters(flights: Flight[], filters: FilterState): Flight[] {
  return flights.filter((flight) => {
    if (filters.stops.length > 0 && !filters.stops.includes(flight.stops)) {
      return false;
    }

    if (flight.price < filters.priceRange[0] || flight.price > filters.priceRange[1]) {
      return false;
    }

    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) {
      return false;
    }

    const departureHour = new Date(flight.departureTime).getHours();
    if (departureHour < filters.departureTimeRange[0] || departureHour >= filters.departureTimeRange[1]) {
      return false;
    }

    const arrivalHour = new Date(flight.arrivalTime).getHours();
    if (arrivalHour < filters.arrivalTimeRange[0] || arrivalHour >= filters.arrivalTimeRange[1]) {
      return false;
    }

    if (flight.duration > filters.maxDuration) {
      return false;
    }

    return true;
  });
}

function sortFlights(flights: Flight[], sortBy: string): Flight[] {
  const sorted = [...flights];
  switch (sortBy) {
    case 'price':
      return sorted.sort((a, b) => a.price - b.price);
    case 'duration':
      return sorted.sort((a, b) => a.duration - b.duration);
    case 'departure':
      return sorted.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    case 'best':
    default: {
      // Balanced score: normalize price, duration, and stops
      const maxPrice = Math.max(...sorted.map((f) => f.price), 1);
      const maxDuration = Math.max(...sorted.map((f) => f.duration), 1);
      const maxStops = Math.max(...sorted.map((f) => f.stops), 1);
      return sorted.sort((a, b) => {
        const scoreA = (a.price / maxPrice) * 0.5 + (a.duration / maxDuration) * 0.3 + (a.stops / maxStops) * 0.2;
        const scoreB = (b.price / maxPrice) * 0.5 + (b.duration / maxDuration) * 0.3 + (b.stops / maxStops) * 0.2;
        return scoreA - scoreB;
      });
    }
  }
}

interface SearchContextValue {
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
  filteredFlights: Flight[];
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const filteredFlights = useMemo(() => {
    const filtered = applyFilters(state.flights, state.filters);
    return sortFlights(filtered, state.filters.sortBy);
  }, [state.flights, state.filters]);

  const value = useMemo(() => ({ state, dispatch, filteredFlights }), [state, dispatch, filteredFlights]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
