<script lang="ts">
	import FinancingEstimator from '$lib/components/FinancingEstimator.svelte';

	const siteName = 'Calcul Prêt';
	const siteUrl = 'https://www.calcul-pret.com';
	const pageTitle = 'Estimation plan de financement immobilier | Calcul-pret.com';
	const pageDescription =
		"Estimez le coût global de votre projet d'achat immobilier : frais de notaire, frais de dossier, assurance emprunteur, garantie, intérêts et mensualités. Calculateur gratuit et complet.";

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'Estimation Plan de Financement Immobilier',
		description: pageDescription,
		url: `${siteUrl}/estimation`,
		isPartOf: {
			'@type': 'WebSite',
			name: siteName,
			url: siteUrl
		},
		mainEntity: {
			'@type': 'FinancialProduct',
			name: 'Estimation de prêt immobilier',
			description:
				"Outil d'estimation complète pour calculer tous les frais liés à un achat immobilier en résidence principale",
			category: 'Prêt immobilier',
			featureList: [
				'Calcul des frais de notaire (neuf et ancien)',
				'Frais de dossier',
				'Assurance emprunteur',
				'Garantie',
				'Calcul des mensualités',
				'Calcul des intérêts',
				'Coût total du projet',
				'Sauvegarde de projets'
			]
		}
	};
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<link rel="canonical" href={`${siteUrl}/estimation`} />
	<meta name="description" content={pageDescription} />
	<meta name="robots" content="index, follow" />
	<meta name="author" content="William Groc" />
	<meta
		name="keywords"
		content="estimation prêt immobilier, frais notaire, frais dossier, assurance emprunteur, garantie prêt, calcul mensualité, intérêts prêt, achat immobilier, financement immobilier, résidence principale"
	/>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={`${siteUrl}/estimation`} />
	<meta property="og:image" content={`${siteUrl}/icon-512.png`} />
	<meta property="og:locale" content="fr_FR" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={`${siteUrl}/icon-512.png`} />
	<script type="application/ld+json">
		{JSON.stringify(structuredData)}
	</script>
</svelte:head>

<div class="page-wrapper">
	<nav class="nav-bar">
		<a href="/" class="nav-link">← Retour au calculateur</a>
		<div class="nav-links">
			<a href="/plans" class="btn-nav" title="Voir les plans de financement">📋 Mes Plans</a>
		</div>
	</nav>

	<FinancingEstimator />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.page-wrapper {
		min-height: 100vh;
	}

	.nav-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.nav-link {
		background: white;
		color: #667eea;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s;
		display: inline-block;
	}

	.nav-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.nav-links {
		display: flex;
		gap: 1rem;
	}

	.btn-nav {
		background: white;
		color: #667eea;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s;
		display: inline-block;
	}

	.btn-nav:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 768px) {
		.nav-bar {
			flex-direction: column;
			align-items: stretch;
			padding: 1rem;
		}

		.nav-link,
		.btn-nav {
			width: 100%;
			text-align: center;
		}
	}
</style>
