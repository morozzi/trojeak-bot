<script lang="ts">
	import { AspectRatio } from "@/components/ui/aspect-ratio/index.js";
	import { Badge } from "@/components/ui/badge/index.js";
	import * as Card from '@/components/ui/card/index.js';
	import * as Avatar from '@/components/ui/avatar/index.js';
	import { Star } from '@lucide/svelte';
	import type { Event, Brand } from '$lib/types/api.js';

	interface Props {
		events: Event[] | null;
		brandData: Brand[];
		onEventClick: (eventId: string) => void;
	}

	let { events, brandData, onEventClick }: Props = $props();
</script>

{#if events}
	{#each events as event}
		{@const eventBrandIds = event.brandid.split(',').map(id => id.replace(/\^/g, ''))}
		{@const eventBrands = (brandData || []).filter(b => eventBrandIds.includes(b.brandid.toString()))}
		
		<Card.Card class="py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick={() => onEventClick(event.eventid.toString())}>
			<Card.CardHeader class="gap-0 pb-4">
				<div class="flex justify-between items-center">
					<div class="flex items-center gap-4">
						<div class="space-y-2">
							<Card.CardTitle class="text-3xl font-bold">{event.eventtitle}</Card.CardTitle>
								<div class="flex gap-2">
									{#if event.eventfeatured}
										<Badge><Star /> Featured</Badge>
									{/if}
								</div>
						</div>
					</div>
				</div>
			</Card.CardHeader>
			
			{#if event.eventpic}
				<AspectRatio class="pb-2" ratio={4/5}>
					<img src="/pic/event/{event.eventpic}" alt="{event.eventtitle}" class="w-full h-full object-cover" />
				</AspectRatio>
			{/if}

			<Card.CardContent class="p-4 pb-4 space-y-4">
				<div class="text-sm text-muted-foreground">
					📅 {new Date(event.eventdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
				</div>
				
					<div class="text-sm">
						📍 {event.venuename} 
						{#if event.venuelink}
							<a href="{event.venuelink}" target="_blank" rel="noopener noreferrer" onclick={(e) => e.stopPropagation()}>(Google Maps 🔗)</a>
						{/if}
					</div>

				{#if event.eventartist}
					<div class="text-sm">
						🎵 {event.eventartist}
					</div>
				{/if}

				<div class="flex gap-2 items-center">
					{#if eventBrands.length > 0}
						{#each eventBrands as brand}
							<Avatar.Root class="w-8 h-8 rounded-lg">
								{#if brand.brandpic1}
									<Avatar.Image src="/pic/brand/{brand.brandpic1}" alt={brand.brandname} class="rounded-lg" />
								{/if}
								<Avatar.Fallback class="rounded-lg bg-muted" />
							</Avatar.Root>
						{/each}
					{/if}
					{#if event.eventschema}
						<span class="text-sm text-muted-foreground">{event.eventschema} 💰</span>
					{/if}
				</div>
			</Card.CardContent>
		</Card.Card>
	{/each}
{/if}