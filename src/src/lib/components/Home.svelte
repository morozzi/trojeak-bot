<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import * as Button from '$lib/components/ui/button/index.js';
	import EventList from '$lib/components/EventList.svelte';
	import type { Event } from '$lib/types/api.js';
	import { brandData, venueData } from '$lib/data/mockData.js';

	interface Props {
		featuredEvents: Event[];
		selectedCity: string;
		selectedLanguage: string;
		userInfo: any;
	}

	const { featuredEvents, selectedCity, selectedLanguage, userInfo }: Props = $props();

	let footerEl: HTMLElement | undefined = $state();

	const dispatch = createEventDispatcher<{
		eventClick: { eventId: string };
		navigate: { page: string };
		footerHeight: { height: number };
	}>();

	function handleEventClick(eventId: string) {
		dispatch('eventClick', { eventId });
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

	{#if featuredEvents.length > 0}
		<EventList 
			events={featuredEvents} 
			{venueData} 
			{brandData} 
			onEventClick={handleEventClick} 
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