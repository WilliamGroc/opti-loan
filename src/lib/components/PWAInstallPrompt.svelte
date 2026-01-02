<script lang="ts">
	import { onMount } from 'svelte';

	let deferredPrompt = $state<any>(null);
	let showInstallPrompt = $state(false);
	let isIOS = $state(false);

	onMount(() => {
		// Vérifier si c'est iOS
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

		// Vérifier si l'app est déjà installée
		const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
		if (isInStandaloneMode) {
			return;
		}

		// Écouter l'événement beforeinstallprompt (Android/Chrome)
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;

			// Vérifier si l'utilisateur n'a pas déjà refusé
			const dismissed = localStorage.getItem('pwa-install-dismissed');
			if (!dismissed) {
				showInstallPrompt = true;
			}
		});

		// Pour iOS, afficher le prompt si pas déjà installé
		if (isIOS) {
			const dismissed = localStorage.getItem('pwa-install-dismissed');
			if (!dismissed) {
				showInstallPrompt = true;
			}
		}
	});

	async function handleInstall() {
		if (!deferredPrompt) {
			return;
		}

		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			console.log('PWA installée');
		}

		deferredPrompt = null;
		showInstallPrompt = false;
	}

	function handleDismiss() {
		showInstallPrompt = false;
		localStorage.setItem('pwa-install-dismissed', 'true');
	}
</script>

{#if showInstallPrompt}
	<div class="install-prompt">
		<div class="install-content">
			<button class="close-btn" onclick={handleDismiss} aria-label="Fermer">✕</button>

			<div class="install-icon">📱</div>

			<h3>Installer Calcul Prêt</h3>
			<p>
				{#if isIOS}
					Appuyez sur <strong>Partager</strong> <span class="ios-share-icon">⎙</span> puis
					<strong>"Sur l'écran d'accueil"</strong> pour installer l'application.
				{:else}
					Installez l'application sur votre appareil pour un accès rapide et une utilisation hors
					ligne.
				{/if}
			</p>

			{#if !isIOS && deferredPrompt}
				<button class="install-btn" onclick={handleInstall}> 📥 Installer maintenant </button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.install-prompt {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
		z-index: 1000;
		animation: slideUp 0.3s ease-out;
		border-top-left-radius: 16px;
		border-top-right-radius: 16px;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.install-content {
		padding: 1.5rem;
		max-width: 600px;
		margin: 0 auto;
		position: relative;
	}

	.close-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #666;
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: #333;
	}

	.install-icon {
		font-size: 3rem;
		text-align: center;
		margin-bottom: 1rem;
	}

	h3 {
		text-align: center;
		color: #333;
		font-size: 1.4rem;
		margin: 0 0 0.75rem 0;
	}

	p {
		text-align: center;
		color: #666;
		line-height: 1.6;
		margin: 0 0 1.5rem 0;
		font-size: 0.95rem;
	}

	.ios-share-icon {
		display: inline-block;
		font-size: 1.2rem;
		vertical-align: middle;
		color: #007aff;
	}

	.install-btn {
		width: 100%;
		padding: 1rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.install-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.install-btn:active {
		transform: translateY(0);
	}

	@media (min-width: 768px) {
		.install-prompt {
			left: 50%;
			right: auto;
			transform: translateX(-50%);
			width: 500px;
			bottom: 2rem;
			border-radius: 16px;
		}

		@keyframes slideUp {
			from {
				transform: translateX(-50%) translateY(100%);
			}
			to {
				transform: translateX(-50%) translateY(0);
			}
		}
	}
</style>
