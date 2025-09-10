// lib/stores/user.ts
import type { TelegramUser } from '$lib/types/components.js';

interface UserState {
	userData: any | null;
	userError: string | null;
	userDataLoaded: boolean;
	userSelectedCity: string | null;
	userSelectedLanguage: string | null;
	initData: string;
}

interface UserActions {
	setUserData: (data: any) => void;
	setUserError: (error: string | null) => void;
	setUserDataLoaded: (loaded: boolean) => void;
	setPreference: (key: 'city' | 'language', value: string) => void;
	setInitData: (data: string) => void;
	resetUser: () => void;
}

const initialState: UserState = {
	userData: null,
	userError: null,
	userDataLoaded: false,
	userSelectedCity: null,
	userSelectedLanguage: null,
	initData: ''
};

let userData = $state<any | null>(initialState.userData);
let userError = $state<string | null>(initialState.userError);
let userDataLoaded = $state<boolean>(initialState.userDataLoaded);
let userSelectedCity = $state<string | null>(initialState.userSelectedCity);
let userSelectedLanguage = $state<string | null>(initialState.userSelectedLanguage);
let initData = $state<string>(initialState.initData);

const selectedLanguage = $derived(
	userSelectedLanguage || 
	(userData?.success && userData.user ? userData.user.language : null) ||
	'en'
);

const selectedCity = $derived(
	userSelectedCity ||
	(userData?.success && userData.user ? 
		(userData.user.cityid === 0 ? null : userData.user.cityid.toString()) :
		null)
);

const isUserDataLoaded = $derived(userDataLoaded);

const userInfo = $derived<TelegramUser | null>(
	userData?.success && userData.user ? {
		id: userData.user.telegram_id,
		first_name: userData.user.firstname || '',
		last_name: userData.user.lastname || '',
		username: userData.user.username || '',
		language_code: userData.user.language || 'en'
	} : null
);

export const userStore = {
	get userData() { return userData; },
	get userError() { return userError; },
	get userDataLoaded() { return userDataLoaded; },
	get userSelectedCity() { return userSelectedCity; },
	get userSelectedLanguage() { return userSelectedLanguage; },
	get initData() { return initData; },
	get selectedLanguage() { return selectedLanguage; },
	get selectedCity() { return selectedCity; },
	get isUserDataLoaded() { return isUserDataLoaded; },
	get userInfo() { return userInfo; },

	setUserData: (data: any) => {
		userData = data;
	},

	setUserError: (error: string | null) => {
		userError = error;
	},

	setUserDataLoaded: (loaded: boolean) => {
		userDataLoaded = loaded;
	},

	setPreference: (key: 'city' | 'language', value: string) => {
		if (key === 'city') {
			userSelectedCity = value;
		} else {
			userSelectedLanguage = value;
		}
	},

	setInitData: (data: string) => {
		initData = data;
	},

	resetUser: () => {
		userData = initialState.userData;
		userError = initialState.userError;
		userDataLoaded = initialState.userDataLoaded;
		userSelectedCity = initialState.userSelectedCity;
		userSelectedLanguage = initialState.userSelectedLanguage;
		initData = initialState.initData;
	}
};