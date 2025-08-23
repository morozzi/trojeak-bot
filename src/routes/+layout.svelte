<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	import '../app.css';
	
	onMount(() => {
		if ($page.url.pathname.includes('.php')) {
			const queryString = $page.url.search;
			console.log('Layout redirect - preserving query string:', queryString);
			goto(`/${queryString}`, { replaceState: true });
		}
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<slot />