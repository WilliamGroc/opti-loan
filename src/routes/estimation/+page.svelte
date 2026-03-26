<script lang="ts">
	import { Navigation } from '$lib/components';
	import FinancingEstimator from './_components/FinancingEstimator.svelte';

	const siteName = 'Calcul Prêt';
	const siteUrl = 'https://www.calcul-pret.com';
	const pageTitle = "Estimation Capacité d'Emprunt & Prix Maximum Immobilier | Calcul-pret.com";
	const pageDescription =
		"Calculez votre capacité d'emprunt maximale et le prix maximum du bien que vous pouvez acheter. Estimation complète incluant frais de notaire, dossier, garantie, assurance et taux d'endettement. Outil gratuit et précis.";

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: "Estimation Capacité d'Emprunt et Prix Maximum Immobilier",
		description: pageDescription,
		url: `${siteUrl}/estimation`,
		isPartOf: {
			'@type': 'WebSite',
			name: siteName,
			url: siteUrl
		},
		mainEntity: {
			'@type': 'FinancialProduct',
			name: "Calculateur de capacité d'emprunt immobilier",
			description:
				"Outil complet pour calculer votre capacité d'emprunt maximale et le prix maximum du bien que vous pouvez acheter, en tenant compte de tous les frais annexes et du taux d'endettement",
			category: 'Prêt immobilier',
			featureList: [
				"Calcul de la capacité d'emprunt maximale",
				'Calcul du prix maximum du bien achetable',
				"Taux d'endettement en temps réel",
				'Intégration des revenus et crédits en cours',
				'Calcul des frais de notaire (neuf et ancien)',
				'Frais de dossier bancaire',
				'Assurance emprunteur',
				'Garantie de prêt',
				'Calcul des mensualités',
				'Calcul des intérêts totaux',
				'Coût global du projet',
				'Sauvegarde de projets multiples'
			],
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'EUR',
				availability: 'https://schema.org/InStock',
				description: 'Outil gratuit et sans engagement'
			}
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
		content="capacité emprunt, prix maximum immobilier, taux endettement, estimation prêt immobilier, frais notaire, frais dossier, assurance emprunteur, garantie prêt, calcul mensualité, intérêts prêt, achat immobilier, financement immobilier, résidence principale, revenus emprunteur, 33% endettement, simulateur capacité achat"
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

<div class="app-wrapper">
	<Navigation currentPage="estimation" />
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

	.app-wrapper {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
</style>
