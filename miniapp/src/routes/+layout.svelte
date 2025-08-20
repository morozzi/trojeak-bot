<!-- miniapp/src/routes/+layout.svelte -->
<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	// Import the clean design system and page styles
	import '../lib/styles/design-system.css';
	import '../lib/styles/pages.css';
	import '../lib/styles/components.css';
	
	onMount(() => {
		// If the URL contains .php, redirect to root BUT PRESERVE QUERY PARAMETERS
		if ($page.url.pathname.includes('.php')) {
			const queryString = $page.url.search; // Preserve ?start=events etc.
			console.log('Layout redirect - preserving query string:', queryString);
			goto(`/${queryString}`, { replaceState: true });
		}
	});
</script>

<svelte:head>
	<!-- Google Fonts for Design System -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<slot />