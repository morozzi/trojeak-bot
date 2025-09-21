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
	import type { Brand, Event } from '$lib/types/api.js';
	import type { ViewType } from '$lib/types/components.js';
	import { userStore } from '$lib/stores/user.js';
	import { appStore } from '$lib/stores/app.js';

	const dispatch = createEventDispatcher<{
		navigate: { view: ViewType };
	}>();

	const viewMode = $derived($appStore.currentView === 'brands-detail' ? 'detail' : 'list');
	const selectedBrandId = $derived($appStore.selectedBrandId || null);

	const brandsQuery = createQuery({
		queryKey: ['brands'],
		queryFn: async () => {
			const response = await fetch(`/api/brands.php`);
			if (!response.ok) throw new Error('Failed to fetch brands');
			return response.json();
		}
	});
	
	const brands = $derived($brandsQuery.data || []);

	const eventsQuery = createQuery({
		queryKey: ['events', $userStore.selectedLanguage, $userStore.selectedCity],
		queryFn: async () => {
			const response = await fetch(`/api/events.php?lang=${$userStore.selectedLanguage}&city=${$userStore.selectedCity}`);
			if (!response.ok) throw new Error('Failed to fetch events');
			return response.json();
		}
	});

	const getBrandEvents = $derived((brandId: number, returnCount: boolean = false) => {
		const events = $eventsQuery.data || [];
		
		const brandEvents = events.filter(event => {
			const brandIds = event.brandid.split(',').map(id => id.replace(/\^/g, ''));
			return brandIds.includes(brandId.toString());
		});
		
		if (returnCount) {
			const count = brandEvents.length;
			let nextEventDate = null;
			
			if (count > 0) {
				const nextEvent = brandEvents.reduce((earliest, current) => 
					new Date(current.eventdate) < new Date(earliest.eventdate) ? current : earliest
				);
				nextEventDate = new Date(nextEvent.eventdate).toLocaleDateString('en-US', { 
					year: 'numeric', month: 'long', day: 'numeric' 
				});
			}
			
			return { count, nextEventDate };
		}
		
		return brandEvents;
	});
	
	function goToBrand(brandId: string): void {
    dispatch('navigate', { view: 'brands-detail', brandId });
	}
	
	function goToEvent(eventId: string): void {
    dispatch('navigate', { view: 'events-detail', eventId });
	}
</script>

<div class="space-y-8">
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<h1 class="text-4xl font-bold text-center">Brands</h1>
		</div>
		
		<div class="grid gap-8">
			{#if $brandsQuery.isLoading}
				<Loading variant="list" />
			{:else if $brandsQuery.error}
				<Card.Card>
					<Card.CardContent class="p-4">
						<p class="text-destructive">Failed to load brands. Please try again.</p>
					</Card.CardContent>
				</Card.Card>
			{:else if brands.length === 0}
				<Card.Card>
					<Card.CardContent class="p-4">
						<p class="text-muted-foreground">No brands available.</p>
					</Card.CardContent>
				</Card.Card>
			{:else}
				{#each brands as brand}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => goToBrand(brand.brandid.toString())}>
						<Card.CardHeader class="gap-0 pb-4">
							<div class="flex justify-between items-center">
								<div class="flex items-center gap-4">
									<Avatar.Root class="w-16 h-16 rounded-lg">
										<Avatar.Image src="/pic/brand/{brand.brandpic1}" alt={brand.brandname} class="rounded-lg" />
										<Avatar.Fallback class="rounded-lg bg-muted">{brand.brandname.charAt(0)}</Avatar.Fallback>
									</Avatar.Root>
									<div class="space-y-1">
										<Card.CardTitle class="text-xl font-semibold">{brand.brandname}</Card.CardTitle>
										<div class="flex gap-2">
											{#if brand.brandfeatured}
												<Badge><Star /> Featured</Badge>
											{/if}
										</div>
									</div>
								</div>
							</div>
						</Card.CardHeader>
						
						{#if brand.brandpic2 && brand.brandfeatured}
							<AspectRatio ratio={16/9}>
								<img src="/pic/brand/{brand.brandpic2}" alt="{brand.brandname}" class="w-full h-full object-cover" />
							</AspectRatio>
						{/if}

						<Card.CardContent class="p-4 px-6 pb-4 space-y-4">
							{#if $eventsQuery.isSuccess}
								{@const brandData = getBrandEvents(brand.brandid, true)}
								
								<p class="text-md text-muted-foreground">
									{#if brandData.count === 0}
										No events{$userStore.selectedCityName ? ` in ${$userStore.selectedCityName}` : ''}
									{:else}
										{brandData.count} {brandData.count === 1 ? 'event' : 'events'} → {brandData.count > 1 ? 'next ' : ''}{brandData.nextEventDate}
									{/if}
								</p>
							{/if}
						</Card.CardContent>
					</Card.Card>
				{/each}
			{/if}
		</div>
	{:else if viewMode === 'detail' && selectedBrandId}
		{@const selectedBrand = brands.find(b => b.brandid.toString() === selectedBrandId)}
		{#if $brandsQuery.isLoading || $eventsQuery.isLoading}
			<Loading variant="detail" />
		{:else if selectedBrand}
			{@const brandEvents = getBrandEvents(selectedBrand.brandid)}
			<div class="space-y-8">
				{#if selectedBrand.brandpic2 && selectedBrand.brandfeatured}
					<AspectRatio class="pb-2" ratio={16/9}>
						<img src="/pic/brand/{selectedBrand.brandpic2}" alt="{selectedBrand.brandname}" class="w-full h-full object-cover" />
					</AspectRatio>
				{/if}
				
				<Card.Card>
					<Card.CardHeader class="gap-0">
						<div class="flex items-center gap-6">
							<Avatar.Root class="w-32 h-32 rounded-lg">
								<Avatar.Image src="/pic/brand/{selectedBrand.brandpic1}" alt={selectedBrand.brandname} class="rounded-lg" />
								<Avatar.Fallback class="rounded-lg bg-muted text-lg">{selectedBrand.brandname.charAt(0)}</Avatar.Fallback>
							</Avatar.Root>
							<div class="space-y-1">
								<Card.CardTitle class="text-3xl font-bold">{selectedBrand.brandname}</Card.CardTitle>
								<div class="flex gap-2">
									{#if selectedBrand.brandfeatured}
										<Badge><Star /> Featured</Badge>
									{/if}
								</div>
								<p class="pt-3 text-md text-muted-foreground">
									{#if brandEvents.length === 0}
										No events
									{:else}
										{brandEvents.length} {brandEvents.length === 1 ? 'event' : 'events'}
									{/if}
									<br>{$userStore.selectedCityName ? ` in ${$userStore.selectedCityName}` : ''}
								</p>
							</div>
						</div>
					</Card.CardHeader>
				</Card.Card>

				{#if brandEvents.length > 0}
					<h3 class="text-3xl font-semibold mt-10 mb-4 text-center">Upcoming Events</h3>
					<EventList 
						events={brandEvents} 
						brandData={$brandsQuery.data || []}
						onEventClick={goToEvent} 
					/>
				{:else}
					<div class="text-center pt-4">
						<Button.Button variant="default" size="lg" class="text-md bg-primary text-primary-foreground hover:bg-primary/90">
							Notify me about events
						</Button.Button>
					</div>
				{/if}
			</div>
		{:else}
			<Card.Card>
				<Card.CardContent class="p-4">
					<p class="text-muted-foreground">Brand not found.</p>
				</Card.CardContent>
			</Card.Card>
		{/if}
	{/if}
</div>