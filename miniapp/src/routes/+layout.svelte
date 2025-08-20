<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	onMount(() => {
		// If the URL contains .php, redirect to root BUT PRESERVE QUERY PARAMETERS
		if ($page.url.pathname.includes('.php')) {
			const queryString = $page.url.search; // Preserve ?start=events etc.
			console.log('Layout redirect - preserving query string:', queryString);
			goto(`/${queryString}`, { replaceState: true });
		}
	});
</script>

<slot />