// lib/types/components.ts - Component interfaces and utility types

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export type ViewType = 'home' | 'events' | 'venues' | 'brands';

export interface FilterState {
  cityId?: number;
  venueType?: string;
  searchTerm?: string;
  featuredOnly?: boolean;
}

export interface NavigationState {
  currentView: ViewType;
  showBackButton: boolean;
  canGoBack: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}