<script lang="ts">
	import { onMount } from 'svelte';

	let webApp: any;

	onMount(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			webApp = window.Telegram.WebApp;
			webApp.ready();
			webApp.expand();
		}
	});
</script>

<main>
	<h1>Hello Trojeak! 🍺</h1>
	<p>Mini app working!</p>
</main>

<style>
	main {
		padding: 20px;
		font-family: Arial, sans-serif;
	}
	h1 {
		color: #333;
	}
</style>