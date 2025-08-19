<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	onMount(() => {
		// Only redirect if browser URL actually contains .php
		if (browser && window.location.pathname.includes('.php')) {
			goto('/', { replaceState: true });
		}
	});
</script>

<slot />