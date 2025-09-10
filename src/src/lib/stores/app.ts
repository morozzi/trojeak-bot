// lib/stores/app.ts
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
	bookingState: null
};

let webApp = $state<WebApp | null>(initialState.webApp);
let isLoading = $state<boolean>(initialState.isLoading);
let error = $state<string>(initialState.error);
let currentView = $state<ViewType>(initialState.currentView);
let selectedEventId = $state<string | undefined>(initialState.selectedEventId);
let selectedEvent = $state<Event | null>(initialState.selectedEvent);
let selectedVenue = $state<Venue | null>(initialState.selectedVenue);
let previousView = $state<ViewType>(initialState.previousView);
let navigationHistory = $state<NavigationEntry[]>(initialState.navigationHistory);
let backgroundColor = $state<string>(initialState.backgroundColor);
let textColor = $state<string>(initialState.textColor);
let bookingState = $state<BookingState | null>(initialState.bookingState);

const canGoBack = $derived(navigationHistory.length > 0);

export const appStore = {
	get webApp() { return webApp; },
	get isLoading() { return isLoading; },
	get error() { return error; },
	get currentView() { return currentView; },
	get selectedEventId() { return selectedEventId; },
	get selectedEvent() { return selectedEvent; },
	get selectedVenue() { return selectedVenue; },
	get previousView() { return previousView; },
	get navigationHistory() { return navigationHistory; },
	get backgroundColor() { return backgroundColor; },
	get textColor() { return textColor; },
	get bookingState() { return bookingState; },
	get canGoBack() { return canGoBack; },

	setWebApp: (app: WebApp | null) => {
		webApp = app;
	},

	setLoading: (loading: boolean) => {
		isLoading = loading;
	},

	setError: (err: string) => {
		error = err;
	},

	navigate: (view: ViewType, metadata?: Record<string, any>) => {
		if (view !== 'booking') {
			navigationHistory.push({
				view: currentView,
				scrollPosition: window.scrollY || 0,
				timestamp: Date.now(),
				metadata
			});

			if (navigationHistory.length > MAX_NAVIGATION_ENTRIES) {
				navigationHistory.shift();
			}
		}

		previousView = currentView;
		currentView = view;
	},

	goBack: () => {
		if (navigationHistory.length > 0) {
			const lastEntry = navigationHistory.pop();
			if (lastEntry) {
				previousView = currentView;
				currentView = lastEntry.view;
				setTimeout(() => {
					window.scrollTo(0, lastEntry.scrollPosition);
				}, 0);
			}
		}
	},

	clearHistory: () => {
		navigationHistory.length = 0;
	},

	setSelectedEvent: (event: Event | null, venue?: Venue | null) => {
		selectedEvent = event;
		selectedEventId = event?.eventid;
		selectedVenue = venue || null;
	},

	setThemeFromWebApp: () => {
		if (webApp?.themeParams) {
			backgroundColor = webApp.themeParams.header_bg_color || backgroundColor;
			textColor = webApp.themeParams.text_color || textColor;
		}
	},

	startBooking: (eventId: string) => {
		bookingState = {
			eventId,
			selectedBrands: [],
			guests: 1,
			phone: '',
			comment: '',
			paymentMethod: '',
			currentStep: 0
		};
	},

	updateBookingState: (updates: Partial<BookingState>) => {
		if (bookingState) {
			bookingState = { ...bookingState, ...updates };
		}
	},

	clearBooking: () => {
		bookingState = null;
	},

	handleDeepLink: (startParam?: string) => {
		appStore.clearHistory();
		
		if (startParam) {
			const [type, id] = startParam.split('_');
			if (type === 'event' && id) {
				selectedEventId = id;
				currentView = 'events';
			} else if (type === 'venue' && id) {
				currentView = 'venues';
			} else if (type === 'brand' && id) {
				currentView = 'brands';
			}
		}
	},

	reset: () => {
		webApp = initialState.webApp;
		isLoading = initialState.isLoading;
		error = initialState.error;
		currentView = initialState.currentView;
		selectedEventId = initialState.selectedEventId;
		selectedEvent = initialState.selectedEvent;
		selectedVenue = initialState.selectedVenue;
		previousView = initialState.previousView;
		navigationHistory = [];
		backgroundColor = initialState.backgroundColor;
		textColor = initialState.textColor;
		bookingState = initialState.bookingState;
	}
};