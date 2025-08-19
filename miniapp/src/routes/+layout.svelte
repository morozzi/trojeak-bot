<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	
	onMount(() => {
		if (browser) {
			// Silently fix the URL without triggering SvelteKit navigation
			const currentPath = window.location.pathname;
			if (currentPath.includes('.php')) {
				window.history.replaceState({}, '', '/');
			}
		}
	});
</script>

<slot />