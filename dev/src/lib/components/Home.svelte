<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import EventList from '$lib/components/EventList.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import type { Event } from '$lib/types/api.js';
	import type { ViewType } from '$lib/types/components.js';
	import { userStore } from '$lib/stores/user.js';

	let footerEl: HTMLElement | undefined = $state();

	const dispatch = createEventDispatcher<{
		goToEvent: { eventId: string };
		navigate: { view: string };
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

	function handleNavigate(page: string): void {
		dispatch('navigate', { view: `${page}-list` as ViewType });
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
		<Loading variant="list" />
	{:else if $featuredEventsQuery.error}
		<Card.Card>
			<Card.CardContent class="p-4">
				<p class="text-destructive">Failed to load featured events. Please try again.</p>
			</Card.CardContent>
		</Card.Card>
	{:else if ($featuredEventsQuery.data || []).length > 0}
		<EventList 
			events={$featuredEventsQuery.data || []} 
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
		<div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8">
			<div class="flex items-center justify-start"></div>
			<div class="flex items-center justify-center gap-4">
				<Button.Button variant="outline" size="sm" onclick={() => handleNavigate('events-list')}>
					Events
				</Button.Button>
				<Button.Button variant="outline" size="sm" onclick={() => handleNavigate('venues-list')}>
					Venues
				</Button.Button>
				<Button.Button variant="outline" size="sm" onclick={() => handleNavigate('brands-list')}>
					Brands
				</Button.Button>
			</div>
			<div class="flex items-center justify-end"></div>
		</div>
	</div>
</nav>