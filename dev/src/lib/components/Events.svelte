<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { AspectRatio } from "$lib/components/ui/aspect-ratio/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Star } from '@lucide/svelte';
	import EventList from '$lib/components/EventList.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Event } from '$lib/types/api.js';
	import type { ViewType } from '$lib/types/components.js';
	import { userStore } from '$lib/stores/user.js';
	import { appStore } from '$lib/stores/app.js';

	const dispatch = createEventDispatcher<{
		startBooking: { event: Event };
		navigate: { view: ViewType };
	}>();

	const viewMode = $derived($appStore.currentView === 'events-detail' ? 'detail' : 'list');
	const selectedEventId = $derived($appStore.selectedEventId);

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
			return response.json();
		}
	});

	const events = $derived($eventsQuery.data || []);

	function goToEvent(eventId: string): void {
    dispatch('navigate', { view: 'events-detail', eventId });
    window.scrollTo(0, 0);
	}

	function startBooking(event: Event): void {
		dispatch('startBooking', { event });
	}
</script>

<div class="space-y-8">
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<h1 class="text-4xl font-bold text-center">Events</h1>
		</div>
		
		<div class="grid gap-8">
			{#if $eventsQuery.isLoading}
				<Loading variant="list" />
			{:else if $eventsQuery.error}
				<Card.Card>
					<Card.CardContent class="p-4">
						<p class="text-destructive">Failed to load events. Please try again.</p>
					</Card.CardContent>
				</Card.Card>
			{:else if events.length === 0}
				<Card.Card>
					<Card.CardContent class="p-4">
						<p class="text-muted-foreground">No events available for this location.</p>
					</Card.CardContent>
				</Card.Card>
			{:else}
				<EventList 
					events={events} 
					brandData={$brandsQuery.data || []}
					onEventClick={goToEvent} 
				/>
			{/if}
		</div>
	{:else if viewMode === 'detail' && selectedEventId}
		{@const selectedEvent = events.find(e => e.eventid.toString() === selectedEventId)}
		{#if $eventsQuery.isLoading || $brandsQuery.isLoading}
			<Loading variant="detail" />
		{:else if selectedEvent}
			{@const eventBrandIds = selectedEvent.brandid.split(',').map(id => id.replace(/\^/g, ''))}
			{@const eventBrands = $brandsQuery.data?.filter(b => eventBrandIds.includes(b.brandid.toString())) || []}
			<div class="space-y-8">
				{#if selectedEvent.eventpic}
					<AspectRatio class="pb-2" ratio={4/5}>
						<img src="/pic/event/{selectedEvent.eventpic}" alt="{selectedEvent.eventtitle}" class="w-full h-full object-cover" />
					</AspectRatio>
				{/if}

				<Card.Card>
					<Card.CardHeader class="pb-2">
						<div class="space-y-2">
							<Card.CardTitle class="text-3xl font-bold">{selectedEvent.eventtitle}</Card.CardTitle>
							<div class="flex gap-2">
								{#if selectedEvent.eventfeatured}
									<Badge><Star /> Featured</Badge>
								{/if}
							</div>
						</div>
					</Card.CardHeader>
					<Card.CardContent class="p-6 py-0 space-y-4">
						<div class="text-sm text-muted-foreground">
							📅 {new Date(selectedEvent.eventdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
						</div>
							
						<div class="text-sm">
							📍 {selectedEvent.venuename} <a href="{selectedEvent.venuelink}" target="_blank" rel="noopener noreferrer" onclick={(e) => e.stopPropagation()}>(Google Maps 🔗)</a>
						</div>

						<div class="text-sm">
							🎵 {selectedEvent.eventartist}
						</div>

						<div class="flex gap-2 items-center">
							{#each eventBrands as brand}
								<Avatar.Root class="w-8 h-8 rounded-lg">
									<Avatar.Image src="/pic/brand/{brand.brandpic1}" alt={brand.brandname} class="rounded-lg" />
									<Avatar.Fallback class="rounded-lg bg-muted" />
								</Avatar.Root>
							{/each}
							{#if selectedEvent.eventschema}
								<span class="text-sm text-muted-foreground">{selectedEvent.eventschema} 💰</span>
							{/if}
						</div>
						
						<div class="text-center pt-4 pb-1">
							<Button.Button size="lg" class="w-2/3 text-lg" onclick={() => startBooking(selectedEvent)}>
								Book This Event
							</Button.Button>
						</div>
					</Card.CardContent>
				</Card.Card>
				
				{#if selectedEvent.eventdesc}
					<div class="px-6 space-y-3">
						<h3 class="text-xl font-semibold">Event Details</h3>
						<p class="text-sm text-justify whitespace-pre-line leading-snug">{selectedEvent.eventdesc}</p>
					</div>
				{/if}
				
			</div>
		{:else}
			<Card.Card>
				<Card.CardContent class="p-4">
					<p class="text-muted-foreground">Event not found.</p>
				</Card.CardContent>
			</Card.Card>
		{/if}
	{/if}
</div>