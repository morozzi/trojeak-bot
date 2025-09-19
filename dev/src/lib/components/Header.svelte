<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import { Share2 } from '@lucide/svelte';
	import { userStore } from '$lib/stores/user.js';

	const dispatch = createEventDispatcher<{
		cityChange: { city: string };
		languageChange: { language: string };
		shareToStory: void;
		accountAction: { action: string };
	}>();

	const commonQuery = createQuery({
		queryKey: ['common', $userStore.selectedLanguage],
		queryFn: async () => {
			const response = await fetch(`/api/common.php?lang=${$userStore.selectedLanguage}`);
			if (!response.ok) throw new Error('Failed to fetch common data');
			return response.json();
		}
	});
	
	const currentCity = $derived(() => 
    $commonQuery.data?.cities?.find(c => c.cityid.toString() === $userStore.selectedCity)
	);
	
	const currentCitySid = $derived(() => currentCity()?.citysid?.toUpperCase() || "...");
	const currentCityIcon = $derived(() => currentCity()?.citypic || null);

	const userInitials = $derived(() => 
    !$userStore.userInfo?.first_name ? '?' : 
    $userStore.userInfo.first_name.charAt(0).toUpperCase() + ($userStore.userInfo.last_name?.charAt(0)?.toUpperCase() || '')
	);

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
							{#if $userStore.userInfo?.photo_url}
								<Avatar.Image src={$userStore.userInfo.photo_url} alt="User" />
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
			<Select.Root type="single" value={$userStore.selectedCity} onValueChange={handleCityChange}>
				<Select.Trigger class="w-24 flex items-center gap-1" disabled={$commonQuery.isLoading}>
    			{#if $commonQuery.isLoading}
        		...
    			{:else}
        		{#if currentCityIcon()}
            	<Avatar.Root class="w-4 h-4">
                <Avatar.Image src="/pic/city/{currentCityIcon()}" alt="City" />
                <Avatar.Fallback class="rounded-lg bg-muted" />
            	</Avatar.Root>
        		{/if}
        		{currentCitySid()}
    			{/if}
				</Select.Trigger>
				<Select.Content>
					{#each $commonQuery.data?.cities || [] as city}
						<Select.Item value={city.cityid.toString()}>{city.cityname}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex items-center justify-center">
		</div>
		<div class="flex items-center gap-2 justify-end">
			<Select.Root type="single" value={$userStore.selectedLanguage} onValueChange={handleLanguageChange}>
				<Select.Trigger class="w-16" disabled={$commonQuery.isLoading}>
					{#if $commonQuery.isLoading}
						...
					{:else}
						{$commonQuery.data?.languages?.find(l => l.languagesid === $userStore.selectedLanguage)?.languageflag || '🇺🇸'}
					{/if}
				</Select.Trigger>
				<Select.Content>
					{#each $commonQuery.data?.languages || [] as lang}
						<Select.Item value={lang.languagesid}>
							{lang.languageflag} {lang.languagename}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Button.Button variant="ghost" size="sm" onclick={handleShareToStory}>
				<Share2 size={16} />
			</Button.Button>
		</div>
	</div>
	<Separator class="mb-6" />
</header>