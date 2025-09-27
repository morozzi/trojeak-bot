<script lang="ts">
	import { Skeleton } from '@/components/ui/skeleton/index.js';

	interface Props {
		variant?: 'list' | 'detail' | 'booking';
		count?: number;
		size?: 'sm' | 'md' | 'lg';
		message?: string;
		showMessage?: boolean;
	}
	
	let { 
		variant, 
		count = 3, 
		size = 'md', 
		message = 'Loading...', 
		showMessage = true 
	}: Props = $props();
	
	const textSizeClasses = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg'
	};
</script>

{#if variant === 'list'}
	<div class="space-y-3">
		{#each Array(count) as _, index}
			<div class="flex gap-3 p-4">
				<Skeleton class="w-16 h-16 rounded" />
				<div class="flex-1 space-y-2">
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-3 w-1/2" />
				</div>
			</div>
		{/each}
	</div>
{:else if variant === 'detail'}
	<div class="p-4 space-y-4">
		<Skeleton class="w-full h-48 rounded" />
		<Skeleton class="h-6 w-3/4" />
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-2/3" />
	</div>
{:else if variant === 'booking'}
	<div class="p-4 space-y-4">
		<Skeleton class="h-4 w-1/3" />
		<div class="grid grid-cols-2 gap-3">
			{#each Array(4) as _, index}
				<Skeleton class="h-16 w-full rounded" />
			{/each}
		</div>
		<Skeleton class="h-10 w-full" />
		<Skeleton class="h-10 w-full" />
	</div>
{:else}
	<div class="flex items-center justify-center gap-4 p-8">
		{#if showMessage}
			<p class="text-muted-foreground text-center font-medium {textSizeClasses[size]}">{message}</p>
		{/if}
	</div>
{/if}