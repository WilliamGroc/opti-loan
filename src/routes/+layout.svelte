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

{@render children()}
