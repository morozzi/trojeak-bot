<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	onMount(() => {
		// If the URL contains .php, redirect to root
		if ($page.url.pathname.includes('.php')) {
			goto('/', { replaceState: true });
		}
	});
</script>

<slot />