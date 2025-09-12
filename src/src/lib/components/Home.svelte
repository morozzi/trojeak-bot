<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import EventList from '$lib/components/EventList.svelte';
	import type { Event } from '$lib/types/api.js';
	import { userStore } from '$lib/stores/user.js';

	let footerEl: HTMLElement | undefined = $state();

	const dispatch = createEventDispatcher<{
		goToEvent: { eventId: string };
		navigate: { page: string };
		footerHeight: { height: number };
	}>();

	const featuredEventsQuery = createQuery({
		queryKey: ['events', $userStore.selectedLanguage, $userStore.selectedCity, 'featured'],
		queryFn: async () => {
			const response = await fetch(`/api/events.php?lang=${$userStore.selectedLanguage}&city=${$userStore.selectedCity}&featured=1`);
			if (!response.ok) throw new Error('Failed to fetch featured events');
			return response.json();
		}
	});

	const venuesQuery = createQuery({
		queryKey: ['venues', $userStore.selectedLanguage, $userStore.selectedCity],
		queryFn: async () => {
			const response = await fetch(`/api/venues.php?lang=${$userStore.selectedLanguage}&city=${$userStore.selectedCity}`);
			if (!response.ok) throw new Error('Failed to fetch venues');
			return response.json();
		},
		enabled: () => ($featuredEventsQuery.data || []).length > 0
	});

	const brandsQuery = createQuery({
		queryKey: ['brands'],
		queryFn: async () => {
			const response = await fetch(`/api/brands.php`);
			if (!response.ok) throw new Error('Failed to fetch brands');
			return response.json();
		},
		enabled: () => ($featuredEventsQuery.data || []).length > 0
	});

	function goToEvent(eventId: string) {
		dispatch('goToEvent', { eventId });
	}

	function handleNavigate(page: string) {
		dispatch('navigate', { page });
	}

	function updateFooterHeight() {
		if (!footerEl) return;
		const height = footerEl.offsetHeight;
		dispatch('footerHeight', { height });
	}

	$effect(() => {
		if (footerEl) {
			updateFooterHeight();
			const ro = new ResizeObserver(updateFooterHeight);
			ro.observe(footerEl);
			return () => ro.disconnect();
		}
	});
</script>

<div class="space-y-8">
	<div class="text-center space-y-4">
		<h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
			Let's Trojeak
		</h1>
		<p class="text-lg text-muted-foreground">🇰🇭 Cambodia #1 event app</p>
	</div>

	{#if $featuredEventsQuery.isLoading}
		<Card.Card class="py-4 pb-0 overflow-hidden">
    	<Card.CardHeader class="pb-4">
      	<div class="flex justify-between items-center">
        	<Skeleton class="h-6 w-40" />
        	<Skeleton class="h-6 w-16 rounded-full" />
      	</div>
    	</Card.CardHeader>
    	<Skeleton class="h-48 w-full" />
    	<Card.CardContent class="p-4 space-y-4">
      	<Skeleton class="h-4 w-40" />
      	<Skeleton class="h-4 w-40" />
      	<Skeleton class="h-4 w-40" />
      	<div class="flex gap-2">
        	<Skeleton class="w-8 h-8 rounded-lg" />
        	<Skeleton class="w-8 h-8 rounded-lg" />
        	<Skeleton class="w-8 h-8 rounded-lg" />
      	</div>
    	</Card.CardContent>
  	</Card.Card>
	{:else if ($featuredEventsQuery.data || []).length > 0}
		<EventList 
			events={$featuredEventsQuery.data || []} 
			venueData={$venuesQuery.data || []}
			brandData={$brandsQuery.data || []}
			onEventClick={goToEvent} 
		/>
	{:else}
		<div class="text-center py-8 space-y-4">
			<p class="text-muted-foreground">No featured events available right now</p>
			<Button.Button variant="outline" onclick={() => handleNavigate('events')}>
				Browse All Events
			</Button.Button>
		</div>
	{/if}
</div>

<nav bind:this={footerEl} class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50">
	<div class="mx-auto w-full max-w-2xl px-4">
		<div class="grid grid-cols-3 gap-4 pt-4 pb-8">
			<Button.Button variant="outline" size="sm" onclick={() => handleNavigate('events')}>
				Events
			</Button.Button>
			<Button.Button variant="outline" size="sm" onclick={() => handleNavigate('venues')}>
				Venues
			</Button.Button>
			<Button.Button variant="outline" size="sm" onclick={() => handleNavigate('brands')}>
				Brands
			</Button.Button>
		</div>
	</div>
</nav>