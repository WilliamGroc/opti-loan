<script lang="ts">
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import {
		Button,
		SummaryCard,
		EmptyState,
		AmortizationTable,
		OptimizationAlert,
		LoanComparisonChart
	} from '$lib/components';
	import {
		type FinancingPlan,
		calculatePlanAmortization,
		optimizePlan,
		exportPlanAsCSV
	} from '$lib/services';
	import { createPlansListStore, createPlanAmortizationStore } from '$lib/composables';

	const siteName = 'Calcul Prêt';
	const siteUrl = 'https://www.calcul-pret.com';
	const pageTitle = 'Plans de financement multi-prêts | Calcul-pret.com';
	const pageDescription =
		"Comparez, optimisez et exportez vos plans de financement multi-prêts avec amortissement détaillé et alertes d'optimisation.";

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

	const plansStore = createPlansListStore();
	let selectedPlanIndex = -1;
	let selectedView: 'standard' | 'optimized' = 'standard';
	let showFullTable = false;
	let selectedPlan: FinancingPlan | null = null;
	let amortizationStore: ReturnType<typeof createPlanAmortizationStore> | null = null;

	function handleSelectPlan(index: number, plan: FinancingPlan) {
		if (selectedPlanIndex === index) {
			selectedPlanIndex = -1;
			selectedPlan = null;
			amortizationStore = null;
		} else {
			selectedPlanIndex = index;
			selectedPlan = plan;
			amortizationStore = createPlanAmortizationStore(plan);
			selectedView = 'standard';
			showFullTable = false;
		}
	}

	function handleDeletePlan(index: number) {
		if (confirm('Voulez-vous vraiment supprimer ce plan ?')) {
			plansStore.remove(index);
			if (selectedPlanIndex === index) {
				selectedPlanIndex = -1;
				selectedPlan = null;
				amortizationStore = null;
			}
		}
	}

	function handleClonePlan(plan: FinancingPlan) {
		const newName = prompt('Nom du nouveau plan :', `${plan.name} (copie)`);
		if (newName && newName.trim()) {
			plansStore.clone(plan, newName);
		}
	}

	function handleExportPlan() {
		if (!selectedPlan || !amortizationStore) return;
		const table =
			selectedView === 'optimized'
				? amortizationStore.optimizedTable
				: amortizationStore.standardTable;
		exportPlanAsCSV(selectedPlan, table);
	}

	onMount(() => {
		plansStore.refresh();
	});

	// Variables réactives calculées
	$: currentTable = amortizationStore
		? selectedView === 'optimized'
			? amortizationStore.optimizedTable
			: amortizationStore.standardTable
		: [];
	$: currentSummary = amortizationStore ? get(amortizationStore.summary) : null;
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

<div class="container">
	<div class="header">
		<h1>Plans de Financement</h1>
		<a href="/" class="btn-back">← Retour au calculateur</a>
	</div>

	<div class="plans-page">
		{#if $plansStore.length === 0}
			<EmptyState
				title="Aucun plan de financement"
				description="Créez votre premier plan depuis la page du calculateur en sélectionnant plusieurs prêts."
				icon="📋"
				buttonText="Aller au calculateur"
				buttonHref="/"
			/>
		{:else}
			<!-- Instructions pour l'utilisateur -->
			<div class="user-guide">
				<div class="guide-card">
					<span class="guide-icon">💡</span>
					<div class="guide-content">
						<h3>Comment utiliser cette page ?</h3>
						<ol>
							<li><strong>Sélectionnez un plan</strong> en cliquant sur "📊 Voir les détails"</li>
							<li><strong>Consultez</strong> le résumé et le tableau d'amortissement standard</li>
							<li>
								<strong>Comparez</strong> avec la version optimisée pour économiser sur les intérêts
							</li>
							<li><strong>Exportez</strong> vos données en CSV si besoin</li>
						</ol>
					</div>
				</div>
			</div>

			<div class="plans-stats">
				<SummaryCard label="Plans créés" value={$plansStore.length.toString()} />
				<SummaryCard
					label="Prêts totaux"
					value={$plansStore.reduce((sum, p) => sum + p.selectedLoans.length, 0).toString()}
				/>
				<SummaryCard
					label="Montant total financé"
					value="{$plansStore
						.reduce((sum, p) => sum + p.selectedLoans.reduce((s, l) => s + l.amount, 0), 0)
						.toLocaleString('fr-FR')} €"
				/>
			</div>

			<div class="plans-container">
				{#each $plansStore as plan, index}
					<div class="plan-card" class:expanded={selectedPlanIndex === index}>
						<div class="plan-header">
							<div class="plan-title">
								<h2>{plan.name}</h2>
								<p class="plan-meta">
									{plan.selectedLoans.length} prêt{plan.selectedLoans.length > 1 ? 's' : ''} · Créé le
									{format(new Date(plan.createdDate), 'dd/MM/yyyy', { locale: fr })}
								</p>
							</div>
							<div class="plan-actions">
								<Button
									variant={selectedPlanIndex === index ? 'secondary' : 'primary'}
									on:click={() => handleSelectPlan(index, plan)}
								>
									{selectedPlanIndex === index ? '✕ Fermer' : '📊 Voir les détails'}
								</Button>
								<Button variant="secondary" on:click={() => handleClonePlan(plan)}>
									📋 Dupliquer
								</Button>
								<Button variant="danger" on:click={() => handleDeletePlan(index)}>🗑️</Button>
							</div>
						</div>

						<div class="plan-quick-summary">
							<div class="quick-stat">
								<span class="stat-label">Montant total</span>
								<span class="stat-value"
									>{plan.selectedLoans
										.reduce((sum, loan) => sum + loan.amount, 0)
										.toLocaleString('fr-FR')} €</span
								>
							</div>
							<div class="quick-stat">
								<span class="stat-label">Mensualité totale</span>
								<span class="stat-value highlight"
									>{plan.selectedLoans
										.reduce((sum, loan) => sum + loan.monthlyPayment, 0)
										.toFixed(2)} €/mois</span
								>
							</div>
							<div class="quick-stat">
								<span class="stat-label">Durée max</span>
								<span class="stat-value"
									>{Math.max(...plan.selectedLoans.map((l) => l.durationYears))} ans</span
								>
							</div>
						</div>

						{#if selectedPlanIndex === index && amortizationStore}
							<div class="plan-details">
								<!-- Onglets de navigation -->
								<div class="tabs">
									<button
										class="tab"
										class:active={selectedView === 'standard'}
										on:click={() => (selectedView = 'standard')}
									>
										📋 Vue Standard
									</button>
									<button
										class="tab"
										class:active={selectedView === 'optimized'}
										on:click={() => (selectedView = 'optimized')}
									>
										⚡ Vue Optimisée
										{#if amortizationStore.savings > 0}
											<span class="savings-badge">-{amortizationStore.savings.toFixed(0)} €</span>
										{/if}
									</button>
								</div>

								<!-- Résumé selon la vue -->
								{#if currentSummary}
									<div class="detail-summary">
										<SummaryCard
											label="Durée totale"
											value="{currentSummary.durationYears} ans ({currentSummary.durationMonths} mois)"
										/>
										<SummaryCard
											label="Intérêts totaux"
											value="{currentSummary.totalInterest.toLocaleString('fr-FR')} €"
											variant={selectedView === 'optimized' ? 'savings' : 'default'}
										/>
										<SummaryCard
											label="Coût total"
											value="{currentSummary.totalCost.toLocaleString('fr-FR')} €"
										/>
									</div>
								{/if}

								<!-- Alerte d'optimisation -->
								{#if selectedView === 'optimized' && amortizationStore.savings > 0}
									<OptimizationAlert savings={amortizationStore.savings} />
									<div class="info-box">
										<strong>💡 Méthode Avalanche</strong>
										<p>
											L'optimisation priorise le remboursement des prêts avec les taux les plus
											élevés. Après avoir payé tous les intérêts mensuels, le budget restant est
											alloué au prêt le plus coûteux, minimisant ainsi les intérêts totaux.
										</p>
									</div>
								{/if}

								<!-- Détails des prêts -->
								<div class="loans-detail">
									<h3>Détail des prêts</h3>
									<div class="loans-table-wrapper">
										<table class="loans-table">
											<thead>
												<tr>
													<th>Prêt</th>
													<th>Montant</th>
													<th>Taux</th>
													<th>Durée</th>
													<th>Mensualité</th>
												</tr>
											</thead>
											<tbody>
												{#each plan.selectedLoans as loan}
													<tr>
														<td class="loan-name">{loan.name}</td>
														<td>{loan.amount.toLocaleString('fr-FR')} €</td>
														<td>{loan.annualRate}%</td>
														<td>{loan.durationYears} ans</td>
														<td class="highlight">{loan.monthlyPayment.toFixed(2)} €</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								</div>

								<!-- Actions -->
								<div class="action-buttons">
									<Button variant="info" on:click={handleExportPlan}>📥 Exporter en CSV</Button>
								</div>

								<!-- Graphique et tableau -->
								{#if currentTable.length > 0}
									<LoanComparisonChart data={currentTable} />

									<div class="table-section">
										<div class="table-header">
											<h3>Tableau d'amortissement détaillé</h3>
											<Button
												variant="secondary"
												size="sm"
												on:click={() => (showFullTable = !showFullTable)}
											>
												{showFullTable ? '👁️ Vue résumée' : '📋 Tout afficher'}
											</Button>
										</div>
										<AmortizationTable
											data={currentTable}
											showFull={showFullTable}
											variant={selectedView === 'optimized' ? 'optimized' : 'default'}
											onToggleFull={() => (showFullTable = !showFullTable)}
										/>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
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

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	h1 {
		color: white;
		margin: 0;
		font-size: 2.5rem;
	}

	.btn-back {
		background: white;
		color: #667eea;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s;
		display: inline-block;
	}

	.btn-back:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.plans-page {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	}

	/* Guide utilisateur */
	.user-guide {
		margin-bottom: 2rem;
	}

	.guide-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		gap: 1.5rem;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}

	.guide-icon {
		font-size: 3rem;
		flex-shrink: 0;
	}

	.guide-content h3 {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
	}

	.guide-content ol {
		margin: 0;
		padding-left: 1.5rem;
		line-height: 1.8;
	}

	.guide-content strong {
		font-weight: 600;
	}

	/* Statistiques */
	.plans-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	/* Conteneur des plans */
	.plans-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.plan-card {
		background: white;
		border: 2px solid #e0e0e0;
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.3s ease;
	}

	.plan-card:hover {
		border-color: #1976d2;
		box-shadow: 0 4px 16px rgba(25, 118, 210, 0.15);
	}

	.plan-card.expanded {
		border-color: #1976d2;
		box-shadow: 0 8px 24px rgba(25, 118, 210, 0.2);
	}

	/* En-tête du plan */
	.plan-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.plan-title h2 {
		margin: 0 0 0.5rem 0;
		color: #1976d2;
	}

	.plan-meta {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
	}

	.plan-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	/* Résumé rapide */
	.plan-quick-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
		margin-top: 1rem;
	}

	.quick-stat {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.stat-label {
		font-size: 0.85rem;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-value {
		font-size: 1.1rem;
		font-weight: 600;
		color: #333;
	}

	.stat-value.highlight {
		color: #1976d2;
		font-size: 1.25rem;
	}

	/* Détails du plan */
	.plan-details {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 2px solid #e0e0e0;
	}

	/* Onglets */
	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 2px solid #e0e0e0;
	}

	.tab {
		padding: 0.75rem 1.5rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
		color: #666;
		border-bottom: 3px solid transparent;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.tab:hover {
		background: #f5f5f5;
		color: #333;
	}

	.tab.active {
		color: #1976d2;
		border-bottom-color: #1976d2;
		background: #f8f9fa;
	}

	.savings-badge {
		background: #4caf50;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 600;
	}

	/* Résumé détaillé */
	.detail-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin: 1.5rem 0;
	}

	/* Encadré d'information */
	.info-box {
		background: #e3f2fd;
		border-left: 4px solid #1976d2;
		padding: 1rem;
		border-radius: 4px;
		margin: 1rem 0;
	}

	.info-box strong {
		display: block;
		margin-bottom: 0.5rem;
		color: #1976d2;
	}

	.info-box p {
		margin: 0;
		line-height: 1.6;
		color: #555;
	}

	/* Détail des prêts */
	.loans-detail {
		margin: 1.5rem 0;
	}

	.loans-detail h3 {
		margin-bottom: 1rem;
		color: #333;
	}

	.loans-table-wrapper {
		overflow-x: auto;
	}

	.loans-table {
		width: 100%;
		border-collapse: collapse;
		background: white;
		border-radius: 8px;
		overflow: hidden;
	}

	.loans-table th {
		background: #f5f5f5;
		padding: 0.75rem;
		text-align: left;
		font-weight: 600;
		color: #333;
		border-bottom: 2px solid #e0e0e0;
	}

	.loans-table td {
		padding: 0.75rem;
		border-bottom: 1px solid #f0f0f0;
	}

	.loans-table tr:last-child td {
		border-bottom: none;
	}

	.loans-table tr:hover {
		background: #fafafa;
	}

	.loan-name {
		font-weight: 500;
		color: #1976d2;
	}

	/* Boutons d'action */
	.action-buttons {
		display: flex;
		gap: 1rem;
		margin: 1.5rem 0;
		flex-wrap: wrap;
	}

	/* Section tableau */
	.table-section {
		margin: 2rem 0;
	}

	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.table-header h3 {
		margin: 0;
		color: #333;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		.plans-page {
			padding: 1rem;
		}

		.plan-header {
			flex-direction: column;
		}

		.plan-actions {
			width: 100%;
		}

		.guide-card {
			flex-direction: column;
			text-align: center;
		}

		.tabs {
			flex-direction: column;
		}

		.tab {
			width: 100%;
			justify-content: center;
		}

		.loans-table-wrapper {
			overflow-x: scroll;
		}

		h1 {
			font-size: 2rem;
		}

		.action-buttons {
			flex-direction: column;
		}
	}
</style>
