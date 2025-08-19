<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	
	onMount(() => {
		// Use native browser redirect to avoid SvelteKit routing errors
		if (browser && window.location.pathname.includes('.php')) {
			window.location.replace('/');
		}
	});
</script>

<slot />