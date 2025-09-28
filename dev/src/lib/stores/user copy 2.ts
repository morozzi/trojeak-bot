// lib/stores/user.ts
import { writable, derived } from 'svelte/store';
import type { TelegramUser, FilterState } from '@/lib/types/components.js';
import { appStore } from './app.js';

interface UserState {
	userData: any | null;
	userError: string | null;
	userDataLoaded: boolean;
	userSelectedCity: string | null;
	userSelectedLanguage: string | null;
	userSelectedVenueTypes: string[] | null;
	initData: string;
	selectedLanguage: string;
	selectedCity: string | null;
	isUserDataLoaded: boolean;
	userInfo: TelegramUser | null;
	filterState: FilterState;
}

const initialState: UserState = {
	userData: null,
	userError: null,
	userDataLoaded: false,
	userSelectedCity: null,
	userSelectedLanguage: null,
	userSelectedVenueTypes: null,
	initData: '',
	selectedLanguage: 'en',
	selectedCity: null,
	isUserDataLoaded: false,
	userInfo: null,
	filterState: {
		venueTypes: [],
		brands: [],
		promotion: false,
		haveEvents: false
	}
};

const baseUserStore = writable(initialState);

export const userStore = derived(
	[baseUserStore, appStore],
	([$base, $app]) => {
		const selectedLanguage = $base.userSelectedLanguage || 
			($base.userData?.success && $base.userData.user ? $base.userData.user.language : null) ||
			'en';
			
		const selectedCity = $base.userSelectedCity ||
			($base.userData?.success && $base.userData.user ? 
				($base.userData.user.cityid === 0 ? null : $base.userData.user.cityid.toString()) :
				null);
				
		const selectedVenueTypes = $base.userSelectedVenueTypes ||
			($base.userData?.success && $base.userData.user ? 
				$base.userData.user.venue_types || [] :
				[]);
		
		const selectedCityName = (() => {
			const city = $app.cityData.find(c => c.cityid.toString() === selectedCity);
			return city?.cityname || '';
		})();
		
		const isUserDataLoaded = $base.userDataLoaded;
		const userInfo: TelegramUser | null = $app.webApp?.initDataUnsafe?.user || null;

		let filterState = $base.filterState;
		if ($base.userData?.success && $base.userData.user?.venue_types && filterState.venueTypes.length === 0) {
			const venueTypeSids = $base.userData.user.venue_types.split(',').map(sid => sid.trim()).filter(sid => sid);
			if (venueTypeSids.length > 0) {
				filterState = {
					...filterState,
					venueTypes: venueTypeSids
				};
			}
		}

		return {
			...$base,
			selectedLanguage,
			selectedCity,
			selectedVenueTypes,
			selectedCityName,
			isUserDataLoaded,
			userInfo,
			filterState
		};
	}
);

export const userActions = {
	setUserData: (data: any) => {
		baseUserStore.update(state => ({ ...state, userData: data }));
	},

	setUserError: (error: string | null) => {
		baseUserStore.update(state => ({ ...state, userError: error }));
	},

	setUserDataLoaded: (loaded: boolean) => {
		baseUserStore.update(state => ({ ...state, userDataLoaded: loaded }));
	},

	setPreference: (key: 'city' | 'language', value: string) => {
		baseUserStore.update(state => ({
			...state,
			[key === 'city' ? 'userSelectedCity' : 'userSelectedLanguage']: value
		}));
	},

	setInitData: (data: string) => {
		baseUserStore.update(state => ({ ...state, initData: data }));
	},

	setFilter: (filterState: FilterState) => {
		baseUserStore.update(state => ({ ...state, filterState }));
	},

	addVenueType: (venueType: string) => {
		baseUserStore.update(state => ({
			...state,
			filterState: {
				...state.filterState,
				venueTypes: [...state.filterState.venueTypes, venueType]
			}
		}));
	},

	removeVenueType: (venueType: string) => {
		baseUserStore.update(state => ({
			...state,
			filterState: {
				...state.filterState,
				venueTypes: state.filterState.venueTypes.filter(vt => vt !== venueType)
			}
		}));
	},

	addBrand: (brand: string) => {
		baseUserStore.update(state => ({
			...state,
			filterState: {
				...state.filterState,
				brands: [...state.filterState.brands, brand]
			}
		}));
	},

	removeBrand: (brand: string) => {
		baseUserStore.update(state => ({
			...state,
			filterState: {
				...state.filterState,
				brands: state.filterState.brands.filter(b => b !== brand)
			}
		}));
	},

	resetUser: () => {
		baseUserStore.set(initialState);
	}
};