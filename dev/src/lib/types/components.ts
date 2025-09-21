// lib/types/components.ts - Component interfaces and utility types

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export type ViewType = 
  | 'home'
  | 'events-list' | 'events-detail' 
  | 'venues-list' | 'venues-detail'
  | 'brands-list' | 'brands-detail'
  | 'booking-step-1' | 'booking-step-2' | 'booking-step-3' | 'booking-step-4';

export type BookingAction = 'prev' | 'next' | 'cancel' | 'complete';

export interface FilterState {
  cityId?: number;
  venueType?: string;
  searchTerm?: string;
  featuredOnly?: boolean;
}

export interface NavigationState {
  currentView: ViewType;
  showBackButton: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}