<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import * as AspectRatio from '$lib/components/ui/aspect-ratio/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';
	import { createEventDispatcher } from 'svelte';
	import type { Venue } from '$lib/types/api.js';
	import { venueData } from '$lib/data/mockData.js';

	let footerEl: HTMLElement | undefined = $state();

	const dispatch = createEventDispatcher<{
		goBack: void;
		goToEvent: { eventId: string };
		footerHeight: { height: number };
	}>();

	let viewMode: 'list' | 'detail' = $state('list');
	let selectedVenueId: string | null = $state(null);

	const venues = venueData.sort((a, b) => Number(b.venuefeatured) - Number(a.venuefeatured));

	function selectVenue(venueId: string): void {
		selectedVenueId = venueId;
		viewMode = 'detail';
		window.scrollTo(0, 0);
	}

	function goToList(): void {
		viewMode = 'list';
		selectedVenueId = null;
		window.scrollTo(0, 0);
	}

	function goBack(): void {
		dispatch('goBack');
	}

	function goToEvent(eventId: string): void {
		dispatch('goToEvent', { eventId });
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
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<h1 class="text-3xl font-bold">Venues</h1>
		</div>
		
		<div class="grid gap-4">
			{#if venues.length === 0}
				<Card.Card>
					<Skeleton.Skeleton class="h-16 w-full" />
					<Card.CardContent class="p-4 space-y-2">
						<Skeleton.Skeleton class="h-4 w-full" />
						<Skeleton.Skeleton class="h-4 w-3/4" />
						<Skeleton.Skeleton class="h-4 w-1/2" />
					</Card.CardContent>
				</Card.Card>
			{:else}
				{#each venues as venue}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectVenue(venue.venueid.toString())}>
						<Card.CardHeader class="gap-0 pb-4">
							<div class="flex justify-between items-center">
								<div class="flex items-center gap-2">
									<Card.CardTitle class="text-lg font-semibold">{venue.venuename}</Card.CardTitle>
									<Badge.Badge variant="secondary">{venue.venuetype.toUpperCase()}</Badge.Badge>
								</div>
								<div class="flex gap-2">
									{#if venue.venuefeatured}
										<Badge.Badge>Featured</Badge.Badge>
									{/if}
								</div>
							</div>
						</Card.CardHeader>
						
						{#if venue.venuefeatured}
							<AspectRatio.Root class="pb-2" ratio={16/9}>
								<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
									Featured Venue Banner
								</div>
							</AspectRatio.Root>
						{/if}

						<Card.CardContent class="p-4 pb-4 space-y-4">
							<div class="text-sm text-muted-foreground">
								📍 <a href={venue.venuelink} target="_blank" rel="noopener noreferrer" class="hover:underline">View Location</a>
							</div>

							<div class="text-sm text-muted-foreground">
								🏙️ City ID: {venue.cityid}
							</div>

							<div class="text-sm">
								🏢 {venue.venuetype.toUpperCase()}
							</div>
						</Card.CardContent>
					</Card.Card>
				{/each}
			{/if}
		</div>
	{:else if viewMode === 'detail' && selectedVenueId}
		{@const selectedVenue = venues.find(v => v.venueid.toString() === selectedVenueId)}
		{#if selectedVenue}
			<div class="space-y-8">
				{#if selectedVenue.venuefeatured}
					<AspectRatio.Root class="pb-2" ratio={16/9}>
						<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
							Featured Venue Banner
						</div>
					</AspectRatio.Root>
				{/if}

				<Card.Card>
					<Card.CardHeader>
						<h1 class="text-3xl font-bold">{selectedVenue.venuename}</h1>
						<div class="flex gap-2">
							<Badge.Badge variant="secondary">{selectedVenue.venuetype.toUpperCase()}</Badge.Badge>
							{#if selectedVenue.venuefeatured}
								<Badge.Badge>Featured</Badge.Badge>
							{/if}
						</div>
					</Card.CardHeader>
					<Card.CardContent class="p-6 space-y-4">
						<div class="space-y-2">
							<p class="text-sm text-muted-foreground">📍 <a href={selectedVenue.venuelink} target="_blank" rel="noopener noreferrer" class="hover:underline">View Location</a></p>
							<p class="text-sm text-muted-foreground">🏙️ City ID: {selectedVenue.cityid}</p>
						</div>
					</Card.CardContent>
				</Card.Card>

				<h3 class="text-lg font-semibold mb-4">Upcoming Events</h3>
				{#if selectedVenue.venuefeatured}
					{@const upcomingEvent = { id: 'evt_001', title: 'Friday Night Live', featured: true }}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => goToEvent(upcomingEvent.id)}>
						<Card.CardHeader class="gap-0 pb-4">
							<div class="flex justify-between items-center">
								<Card.CardTitle class="text-lg font-semibold">{upcomingEvent.title}</Card.CardTitle>
								{#if upcomingEvent.featured}
									<Badge.Badge>Featured</Badge.Badge>
								{/if}
							</div>
						</Card.CardHeader>
						
						<AspectRatio.Root class="pb-2" ratio={16/9}>
							<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
								Featured Event Banner
							</div>
						</AspectRatio.Root>

						<Card.CardContent class="p-4 pb-4 space-y-4">
							<div class="text-sm text-muted-foreground">
								📅 August 24, 2025 • 📍 City ID: {selectedVenue.cityid}
							</div>

							<div class="text-sm">
								🏢 {selectedVenue.venuename}
							</div>

							<div class="text-sm">🎵 Artist Name</div>

							<div class="flex gap-2 items-center">
								<span class="text-sm text-muted-foreground mr-2">💰 12+2 Schema</span>
								<Avatar.Root class="w-8 h-8 rounded-lg">
									<Avatar.Fallback class="rounded-lg bg-muted" />
								</Avatar.Root>
								<Avatar.Root class="w-8 h-8 rounded-lg">
									<Avatar.Fallback class="rounded-lg bg-muted" />
								</Avatar.Root>
								<Avatar.Root class="w-8 h-8 rounded-lg">
									<Avatar.Fallback class="rounded-lg bg-muted" />
								</Avatar.Root>
							</div>
						</Card.CardContent>
					</Card.Card>
				{:else}
					<p class="text-muted-foreground">No upcoming events.</p>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<nav bind:this={footerEl} class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50">
	<div class="mx-auto w-full max-w-2xl px-4">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8">
			<div class="flex items-center justify-start">
				{#if viewMode === 'list'}
					<Button.Button variant="outline" size="sm" onclick={goBack}>
						← Back to Main
					</Button.Button>
				{:else}
					<Button.Button variant="outline" size="sm" onclick={goToList}>
						← Back to Venues
					</Button.Button>
				{/if}
			</div>
			<div class="flex items-center justify-center"></div>
			<div class="flex items-center justify-end"></div>
		</div>
	</div>
</nav>