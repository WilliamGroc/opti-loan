<script lang="ts">
	import { Navigation, PageSection } from '$lib/components';
	import LoanCalculator from './_components/LoanCalculator.svelte';
	import SavedLoansList from './_components/SavedLoansList.svelte';
	import { createLoansListStore } from '$lib/composables';
	import type { SavedLoan } from '$lib/services';
	import { resolve } from '$app/paths';

	const siteName = 'Calcul Prêt';
	const siteUrl = 'https://www.calcul-pret.com';
	const pageTitle = 'Calculateur de prêt immobilier | Calcul-pret.com';
	const pageDescription =
		"Calculez vos mensualités, intérêts et tableaux d'amortissement en quelques secondes et optimisez vos plans de financement.";

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Calcul Prêt - Calculateur de prêt immobilier',
		description: pageDescription,
		applicationCategory: 'FinanceApplication',
		operatingSystem: 'Web',
		url: `${siteUrl}/`,
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'EUR'
		},
		creator: {
			'@type': 'Person',
			name: 'William Groc'
		},
		audience: {
			'@type': 'Audience',
			name: 'Particuliers et investisseurs immobiliers'
		}
	};

	const loansStore = createLoansListStore();
	let selectedLoan = $state<SavedLoan | null>(null);
	let editingLoanId = $state<string | null>(null);

	function loadLoan(loan: SavedLoan) {
		selectedLoan = loan;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	$effect(() => {
		loansStore.refresh();
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<link rel="canonical" href={`${siteUrl}/`} />
	<meta name="description" content={pageDescription} />
	<meta name="robots" content="index, follow" />
	<meta name="author" content="William Groc" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={`${siteUrl}/`} />
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
	<Navigation currentPage="" />

	<div class="container">
		<header class="page-hero">
			<h1>Calculateur de Prêt Immobilier</h1>
			<p class="hero-subtitle">
				Calculez vos mensualités, intérêts et tableaux d'amortissement en quelques clics
			</p>
		</header>

		<!-- Calculateur principal -->
		<LoanCalculator bind:selectedLoan bind:editingLoanId />

		<!-- Prêts sauvegardés -->
		<PageSection
			title="Prêts sauvegardés"
			subtitle="Accédez rapidement à vos prêts enregistrés"
			icon="💾"
			collapsible={true}
			defaultExpanded={true}
		>
			<SavedLoansList onLoad={loadLoan} {editingLoanId} />
		</PageSection>

		<!-- Call to action pour les plans -->
		<div class="cta-section">
			<div class="cta-card">
				<div class="cta-icon">📋</div>
				<div class="cta-content">
					<h3>Créer un plan de financement</h3>
					<p>Combinez plusieurs prêts et optimisez votre stratégie de remboursement</p>
					<a href={resolve('/plans')} class="btn-cta">Gérer mes plans →</a>
				</div>
			</div>
		</div>
	</div>
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

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem 3rem 2rem;
	}

	.page-hero {
		text-align: center;
		padding: 3rem 0;
		color: white;
	}

	.page-hero h1 {
		font-size: 2.75rem;
		margin: 0 0 1rem 0;
		text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
		font-weight: 700;
	}

	.hero-subtitle {
		font-size: 1.125rem;
		margin: 0;
		opacity: 0.95;
		font-weight: 400;
	}

	.cta-section {
		margin-top: 2rem;
	}

	.cta-card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		display: flex;
		align-items: center;
		gap: 2rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.cta-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.cta-icon {
		font-size: 3rem;
		flex-shrink: 0;
	}

	.cta-content {
		flex: 1;
	}

	.cta-content h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		color: #1a202c;
	}

	.cta-content p {
		margin: 0 0 1rem 0;
		color: #718096;
		font-size: 1rem;
	}

	.btn-cta {
		display: inline-block;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s;
	}

	.btn-cta:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	@media (max-width: 768px) {
		.container {
			padding: 0 1rem 2rem 1rem;
		}

		.page-hero {
			padding: 2rem 0;
		}

		.page-hero h1 {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.cta-card {
			flex-direction: column;
			text-align: center;
			padding: 1.5rem;
		}

		.cta-content h3 {
			font-size: 1.25rem;
		}
	}
</style>
