<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	import '../lib/styles/design-system.css';
	import '../lib/styles/pages.css';
	import '../lib/styles/components.css';
	
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

<style>
	:global(:root) {
		--background: 0 0% 100%;
		--foreground: 240 10% 3.9%;
		--card: 0 0% 100%;
		--card-foreground: 240 10% 3.9%;
		--popover: 0 0% 100%;
		--popover-foreground: 240 10% 3.9%;
		--primary: 240 9% 9.8%;
		--primary-foreground: 0 0% 98%;
		--secondary: 240 4.8% 95.9%;
		--secondary-foreground: 240 5.9% 10%;
		--muted: 240 4.8% 95.9%;
		--muted-foreground: 240 3.8% 46.1%;
		--accent: 240 4.8% 95.9%;
		--accent-foreground: 240 5.9% 10%;
		--destructive: 0 84.2% 60.2%;
		--destructive-foreground: 0 0% 98%;
		--border: 240 5.9% 90%;
		--input: 240 5.9% 90%;
		--ring: 240 10% 3.9%;
		--radius: 0.5rem;
	}
</style>

<slot />