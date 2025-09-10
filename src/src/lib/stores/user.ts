// lib/stores/user.ts
import { writable, derived } from 'svelte/store';
import type { TelegramUser } from '$lib/types/components.js';

interface UserState {
	userData: any | null;
	userError: string | null;
	userDataLoaded: boolean;
	userSelectedCity: string | null;
	userSelectedLanguage: string | null;
	initData: string;
	selectedLanguage: string;
	selectedCity: string | null;
	isUserDataLoaded: boolean;
	userInfo: TelegramUser | null;
}

const initialState: UserState = {
	userData: null,
	userError: null,
	userDataLoaded: false,
	userSelectedCity: null,
	userSelectedLanguage: null,
	initData: '',
	selectedLanguage: 'en',
	selectedCity: null,
	isUserDataLoaded: false,
	userInfo: null
};

const baseUserStore = writable(initialState);

export const userStore = derived(
	baseUserStore,
	($base) => {
		const selectedLanguage = $base.userSelectedLanguage || 
			($base.userData?.success && $base.userData.user ? $base.userData.user.language : null) ||
			'en';

		const selectedCity = $base.userSelectedCity ||
			($base.userData?.success && $base.userData.user ? 
				($base.userData.user.cityid === 0 ? null : $base.userData.user.cityid.toString()) :
				null);

		const isUserDataLoaded = $base.userDataLoaded;

		const userInfo: TelegramUser | null = $base.userData?.success && $base.userData.user ? {
			id: $base.userData.user.telegram_id,
			first_name: $base.userData.user.firstname || '',
			last_name: $base.userData.user.lastname || '',
			username: $base.userData.user.username || '',
			language_code: $base.userData.user.language || 'en'
		} : null;

		return {
			...$base,
			selectedLanguage,
			selectedCity,
			isUserDataLoaded,
			userInfo
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

	resetUser: () => {
		baseUserStore.set(initialState);
	}
};