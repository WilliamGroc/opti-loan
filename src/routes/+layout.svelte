<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { PWAInstallPrompt } from '$lib/components';

	let { children } = $props();

	// Enregistrer le service worker pour la PWA
	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/sw.js')
				.then((registration) => {
					console.log('Service Worker enregistré:', registration);
				})
				.catch((error) => {
					console.log('Erreur Service Worker:', error);
				});
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<PWAInstallPrompt />

<div class="layout-wrapper">
	{@render children()}

	<footer class="site-footer">
		<div class="footer-content">
			<p>&copy; 2026 Calcul-pret.com - Tous droits réservés</p>
			<a href="/mentions-legales" class="footer-link">Mentions légales</a>
		</div>
	</footer>
</div>

<style>
	.layout-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.site-footer {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		padding: 2rem;
		margin-top: auto;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	.footer-content {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		color: white;
	}

	.footer-content p {
		margin: 0;
		font-size: 0.9rem;
	}

	.footer-link {
		color: white;
		text-decoration: none;
		font-size: 0.9rem;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		transition: all 0.2s;
		background: rgba(255, 255, 255, 0.1);
	}

	.footer-link:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	@media (max-width: 768px) {
		.footer-content {
			flex-direction: column;
			text-align: center;
		}

		.footer-link {
			width: 100%;
		}
	}
</style>
