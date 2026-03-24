<script lang="ts">
	import { EmptyState, Navigation, PageSection } from '$lib/components';
	import FinancingPlanForm from './_components/FinancingPlanForm.svelte';
	import FinancingPlansList from './_components/FinancingPlansList.svelte';
	import { createPlansListStore } from '$lib/composables';
	import { loadLoans } from '$lib/services';

	const siteName = 'Calcul Prêt';
	const siteUrl = 'https://www.calcul-pret.com';
	const pageTitle = 'Plans de financement multi-prêts | Calcul-pret.com';
	const pageDescription =
		"Comparez, optimisez et exportez vos plans de financement multi-prêts avec amortissement détaillé et alertes d'optimisation.";

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: pageTitle,
		description: pageDescription,
		url: `${siteUrl}/plans`,
		publisher: {
			'@type': 'Organization',
			name: siteName,
			logo: {
				'@type': 'ImageObject',
				url: `${siteUrl}/icon-512.png`
			}
		}
	};

	const savedLoans = loadLoans();
	const plansStore = createPlansListStore();

	$effect(() => {
		plansStore.refresh();
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<link rel="canonical" href={`${siteUrl}/plans`} />
	<meta name="description" content={pageDescription} />
	<meta name="robots" content="index, follow" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={`${siteUrl}/plans`} />
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
	<Navigation currentPage="plans" />

	<div class="container">
		<header class="page-hero">
			<h1>Plans de Financement</h1>
			<p class="hero-subtitle">Gérez et optimisez vos plans de financement multi-prêts</p>
		</header>

		{#if savedLoans.length === 0}
			<!-- État vide -->
			<PageSection title="Commencer" icon="📋">
				<EmptyState
					title="Aucun plan de financement"
					description="Créez votre premier plan en combinant plusieurs prêts depuis la page du calculateur."
					icon="📋"
					buttonText="← Aller au calculateur"
					buttonHref="/"
				/>
			</PageSection>
		{:else}
			<!-- Formulaire de création de plan -->
			<PageSection
				title="Créer un plan"
				subtitle="Combinez plusieurs prêts pour créer un plan"
				icon="➕"
				collapsible={true}
				defaultExpanded={false}
			>
				<FinancingPlanForm />
			</PageSection>

			<!-- Liste des plans -->
			<PageSection title="Mes plans" subtitle="{$plansStore.length} plan(s) créé(s)" icon="📋">
				<FinancingPlansList />
			</PageSection>
		{/if}
		<!-- Guide d'utilisation -->
		<PageSection
			title="Comment ça marche ?"
			subtitle="Guide d'utilisation"
			icon="💡"
			variant="secondary"
			collapsible={true}
			defaultExpanded={false}
		>
			<div class="guide-content">
				<div class="guide-step">
					<span class="step-number">1</span>
					<div>
						<h4>Créez vos prêts</h4>
						<p>Allez sur le calculateur et créez plusieurs prêts que vous souhaitez combiner.</p>
					</div>
				</div>
				<div class="guide-step">
					<span class="step-number">2</span>
					<div>
						<h4>Créez un plan</h4>
						<p>Sélectionnez plusieurs prêts et donnez un nom à votre plan de financement.</p>
					</div>
				</div>
				<div class="guide-step">
					<span class="step-number">3</span>
					<div>
						<h4>Analysez et optimisez</h4>
						<p>
							Consultez le tableau d'amortissement et comparez avec la version optimisée pour
							économiser sur les intérêts.
						</p>
					</div>
				</div>
				<div class="guide-step">
					<span class="step-number">4</span>
					<div>
						<h4>Exportez vos données</h4>
						<p>Téléchargez vos plans en format CSV pour les utiliser dans d'autres outils.</p>
					</div>
				</div>
			</div>
		</PageSection>
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

	.guide-content {
		padding: 1rem 0;
	}

	.guide-step {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: #f8fafe;
		border-radius: 8px;
		border-left: 4px solid #667eea;
	}

	.step-number {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		flex-shrink: 0;
	}

	.guide-step h4 {
		margin: 0 0 0.25rem 0;
		color: #1a202c;
		font-size: 1.125rem;
	}

	.guide-step p {
		margin: 0;
		color: #718096;
		line-height: 1.6;
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

		.guide-step {
			padding: 0.75rem;
		}

		.step-number {
			width: 1.75rem;
			height: 1.75rem;
			font-size: 0.875rem;
		}

		.guide-step h4 {
			font-size: 1rem;
		}
	}
</style>
