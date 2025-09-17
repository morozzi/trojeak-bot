<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { AspectRatio } from "$lib/components/ui/aspect-ratio/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Star } from '@lucide/svelte';
	import EventList from '$lib/components/EventList.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Venue, Event } from '$lib/types/api.js';
	import { userStore } from '$lib/stores/user.js';
	import { appStore } from '$lib/stores/app.js';

	let footerEl: HTMLElement | undefined = $state();

	const dispatch = createEventDispatcher<{
		navigate: { view: string; venueId?: string };
		goToEvent: { eventId: string };
		footerHeight: { height: number };
	}>();

	const viewMode = $derived($appStore.currentView === 'venues-detail' ? 'detail' : 'list');
	const selectedVenueId = $derived($appStore.selectedVenueId || null);

	const venuesQuery = createQuery({
		queryKey: ['venues', $userStore.selectedLanguage, $userStore.selectedCity],
		queryFn: async () => {
			const response = await fetch(`/api/venues.php?lang=${$userStore.selectedLanguage}&city=${$userStore.selectedCity}`);
			if (!response.ok) throw new Error('Failed to fetch venues');
			return response.json();
		}
	});

	const eventsQuery = createQuery({
		queryKey: ['events', $userStore.selectedLanguage, $userStore.selectedCity],
		queryFn: async () => {
			const response = await fetch(`/api/events.php?lang=${$userStore.selectedLanguage}&city=${$userStore.selectedCity}`);
			if (!response.ok) throw new Error('Failed to fetch events');
			return response.json();
		},
	});

	const brandsQuery = createQuery({
		queryKey: ['brands'],
		queryFn: async () => {
			const response = await fetch(`/api/brands.php`);
			if (!response.ok) throw new Error('Failed to fetch brands');
			return response.json();
		},
		enabled: () => viewMode === 'detail'
	});

	const venues = $derived($venuesQuery.data || []);

	const getVenueEventCount = $derived((venueId: number): number => {
		return ($eventsQuery.data || []).filter(event => event.venueid === venueId).length;
	});

	const getVenueEvents = $derived((venueId: number): Event[] => {
		return ($eventsQuery.data || []).filter(event => event.venueid === venueId)
			.sort((a, b) => {
				if (a.eventfeatured !== b.eventfeatured) 
					return Number(b.eventfeatured) - Number(a.eventfeatured);
				return new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime();
			});
	});

	function selectVenue(venueId: string): void {
		dispatch('navigate', { view: 'venues-detail', venueId });
		window.scrollTo(0, 0);
	}

	function goHome(): void {
		dispatch('navigate', { view: 'home' });
	}

	function goToList(): void {
		dispatch('navigate', { view: 'venues-list' });
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
			<h1 class="text-4xl font-bold text-center">Venues</h1>
		</div>
		
		<div class="grid gap-8">
			{#if $venuesQuery.isLoading}
				<Card.Card class="py-4 pb-0 overflow-hidden">
    			<Card.CardHeader class="pb-4">
      			<div class="flex justify-between items-center">
        			<div class="flex items-center gap-3">
          			<Skeleton class="w-12 h-12 rounded-lg" />
          			<Skeleton class="h-6 w-32" />
        			</div>
        			<Skeleton class="h-6 w-16 rounded-full" />
      			</div>
    			</Card.CardHeader>
    			<Skeleton class="h-48 w-full" />
    			<Card.CardContent class="p-4">
      			<Skeleton class="h-4 w-32" />
    			</Card.CardContent>
  			</Card.Card>
			{:else if $venuesQuery.error}
				<Card.Card>
					<Card.CardContent class="p-4">
						<p class="text-destructive">Failed to load venues. Please try again.</p>
					</Card.CardContent>
				</Card.Card>
			{:else if venues.length === 0}
				<Card.Card>
					<Card.CardContent class="p-4">
						<p class="text-muted-foreground">No venues available for this location.</p>
					</Card.CardContent>
				</Card.Card>
			{:else}
				{#each venues as venue}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectVenue(venue.venueid.toString())}>
						<Card.CardHeader class="gap-0 pb-4">
							<div class="flex justify-between items-center">
								<div class="flex items-center gap-4">
									<Avatar.Root class="w-16 h-16 rounded-lg">
										<Avatar.Image src="/pic/venue/{venue.venuepic1}" alt={venue.venuename} class="rounded-lg" />
										<Avatar.Fallback class="rounded-lg bg-muted">{venue.venuename.charAt(0)}</Avatar.Fallback>
									</Avatar.Root>
									<div class="space-y-1">
										<Card.CardTitle class="text-xl font-semibold">{venue.venuename}</Card.CardTitle>
										<div class="flex gap-2">
											<Badge variant="secondary">{venue.venuetype.toUpperCase()}</Badge>
											{#if venue.venuefeatured}
												<Badge><Star /> Featured</Badge>
											{/if}
										</div>
									</div>
								</div>
							</div>
						</Card.CardHeader>
						
						{#if venue.venuefeatured}
							<AspectRatio ratio={16/9}>
								<img src="/pic/venue/{venue.venuepic2}" alt="{venue.venuename}" class="w-full h-full object-cover" />
							</AspectRatio>
						{/if}

						<Card.CardContent class="p-4 px-6 pb-4 space-y-4">
							<p class="text-md text-muted-foreground">{getVenueEventCount(venue.venueid)} upcoming events</p>
						</Card.CardContent>
					</Card.Card>
				{/each}
			{/if}
		</div>
	{:else if viewMode === 'detail' && selectedVenueId}
		{@const selectedVenue = venues.find(v => v.venueid.toString() === selectedVenueId)}
		{#if selectedVenue}
			{@const venueEvents = getVenueEvents(selectedVenue.venueid)}
			<div class="space-y-8">
				{#if selectedVenue.venuefeatured}
					<AspectRatio class="pb-2" ratio={16/9}>
						<img src="/pic/venue/{selectedVenue.venuepic2}" alt="{selectedVenue.venuename} Banner" class="w-full h-full object-cover" />
					</AspectRatio>
				{/if}
				
				<Card.Card>
					<Card.CardHeader class="gap-0">
						<div class="flex items-center gap-6">
							<Avatar.Root class="w-32 h-32 rounded-lg">
								<Avatar.Image src="/pic/venue/{selectedVenue.venuepic1}" alt={selectedVenue.venuename} class="rounded-lg" />
								<Avatar.Fallback class="rounded-lg bg-muted text-lg">{selectedVenue.venuename.charAt(0)}</Avatar.Fallback>
							</Avatar.Root>
							<div class="space-y-1">
								<Card.CardTitle class="text-3xl font-bold">{selectedVenue.venuename}</Card.CardTitle>
								<div class="flex gap-2">
									<Badge variant="secondary">{selectedVenue.venuetype.toUpperCase()}</Badge>
									{#if selectedVenue.venuefeatured}
										<Badge><Star /> Featured</Badge>
									{/if}
								</div>
								<p class="pt-3 text-md text-muted-foreground">{venueEvents.length} upcoming events</p>
							</div>
						</div>
					</Card.CardHeader>
					<Card.CardContent class="pt-3 px-6">
						<div class="text-sm text-muted-foreground">
							📍 <a href={selectedVenue.venuelink} target="_blank" rel="noopener noreferrer" class="hover:underline">{selectedVenue.cityname}</a>
						</div>
					</Card.CardContent>
				</Card.Card>

				<h3 class="text-3xl font-semibold mt-10 mb-4 text-center">Upcoming Events</h3>
				{#if venueEvents.length > 0}
					<EventList 
						events={venueEvents} 
						venueData={$venuesQuery.data || []}
						brandData={$brandsQuery.data || []}
						onEventClick={goToEvent} 
					/>
				{:else}
					<div class="text-center py-6">
						<Button.Button variant="default" size="lg" class="bg-primary text-primary-foreground hover:bg-primary/90">
							Notify me
						</Button.Button>
					</div>
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
					<Button.Button variant="outline" size="sm" onclick={goHome}>
						Home
					</Button.Button>
				{:else}
					<Button.Button variant="outline" size="sm" onclick={goToList}>
						← Back
					</Button.Button>
				{/if}
			</div>
			<div class="flex items-center justify-center"></div>
			<div class="flex items-center justify-end"></div>
		</div>
	</div>
</nav>