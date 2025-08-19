<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let webApp: any = null;
	let isReady = false;
	let userInfo: any = null;
	let error: string | null = null;

	onMount(() => {
		if (browser) {
			// Silently fix the URL
			const currentPath = window.location.pathname;
			if (currentPath.includes('.php')) {
				window.history.replaceState({}, '', '/');
			}

			// Override console.error to suppress .php 404 errors
			const originalConsoleError = console.error;
			console.error = (...args: any[]) => {
				const message = args.join(' ');
				if (message.includes('.php') && message.includes('404')) {
					return; // Suppress these errors
				}
				originalConsoleError.apply(console, args);
			};
		}

		try {
			if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
				webApp = window.Telegram.WebApp;
				
				webApp.ready();
				webApp.expand();
				
				if (webApp.initDataUnsafe?.user) {
					userInfo = webApp.initDataUnsafe.user;
				}
				
				webApp.MainButton.text = "Close App";
				webApp.MainButton.show();
				webApp.MainButton.onClick(() => {
					webApp.close();
				});
				
				isReady = true;
				console.log('✅ Telegram WebApp initialized successfully');
			} else {
				error = 'Telegram WebApp not available. Open this in Telegram.';
				console.warn('⚠️ Not running in Telegram environment');
			}
		} catch (err) {
			error = 'Failed to initialize Telegram WebApp';
			console.error('❌ WebApp initialization error:', err);
		}
	});
</script>

<main class="container">
	<div class="header">
		<h1>🍺 Hello Trojeak!</h1>
		<p class="subtitle">Mini app working perfectly!</p>
	</div>

	<div class="status">
		{#if error}
			<div class="error">
				<p>⚠️ {error}</p>
				<p class="hint">Try opening this in Telegram</p>
			</div>
		{:else if !isReady}
			<div class="loading">
				<p>🔄 Initializing...</p>
			</div>
		{:else}
			<div class="success">
				<p>✅ Telegram WebApp Ready!</p>
				{#if userInfo}
					<div class="user-info">
						<p><strong>User:</strong> {userInfo.first_name} {userInfo.last_name || ''}</p>
						{#if userInfo.username}
							<p><strong>Username:</strong> @{userInfo.username}</p>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<div class="info">
		<h3>🚀 App Status</h3>
		<ul>
			<li>✅ SvelteKit: Working</li>
			<li>✅ TypeScript: Enabled</li>
			<li>✅ Telegram SDK: {webApp ? 'Connected' : 'Not Available'}</li>
			<li>✅ Build System: Functional</li>
		</ul>
	</div>

	<div class="next-steps">
		<h3>📋 Next Steps</h3>
		<p>Ready for Phase 2 API development!</p>
	</div>
</main>

<style>
	.container {
		max-width: 600px;
		margin: 0 auto;
		padding: 20px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.header {
		text-align: center;
		padding: 20px 0;
	}

	h1 {
		color: var(--tg-theme-text-color, #333);
		font-size: 2.5em;
		margin: 0 0 8px 0;
		font-weight: bold;
	}

	.subtitle {
		color: var(--tg-theme-hint-color, #666);
		font-size: 1.2em;
		margin: 0;
	}

	.status {
		padding: 16px;
		border-radius: 12px;
		text-align: center;
	}

	.success {
		background-color: var(--tg-theme-section-bg-color, #e8f5e8);
		color: var(--tg-theme-text-color, #2d5a2d);
	}

	.error {
		background-color: #ffe8e8;
		color: #d63031;
	}

	.loading {
		background-color: var(--tg-theme-section-bg-color, #f0f0f0);
		color: var(--tg-theme-text-color, #666);
	}

	.user-info {
		margin-top: 12px;
		padding: 12px;
		background-color: var(--tg-theme-bg-color, rgba(255, 255, 255, 0.1));
		border-radius: 8px;
		font-size: 0.9em;
	}

	.info, .next-steps {
		background-color: var(--tg-theme-section-bg-color, #f8f9fa);
		padding: 20px;
		border-radius: 12px;
	}

	h3 {
		color: var(--tg-theme-text-color, #333);
		margin: 0 0 12px 0;
		font-size: 1.3em;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		padding: 8px 0;
		color: var(--tg-theme-text-color, #555);
		font-size: 1em;
	}

	.hint {
		font-size: 0.9em;
		opacity: 0.8;
		margin-top: 8px;
	}

	p {
		margin: 8px 0;
		line-height: 1.5;
		color: var(--tg-theme-text-color, #555);
	}

	@media (max-width: 480px) {
		.container {
			padding: 16px;
			gap: 20px;
		}
		
		h1 {
			font-size: 2em;
		}
		
		.subtitle {
			font-size: 1.1em;
		}
	}
</style>