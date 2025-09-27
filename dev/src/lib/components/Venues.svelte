<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { AspectRatio } from "@/components/ui/aspect-ratio/index.js";
	import { Badge } from "@/components/ui/badge/index.js";
	import { Button } from "@/components/ui/button";
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
	import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
	import { Star } from '@lucide/svelte';
	import EventList from '@/lib/components/EventList.svelte';
	import Loading from '@/lib/components/Loading.svelte';
	import type { Venue, Event } from '@/lib/types/api.js';
	import type { ViewType } from '@/lib/types/components.js';
	import { userStore } from '@/lib/stores/user.js';
	import { appStore, appActions } from '@/lib/stores/app.js';

	const dispatch = createEventDispatcher<{
		navigate: { view: ViewType };
		filterChange: { type: string; value: string | boolean | null };
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
		}
	});

	const brandsQuery = createQuery({
		queryKey: ['brands'],
		queryFn: async () => {
			const response = await fetch(`/api/brands.php`);
			if (!response.ok) throw new Error('Failed to fetch brands');
			const data = await response.json();
			return data.success ? data.data : [];
		}
	});

	$effect(() => {
		if ($brandsQuery.data) {
			appActions.setBrandsData($brandsQuery.data);
		}
	});

	const venues = $derived(
		($venuesQuery.data || []).filter((venue: Venue) => {
			if ($appStore.filterState.venueTypes.length > 0 && !$appStore.filterState.venueTypes.includes(venue.venuetype)) return false;
			if ($appStore.filterState.haveEvents) {
				const venueData = getVenueEvents(venue.venueid, true);
				if (venueData.count === 0) return false;
			}
			return true;
		})
	);

	const getVenueEvents = $derived((venueId: number, returnCount: boolean = false) => {
		const events = $eventsQuery.data || [];
		
		const venueEvents = events.filter(event => event.venueid === venueId);
		
		if (returnCount) {
			const count = venueEvents.length;
			let nextEventDate = null;
			
			if (count > 0) {
				const nextEvent = venueEvents.reduce((earliest, current) => 
        	new Date(current.eventdate) < new Date(earliest.eventdate) ? current : earliest
    		);
    		nextEventDate = new Date(nextEvent.eventdate).toLocaleDateString('en-US', { 
        	year: 'numeric', month: 'long', day: 'numeric' 
    		});
			}
			
			return { count, nextEventDate };
		}
		
		return venueEvents;
	});
	
	function goToVenue(venueId: string): void {
    dispatch('navigate', { view: 'venues-detail', venueId });
	}
	
	function goToEvent(eventId: string): void {
    dispatch('navigate', { view: 'events-detail', eventId });
	}
</script>

<div class="space-y-8">
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<h1 class="text-4xl font-bold text-center">Venues</h1>
		</div>
		
		<div class="grid gap-8">
			{#if $venuesQuery.isLoading}
				<Loading variant="list" />
			{:else if $venuesQuery.error}
				<Card>
					<CardContent class="p-4">
						<p class="text-destructive">Failed to load venues. Please try again.</p>
					</CardContent>
				</Card>
			{:else if venues.length === 0}
				<Card>
					<CardContent class="p-4">
						<p class="text-muted-foreground">No venues available for this location.</p>
					</CardContent>
				</Card>
			{:else}
				{#each venues as venue}
					<Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => goToVenue(venue.venueid.toString())}>
						<CardHeader class="gap-0 pb-4">
							<div class="flex justify-between items-center">
								<div class="flex items-center gap-4">
									<Avatar class="w-16 h-16 rounded-lg">
										{#if venue.venuepic1}
											<AvatarImage src="/pic/venue/{venue.venuepic1}" alt={venue.venuename} class="rounded-lg" />
										{/if}
										<AvatarFallback class="rounded-lg bg-muted">{venue.venuename.charAt(0)}</AvatarFallback>
									</Avatar>
									<div class="space-y-1">
										<CardTitle class="text-xl font-semibold">{venue.venuename}</CardTitle>
										<div class="flex gap-2">
											<Badge variant="secondary">
												{#if venue.venuetypeicon}{venue.venuetypeicon} {/if}{venue.venuetypename.toUpperCase()}
											</Badge>
											{#if venue.venuefeatured}
												<Badge><Star /> Featured</Badge>
											{/if}
										</div>
									</div>
								</div>
							</div>
						</CardHeader>
						
						{#if venue.venuepic2 && venue.venuefeatured}
							<CardContent class="px-0">
								<AspectRatio ratio={16/9}>
									<img src="/pic/venue/{venue.venuepic2}" alt="{venue.venuename}" class="w-full h-full object-cover" />
								</AspectRatio>
							</CardContent>
						{/if}

						<CardFooter class="p-4 px-6">
							{#if $eventsQuery.isSuccess}
								{@const venueData = getVenueEvents(venue.venueid, true)}
								
								<p class="text-md text-muted-foreground">
									{#if venueData.count === 0}
										No upcoming events
									{:else}
										{venueData.count} {venueData.count === 1 ? 'event' : 'events'} → {venueData.count > 1 ? 'next ' : ''}{venueData.nextEventDate}
									{/if}
								</p>
							{/if}
						</CardFooter>
					</Card>
				{/each}
			{/if}
		</div>
	{:else if viewMode === 'detail' && selectedVenueId}
		{@const selectedVenue = venues.find(v => v.venueid.toString() === selectedVenueId)}
		{#if $venuesQuery.isLoading || $eventsQuery.isLoading || $brandsQuery.isLoading}
			<Loading variant="detail" />
		{:else if selectedVenue}
			{@const venueEvents = getVenueEvents(selectedVenue.venueid)}
			<div class="space-y-8">
				{#if selectedVenue.venuepic2 && selectedVenue.venuefeatured}
					<AspectRatio class="pb-2" ratio={16/9}>
						<img src="/pic/venue/{selectedVenue.venuepic2}" alt="{selectedVenue.venuename}" class="w-full h-full object-cover" />
					</AspectRatio>
				{/if}
				
				<Card>
					<CardHeader class="gap-0">
						<div class="flex items-center gap-6">
							<Avatar class="w-32 h-32 rounded-lg">
								{#if selectedVenue.venuepic1}
									<AvatarImage src="/pic/venue/{selectedVenue.venuepic1}" alt={selectedVenue.venuename} class="rounded-lg" />
								{/if}
								<AvatarFallback class="rounded-lg bg-muted text-lg">{selectedVenue.venuename.charAt(0)}</AvatarFallback>
							</Avatar>
							<div class="space-y-1">
								<CardTitle class="text-3xl font-bold">{selectedVenue.venuename}</CardTitle>
								<div class="flex gap-2">
									<Badge variant="secondary">
										{#if selectedVenue.venuetypeicon}{selectedVenue.venuetypeicon} {/if}{selectedVenue.venuetypename.toUpperCase()}
									</Badge>
									{#if selectedVenue.venuefeatured}
										<Badge><Star /> Featured</Badge>
									{/if}
								</div>
								<p class="pt-3 text-md text-muted-foreground">
									{#if venueEvents.length === 0}
										No upcoming events
									{:else}
										{venueEvents.length} upcoming {venueEvents.length === 1 ? 'event' : 'events'}
									{/if}
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent class="pt-3 px-6 space-y-4">						
						<div class="flex gap-2 items-center">
							{#if selectedVenue.citypic}
								<Avatar class="w-8 h-8 rounded-lg">
									<AvatarImage src="/pic/city/{selectedVenue.citypic}" alt={selectedVenue.cityname} class="rounded-lg" />
									<AvatarFallback class="rounded-lg bg-muted" />
								</Avatar>
							{/if}
							<span class="text-sm">{selectedVenue.cityname}</span>
						</div>
						{#if selectedVenue.venuelink}
							<div class="text-sm">
								<a href="{selectedVenue.venuelink}" target="_blank" rel="noopener noreferrer" onclick={(e) => e.stopPropagation()}>🔗 Google Maps</a>
							</div>
						{/if}
					</CardContent>
				</Card>

				{#if venueEvents.length > 0}
					<h3 class="text-3xl font-semibold mt-10 mb-4 text-center">Upcoming Events</h3>
					<EventList 
						events={venueEvents} 
						brandData={$appStore.brandsData}
						onEventClick={goToEvent} 
					/>
				{:else}
					<div class="text-center pt-4">
						<Button variant="default" size="lg" class="text-md bg-primary text-primary-foreground hover:bg-primary/90">
							Notify me about events
						</Button>
					</div>
				{/if}
			</div>
		{:else}
			<Card>
				<CardContent class="p-4">
					<p class="text-muted-foreground">Venue not found.</p>
				</CardContent>
			</Card>
		{/if}
	{/if}
</div>