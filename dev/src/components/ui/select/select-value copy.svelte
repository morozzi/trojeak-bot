<script lang="ts">
	import { cn } from "$lib/utils.js";
	
	let {
		class: className,
		placeholder,
		children,
		...restProps
	}: {
		class?: string;
		placeholder?: string;
		children?: any;
		[key: string]: any;
	} = $props();
</script>

<span
	data-slot="select-value"
	class={cn("line-clamp-1 flex items-center gap-2", className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else if placeholder}
		<span class="text-muted-foreground">{placeholder}</span>
	{/if}
</span>