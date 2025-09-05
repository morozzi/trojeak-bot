<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Separator from '$lib/components/ui/separator/index.js';
	import { Share2 } from '@lucide/svelte';

	interface TelegramUser {
		id: number;
		first_name: string;
		last_name?: string;
		username?: string;
		photo_url?: string;
	}

	interface Props {
		userInfo: TelegramUser | null;
		selectedCity: string;
		selectedLanguage: string;
	}

	const { userInfo, selectedCity, selectedLanguage }: Props = $props();

	const dispatch = createEventDispatcher<{
		cityChange: { city: string };
		languageChange: { language: string };
		shareToStory: void;
		accountAction: { action: string };
	}>();

	const userInitials = $derived(() => {
		if (userInfo?.first_name) {
			const firstInitial = userInfo.first_name.charAt(0).toUpperCase();
			const lastInitial = userInfo.last_name?.charAt(0).toUpperCase() || '';
			return firstInitial + lastInitial;
		}
		return '?';
	});

	function handleCityChange(city: string) {
		dispatch('cityChange', { city });
	}

	function handleLanguageChange(language: string) {
		dispatch('languageChange', { language });
	}

	function handleShareToStory() {
		dispatch('shareToStory');
	}

	function handleAccountAction(action: string) {
		dispatch('accountAction', { action });
	}
</script>

<header class="mx-auto w-full max-w-2xl px-4 pt-4 pb-4">
	<div class="grid grid-cols-[1fr_auto_1fr] items-center pb-4">
		<div class="flex items-center gap-5 justify-start">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Avatar.Root {...props} class="cursor-pointer hover:opacity-80 transition-opacity">
							{#if userInfo?.photo_url}
								<Avatar.Image src={userInfo.photo_url} alt="User" />
							{/if}
							<Avatar.Fallback>{userInitials()}</Avatar.Fallback>
						</Avatar.Root>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56 z-[60]" align="start">
					<DropdownMenu.Label>My Account</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => handleAccountAction('settings')}>
						⚙️ Account Settings
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => handleAccountAction('channel')}>
						📢 Channel Subscription
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => handleAccountAction('bookings')}>
						📋 My Bookings
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => handleAccountAction('support')}>
						💬 Support
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<Select.Root type="single" value={selectedCity} onValueChange={handleCityChange}>
				<Select.Trigger class="w-20">
					{selectedCity.toUpperCase()}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="pp">Phnom Penh</Select.Item>
					<Select.Item value="shv">Sihanoukville</Select.Item>
					<Select.Item value="sr">Siem Reap</Select.Item>
					<Select.Item value="btb">Battambang</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex items-center justify-center">
		</div>

		<div class="flex items-center gap-2 justify-end">
			<Select.Root type="single" value={selectedLanguage} onValueChange={handleLanguageChange}>
				<Select.Trigger class="w-16">
					{selectedLanguage === "en" ? "🇺🇸" : "🇰🇭"}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="en">🇺🇸 English</Select.Item>
					<Select.Item value="kh">🇰🇭 ភាសាខ្មែរ</Select.Item>
				</Select.Content>
			</Select.Root>

			<Button.Button variant="ghost" size="sm" onclick={handleShareToStory}>
				<Share2 size={16} />
			</Button.Button>
		</div>
	</div>
	<Separator.Separator class="mb-6" />
</header>