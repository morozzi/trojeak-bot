<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { Separator } from "@/components/ui/separator/index.js";
	import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
	import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
	import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
	import { Button } from "@/components/ui/button";
	import { Share2, HousePlus } from '@lucide/svelte';
	import { userStore } from '@/lib/stores/user.js';
	import { appActions } from '@/lib/stores/app.js';

	const dispatch = createEventDispatcher<{
		cityChange: { city: string };
		languageChange: { language: string };
		shareToStory: void;
		accountAction: { action: string };
	}>();
	
	let homeScreenStatus = $state(null);
	const shouldShowAddToHome = $derived(homeScreenStatus === 'unknown' || homeScreenStatus === 'missed');

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

	$effect(() => {
		if ($commonQuery.isSuccess && $commonQuery.data?.cities) {
			appActions.setCityData($commonQuery.data.cities);
		}
	});
	
	$effect(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp?.checkHomeScreenStatus) {
			window.Telegram.WebApp.checkHomeScreenStatus((status) => homeScreenStatus = status);
		}
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
	
	function handleAddToHome() {
		window.Telegram?.WebApp?.addToHomeScreen?.();
	}
</script>

<header class="mx-auto w-full max-w-2xl px-4 pt-4 pb-4">
	<div class="grid grid-cols-[1fr_auto_1fr] items-center pb-4">
		<div class="flex items-center gap-5 justify-start">
			<DropdownMenu>
				<DropdownMenuTrigger>
					{#snippet child({ props })}
						<Avatar {...props} class="cursor-pointer hover:opacity-80 transition-opacity">
							{#if $userStore.userInfo?.photo_url}
								<AvatarImage src={$userStore.userInfo.photo_url} alt="User" />
							{/if}
							<AvatarFallback>{userInitials()}</AvatarFallback>
						</Avatar>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent class="w-56 z-[60]" align="start">
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onclick={() => handleAccountAction('settings')}>
						⚙️ Account Settings
					</DropdownMenuItem>
					<DropdownMenuItem onclick={() => handleAccountAction('channel')}>
						📢 Channel Subscription
					</DropdownMenuItem>
					<DropdownMenuItem onclick={() => handleAccountAction('bookings')}>
						📋 My Bookings
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onclick={() => handleAccountAction('support')}>
						💬 Support
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<Select type="single" value={$userStore.selectedCity} onValueChange={handleCityChange}>
				<SelectTrigger class="w-24 flex gap-1" disabled={$commonQuery.isLoading}>
    			{#if $commonQuery.isLoading}
        		...
    			{:else}
        		{#if currentCityIcon()}
            	<Avatar class="w-4 h-4 rounded">
                <AvatarImage src="/pic/city/{currentCityIcon()}" alt="City" class="rounded" />
                <AvatarFallback class="rounded bg-muted" />
            	</Avatar>
        		{/if}
        		{currentCitySid()}
    			{/if}
				</SelectTrigger>
				<SelectContent>
					{#each $commonQuery.data?.cities || [] as city}
						<SelectItem value={city.cityid.toString()}>{city.cityname}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
			{#if shouldShowAddToHome}
				<Button variant="ghost" size="sm" onclick={handleAddToHome}>
					<HousePlus size={16} />
				</Button>
			{/if}
		</div>
		<div class="flex items-center justify-center">
		</div>
		<div class="flex items-center gap-2 justify-end">
			<Select type="single" value={$userStore.selectedLanguage} onValueChange={handleLanguageChange}>
				<SelectTrigger class="w-16" disabled={$commonQuery.isLoading}>
					{#if $commonQuery.isLoading}
						...
					{:else}
						{$commonQuery.data?.languages?.find(l => l.languagesid === $userStore.selectedLanguage)?.languageflag || '🇺🇸'}
					{/if}
				</SelectTrigger>
				<SelectContent>
					{#each $commonQuery.data?.languages || [] as lang}
						<SelectItem value={lang.languagesid}>
							{lang.languageflag} {lang.languagename}
						</SelectItem>
					{/each}
				</SelectContent>
			</Select>
			<Button variant="ghost" size="sm" onclick={handleShareToStory}>
				<Share2 size={16} />
			</Button>
		</div>
	</div>
	<Separator class="mb-4" />
</header>