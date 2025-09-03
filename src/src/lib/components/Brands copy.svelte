<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
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
	];

	function selectBrand(brandId: string): void {
		selectedBrandId = brandId;
		viewMode = 'detail';
	}

	function goToList(): void {
		viewMode = 'list';
		selectedBrandId = null;
	}

	function goBack(): void {
		dispatch('goBack');
	}
</script>

<div class="space-y-8">
	{#if viewMode === 'list'}
		<div class="space-y-4">
			<h1 class="text-3xl font-bold">Brands ({brands.length})</h1>
		</div>
		
		<div class="grid gap-4">
			{#each brands as brand}
				<Card.Card class="cursor-pointer hover:shadow-lg transition-shadow" onclick={() => selectBrand(brand.id)}>
					<Card.CardHeader>
						<div class="flex justify-between items-start">
							<Card.CardTitle>{brand.name}</Card.CardTitle>
							<div class="flex gap-2">
								<Badge.Badge variant="secondary">{brand.type.toUpperCase()}</Badge.Badge>
								{#if brand.featured}
									<Badge.Badge>Featured</Badge.Badge>
								{/if}
							</div>
						</div>
					</Card.CardHeader>
					<Card.CardContent>
						<p>{brand.description}</p>
					</Card.CardContent>
				</Card.Card>
			{/each}
		</div>
	{:else if viewMode === 'detail' && selectedBrandId}
		{@const selectedBrand = brands.find(b => b.id === selectedBrandId)}
		{#if selectedBrand}
			<div class="space-y-8">
				<div class="flex justify-between items-center">
					<div class="flex gap-2">
						<Badge.Badge variant="secondary">{selectedBrand.type.toUpperCase()}</Badge.Badge>
						{#if selectedBrand.featured}
							<Badge.Badge>Featured</Badge.Badge>
						{/if}
					</div>
				</div>

				<h1 class="text-3xl font-bold">{selectedBrand.name}</h1>
				
				<Card.Card>
					<Card.CardContent class="p-6">
						<p>{selectedBrand.description}</p>
					</Card.CardContent>
				</Card.Card>
			</div>
		{/if}
	{/if}
</div>

<nav class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50">
	<div class="mx-auto w-full max-w-2xl px-4">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8">
			<div class="flex items-center justify-start">
				{#if viewMode === 'list'}
					<Button.Button variant="outline" onclick={goBack}>
						← Back to Main
					</Button.Button>
				{:else}
					<Button.Button variant="outline" onclick={goToList}>
						← Back to Brands
					</Button.Button>
				{/if}
			</div>
			<div class="flex items-center justify-center"></div>
			<div class="flex items-center justify-end"></div>
		</div>
	</div>
</nav>