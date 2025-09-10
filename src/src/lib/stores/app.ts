// lib/stores/app.ts
import { writable, derived } from 'svelte/store';
import type { WebApp } from '@twa-dev/sdk';
import type { ViewType } from '$lib/types/components.js';
import type { Event, Venue } from '$lib/types/api.js';

interface NavigationEntry {
	view: ViewType;
	scrollPosition: number;
	timestamp: number;
	metadata?: Record<string, any>;
}

interface BookingState {
	eventId: string;
	selectedBrands: { brandId: string; quantity: number }[];
	guests: number;
	phone: string;
	comment: string;
	paymentMethod: string;
	currentStep: number;
}

interface AppState {
	webApp: WebApp | null;
	isLoading: boolean;
	error: string;
	currentView: ViewType;
	selectedEventId: string | undefined;
	selectedEvent: Event | null;
	selectedVenue: Venue | null;
	previousView: ViewType;
	navigationHistory: NavigationEntry[];
	backgroundColor: string;
	textColor: string;
	bookingState: BookingState | null;
	canGoBack: boolean;
}

const MAX_NAVIGATION_ENTRIES = 20;

const initialState: AppState = {
	webApp: null,
	isLoading: true,
	error: '',
	currentView: 'home',
	selectedEventId: undefined,
	selectedEvent: null,
	selectedVenue: null,
	previousView: 'home',
	navigationHistory: [],
	backgroundColor: '#f9fafb',
	textColor: '#1f2937',
	bookingState: null,
	canGoBack: false
};

const baseAppStore = writable(initialState);

export const appStore = derived(
	baseAppStore,
	($base) => ({
		...$base,
		canGoBack: $base.navigationHistory.length > 0
	})
);

export const appActions = {
	setWebApp: (app: WebApp | null) => {
		baseAppStore.update(state => ({ ...state, webApp: app }));
	},

	setLoading: (loading: boolean) => {
		baseAppStore.update(state => ({ ...state, isLoading: loading }));
	},

	setError: (err: string) => {
		baseAppStore.update(state => ({ ...state, error: err }));
	},

	navigate: (view: ViewType, metadata?: Record<string, any>) => {
		baseAppStore.update(state => {
			let newHistory = [...state.navigationHistory];
			
			if (view !== 'booking') {
				newHistory.push({
					view: state.currentView,
					scrollPosition: window.scrollY || 0,
					timestamp: Date.now(),
					metadata
				});

				if (newHistory.length > MAX_NAVIGATION_ENTRIES) {
					newHistory.shift();
				}
			}

			return {
				...state,
				navigationHistory: newHistory,
				previousView: state.currentView,
				currentView: view
			};
		});
	},

	goBack: () => {
		baseAppStore.update(state => {
			if (state.navigationHistory.length > 0) {
				const newHistory = [...state.navigationHistory];
				const lastEntry = newHistory.pop();
				
				if (lastEntry) {
					setTimeout(() => {
						window.scrollTo(0, lastEntry.scrollPosition);
					}, 0);
					
					return {
						...state,
						navigationHistory: newHistory,
						previousView: state.currentView,
						currentView: lastEntry.view
					};
				}
			}
			return state;
		});
	},

	clearHistory: () => {
		baseAppStore.update(state => ({ ...state, navigationHistory: [] }));
	},

	setSelectedEventId: (eventId: string) => {
		baseAppStore.update(state => ({ 
			...state, 
			selectedEventId: eventId 
		}));
	},

	setSelectedEvent: (event: Event | null, venue?: Venue | null) => {
		baseAppStore.update(state => ({
			...state,
			selectedEvent: event,
			selectedEventId: event?.eventid.toString(),
			selectedVenue: venue || null
		}));
	},

	setThemeFromWebApp: () => {
		baseAppStore.update(state => {
			if (state.webApp?.themeParams) {
				return {
					...state,
					backgroundColor: state.webApp.themeParams.header_bg_color || initialState.backgroundColor,
					textColor: state.webApp.themeParams.text_color || initialState.textColor
				};
			}
			return state;
		});
	},

	startBooking: (eventId: string) => {
		baseAppStore.update(state => ({
			...state,
			bookingState: {
				eventId,
				selectedBrands: [],
				guests: 1,
				phone: '',
				comment: '',
				paymentMethod: '',
				currentStep: 0
			}
		}));
	},

	updateBookingState: (updates: Partial<BookingState>) => {
		baseAppStore.update(state => ({
			...state,
			bookingState: state.bookingState ? { ...state.bookingState, ...updates } : state.bookingState
		}));
	},

	clearBooking: () => {
		baseAppStore.update(state => ({ ...state, bookingState: null }));
	},

	handleDeepLink: (startParam?: string) => {
		baseAppStore.update(state => {
			let updates: Partial<AppState> = { navigationHistory: [] };
			
			if (startParam) {
				const [type, id] = startParam.split('_');
				if (type === 'event' && id) {
					updates.selectedEventId = id;
					updates.currentView = 'events';
				} else if (type === 'venue' && id) {
					updates.currentView = 'venues';
				} else if (type === 'brand' && id) {
					updates.currentView = 'brands';
				}
			}
			
			return { ...state, ...updates };
		});
	},

	reset: () => {
		baseAppStore.set(initialState);
	}
};