<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		message?: string;
		showMessage?: boolean;
	}
	
	let { size = 'md', message = 'Loading...', showMessage = true }: Props = $props();
	
	const textSizeClasses = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg'
	};
</script>

<div class="flex items-center justify-center gap-4 p-8">
	{#if showMessage}
		<p class="text-muted-foreground text-center font-medium {textSizeClasses[size]}">{message}</p>
	{/if}
</div>