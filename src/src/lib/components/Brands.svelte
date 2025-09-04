<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import * as AspectRatio from '$lib/components/ui/aspect-ratio/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';
	import { createEventDispatcher } from 'svelte';

	interface Brand {
		id: string;
		name: string;
		type: string;
		featured: boolean;
		description: string;
	}

	const dispatch = createEventDispatcher<{
		goBack: void;
	}>();

	let viewMode: 'list' | 'detail' = $state('list');
	let selectedBrandId: string | null = $state(null);

	const brands: Brand[] = [
		{
			id: 'brd_001',
			name: 'Angkor Beer',
			type: 'beer',
			featured: true,
			description: 'Cambodia\'s premium beer brand with crisp, refreshing taste.'
		},
		{
			id: 'brd_002',
			name: 'Hennessy',
			type: 'cognac',
			featured: true,
			description: 'World-renowned cognac for sophisticated evenings.'
		},
		{
			id: 'brd_003',
			name: 'Grey Goose',
			type: 'vodka',
			featured: false,
			description: 'Premium French vodka crafted from the finest wheat.'
		},
		{
			id: 'brd_004',
			name: 'Johnnie Walker',
			type: 'whisky',
			featured: true,
			description: 'Iconic Scotch whisky with rich heritage and bold flavors.'
		}
	].sort((a, b) => Number(b.featured) - Number(a.featured));

	function selectBrand(brandId: string): void {
		selectedBrandId = brandId;
		viewMode = 'detail';
		window.scrollTo(0, 0);
	}

	function goToList(): void {
		viewMode = 'list';
		selectedBrandId = null;
		window.scrollTo(0, 0);
	}

	function goBack(): void {
		dispatch('goBack');
	}

	function goToEvent(eventId: string): void {
		// Navigate to specific event
		console.log('Navigate to event:', eventId);
	}
</script>

<div class="space-y-8">
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<h1 class="text-3xl font-bold">Brands</h1>
		</div>
		
		<div class="grid gap-4">
			{#if brands.length === 0}
				<Card.Card>
					<Skeleton.Skeleton class="h-16 w-full" />
					<Card.CardContent class="p-4 space-y-2">
						<Skeleton.Skeleton class="h-4 w-full" />
						<Skeleton.Skeleton class="h-4 w-3/4" />
						<Skeleton.Skeleton class="h-4 w-1/2" />
					</Card.CardContent>
				</Card.Card>
			{:else}
				{#each brands as brand}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectBrand(brand.id)}>
						<Card.CardHeader class="gap-0 pb-4">
							<div class="flex justify-between items-center">
								<div class="flex items-center gap-2">
									<Card.CardTitle class="text-lg font-semibold">{brand.name}</Card.CardTitle>
									<Badge.Badge variant="secondary">{brand.type.toUpperCase()}</Badge.Badge>
								</div>
								<div class="flex gap-2">
									{#if brand.featured}
										<Badge.Badge>Featured</Badge.Badge>
									{/if}
								</div>
							</div>
						</Card.CardHeader>
						
						{#if brand.featured}
							<AspectRatio.Root class="pb-2" ratio={16/9}>
								<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
									Featured Brand Banner
								</div>
							</AspectRatio.Root>
						{/if}

						<Card.CardContent class="p-4 pb-4 space-y-4">
							<p>{brand.description}</p>
						</Card.CardContent>
					</Card.Card>
				{/each}
			{/if}
		</div>
	{:else if viewMode === 'detail' && selectedBrandId}
		{@const selectedBrand = brands.find(b => b.id === selectedBrandId)}
		{#if selectedBrand}
			<div class="space-y-8">
				{#if selectedBrand.featured}
					<AspectRatio.Root class="pb-2" ratio={16/9}>
						<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
							Featured Brand Banner
						</div>
					</AspectRatio.Root>
				{/if}

				<Card.Card>
					<Card.CardHeader>
						<h1 class="text-3xl font-bold">{selectedBrand.name}</h1>
						<div class="flex gap-2">
							<Badge.Badge variant="secondary">{selectedBrand.type.toUpperCase()}</Badge.Badge>
							{#if selectedBrand.featured}
								<Badge.Badge>Featured</Badge.Badge>
							{/if}
						</div>
					</Card.CardHeader>
					<Card.CardContent class="p-6">
						<p>{selectedBrand.description}</p>
					</Card.CardContent>
				</Card.Card>

				<h3 class="text-lg font-semibold mb-4">Upcoming Events</h3>
				{#if selectedBrand.featured}
					<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => goToEvent('evt_003')}>
						<Card.CardHeader class="gap-0 pb-4">
							<Card.CardTitle class="text-lg font-semibold">Weekend Beach Club</Card.CardTitle>
						</Card.CardHeader>
						
						<AspectRatio.Root class="pb-2" ratio={16/9}>
							<div class="bg-gray-200 text-gray-600 text-center font-medium h-full flex items-center justify-center">
								Featured Event Banner
							</div>
						</AspectRatio.Root>

						<Card.CardContent class="p-4 pb-4 space-y-4">
							<div class="text-sm text-muted-foreground">
								📅 August 24, 2025 • 📍 Sihanoukville
							</div>

							<div class="text-sm">
								🏢 Otres Beach Club
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

<nav class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50">
	<div class="mx-auto w-full max-w-2xl px-4">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8">
			<div class="flex items-center justify-start">
				{#if viewMode === 'list'}
					<Button.Button variant="outline" size="sm" onclick={goBack}>
						← Back to Main
					</Button.Button>
				{:else}
					<Button.Button variant="outline" size="sm" onclick={goToList}>
						← Back to Brands
					</Button.Button>
				{/if}
			</div>
			<div class="flex items-center justify-center"></div>
			<div class="flex items-center justify-end"></div>
		</div>
	</div>
</nav>