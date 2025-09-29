// lib/stores/app.ts
import { writable, derived } from 'svelte/store';
import type { WebApp } from '@twa-dev/sdk';
import type { ViewType } from '@/lib/types/components.js';
import type { Event, Venue } from '@/lib/types/api.js';

const SCROLL_RESTORE_VIEWS = ['home', 'events-list', 'events-detail', 'venues-list', 'venues-detail', 'brands-list', 'brands-detail'];

interface NavigationContext {
	selectedEventId?: string;
	selectedVenueId?: string;
	selectedBrandId?: string;
}

interface NavigationEntry {
	view: ViewType;
	scrollPosition: number;
	context: NavigationContext;
}

interface BookingState {
	eventId: string;
	eventTitle: string;
	venueName: string;
	eventBrandId: string;
	eventSchema: string;
	eventSchemaPrice: number;
	selectedBrands: {[key: string]: number};
	guests: number;
	phone: string;
	comment: string;
	paymentMethod: 'aba' | 'ipay88' | 'stars' | '';
	currentStep: number;
}

interface AppState {
	webApp: WebApp | null;
	isLoading: boolean;
	error: string;
	currentView: ViewType;
	selectedEventId: string | null;
	selectedVenueId: string | null;
	selectedBrandId: string | null;
	selectedEvent: Event | null;
	selectedVenue: Venue | null;
	selectedBrand: any | null;
	navigationHistory: NavigationEntry[];
	bookingState: BookingState | null;
	cityData: any[];
}

const MAX_NAVIGATION_ENTRIES = 10;

const initialState: AppState = {
	webApp: null,
	isLoading: true,
	error: '',
	currentView: 'home',
	selectedEventId: null,
	selectedVenueId: null,
	selectedBrandId: null,
	selectedEvent: null,
	selectedVenue: null,
	selectedBrand: null,
	navigationHistory: [],
	bookingState: null,
	cityData: []
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

	navigate: (view: ViewType) => {
		baseAppStore.update(state => {
			const newHistory = [...state.navigationHistory];
			
			newHistory.push({
				view: state.currentView,
				scrollPosition: window.scrollY || 0,
				context: {
					selectedEventId: state.selectedEventId,
					selectedVenueId: state.selectedVenueId,
					selectedBrandId: state.selectedBrandId
				}
			});

			if (newHistory.length > MAX_NAVIGATION_ENTRIES) {
				newHistory.shift();
			}

			return {
				...state,
				navigationHistory: newHistory,
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
					const updates: Partial<AppState> = {
						navigationHistory: newHistory,
						currentView: lastEntry.view
					};

					if (lastEntry.context.selectedEventId !== state.selectedEventId) {
						updates.selectedEventId = lastEntry.context.selectedEventId || null;
					}
					if (lastEntry.context.selectedVenueId !== state.selectedVenueId) {
						updates.selectedVenueId = lastEntry.context.selectedVenueId || null;
					}
					if (lastEntry.context.selectedBrandId !== state.selectedBrandId) {
						updates.selectedBrandId = lastEntry.context.selectedBrandId || null;
					}

					if (SCROLL_RESTORE_VIEWS.includes(lastEntry.view)) {
						setTimeout(() => {
							window.scrollTo(0, lastEntry.scrollPosition);
						}, 0);
					}
					
					return { ...state, ...updates };
				}
			}
			return state;
		});
	},

	clearHistory: () => {
		baseAppStore.update(state => ({ ...state, navigationHistory: [] }));
	},

	setSelectedEventId: (id: string | null) => {
		baseAppStore.update(state => ({ ...state, selectedEventId: id }));
	},

	setSelectedVenueId: (id: string | null) => {
		baseAppStore.update(state => ({ ...state, selectedVenueId: id }));
	},

	setSelectedBrandId: (id: string | null) => {
		baseAppStore.update(state => ({ ...state, selectedBrandId: id }));
	},

	setSelectedEvent: (event: Event | null) => {
		baseAppStore.update(state => ({ ...state, selectedEvent: event }));
	},

	setSelectedVenue: (venue: Venue | null) => {
		baseAppStore.update(state => ({ ...state, selectedVenue: venue }));
	},

	setSelectedBrand: (brand: any | null) => {
		baseAppStore.update(state => ({ ...state, selectedBrand: brand }));
	},

	setCityData: (cities: any[]) => {
		baseAppStore.update(state => ({ ...state, cityData: cities }));
	},

	startBooking: (eventId: string, eventTitle: string, venueName: string, eventBrandId: string, eventSchema: string, eventSchemaPrice: number) => {
		baseAppStore.update(state => ({
			...state,
			bookingState: {
				eventId,
				eventTitle,
				venueName,
				eventBrandId,
				eventSchema,
				eventSchemaPrice,
				selectedBrands: {},
				guests: 1,
				phone: '',
				comment: '',
				paymentMethod: '',
				currentStep: 1
			}
		}));
	},

	updateBookingState: (updates: Partial<BookingState>) => {
		baseAppStore.update(state => ({
			...state,
			bookingState: state.bookingState ? { ...state.bookingState, ...updates } : null
		}));
	},

	clearBooking: () => {
		baseAppStore.update(state => ({ ...state, bookingState: null }));
	},

	handleDeepLink: (startParam?: string) => {
		baseAppStore.update(state => {
			const updates: Partial<AppState> = { navigationHistory: [] };
			
			if (startParam) {
				const [type, id] = startParam.split('_');
				const numericId = parseInt(id);
				
				if (type === 'event' && !isNaN(numericId)) {
					updates.currentView = 'events-detail';
					updates.selectedEventId = id;
				} else if (type === 'venue' && !isNaN(numericId)) {
					updates.currentView = 'venues-detail';
					updates.selectedVenueId = id;
				} else if (type === 'brand' && !isNaN(numericId)) {
					updates.currentView = 'brands-detail';
					updates.selectedBrandId = id;
				}
			}
			
			return { ...state, ...updates };
		});
	},

	reset: () => {
		baseAppStore.set(initialState);
	}
};