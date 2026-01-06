<script lang="ts">
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import { onMount } from 'svelte';
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
		type AmortizationRow,
		loadFinancingPlans,
		deleteFinancingPlan,
		clonePlan as clonePlanService,
		addFinancingPlan,
		calculatePlanAmortization,
		optimizePlan,
		exportPlanAsCSV
	} from '$lib/services';

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

	let financingPlans: FinancingPlan[] = [];
	let selectedPlanIndex = -1;
	let showFullAmortizationTable = false;
	let showFullOptimizedTable = false;
	let planAmortizationTable: AmortizationRow[] = [];
	let optimizedPlanAmortizationTable: AmortizationRow[] = [];
	let showOptimizedPlan = false;
	let optimizationSavings = 0;
	let showPlanAmortizationTable = false;

	// Delete financing plan
	function handleDeletePlan(index: number) {
		if (confirm('Voulez-vous vraiment supprimer ce plan ?')) {
			financingPlans = deleteFinancingPlan(financingPlans, index);
		}
	}

	// Handle calculating amortization
	function handleCalculateAmortization(plan: FinancingPlan) {
		planAmortizationTable = calculatePlanAmortization(plan);
		showPlanAmortizationTable = true;
	}

	// Handle exporting plan
	function handleExportPlan(plan: FinancingPlan) {
		const amortization = calculatePlanAmortization(plan);
		exportPlanAsCSV(plan, amortization);
	}

	// Handle cloning plan
	function handleClonePlan(plan: FinancingPlan) {
		const newName = prompt('Nom du nouveau plan :', `${plan.name} (copie)`);
		if (!newName || !newName.trim()) {
			return;
		}

		const clonedPlan = clonePlanService(plan, newName);
		financingPlans = addFinancingPlan(financingPlans, clonedPlan);
		alert('Plan cloné avec succès !');
	}

	// Handle optimizing plan
	function handleOptimizePlan(plan: FinancingPlan) {
		try {
			console.log('Optimisation du plan:', plan);
			const { table, savings } = optimizePlan(plan);
			console.log('Résultat optimisation:', { table, savings });
			optimizedPlanAmortizationTable = table;
			optimizationSavings = savings;
			showOptimizedPlan = true;
			showPlanAmortizationTable = false;
			console.log('showOptimizedPlan mis à jour:', showOptimizedPlan);
		} catch (error) {
			console.error("Erreur lors de l'optimisation:", error);
			alert("Une erreur s'est produite lors de l'optimisation du plan");
		}
	}

	onMount(() => {
		financingPlans = loadFinancingPlans();
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

<div class="container">
	<div class="header">
		<h1>Plans de Financement</h1>
		<a href="/" class="btn-back">← Retour au calculateur</a>
	</div>

	{#if financingPlans.length === 0}
		<EmptyState
			title="Aucun plan de financement"
			description="Créez votre premier plan depuis la page du calculateur en sélectionnant plusieurs prêts."
			icon="📋"
			buttonText="Aller au calculateur"
			buttonHref="/"
		/>
	{:else}
		<div class="plans-stats">
			<SummaryCard label="Plans créés" value={financingPlans.length.toString()} />
			<SummaryCard
				label="Prêts totaux"
				value={financingPlans.reduce((sum, p) => sum + p.selectedLoans.length, 0).toString()}
			/>
			<SummaryCard
				label="Montant total financé"
				value="{financingPlans
					.reduce((sum, p) => sum + p.selectedLoans.reduce((s, l) => s + l.amount, 0), 0)
					.toLocaleString('fr-FR')} €"
			/>
		</div>

		<div class="plans-container">
			{#each financingPlans as plan, index}
				<div class="plan-section">
					<div class="plan-header">
						<div class="plan-title">
							<h2>{plan.name}</h2>
							<p class="plan-date">
								Créé le {format(new Date(plan.createdDate), 'dd/MM/yyyy HH:mm', { locale: fr })}
							</p>
						</div>
						<div class="plan-actions">
							<Button variant="secondary" on:click={() => handleClonePlan(plan)}>📋 Cloner</Button>
							<Button variant="danger" on:click={() => handleDeletePlan(index)}>
								🗑️ Supprimer
							</Button>
						</div>
					</div>

					<div class="plan-loans">
						<h3>Prêts inclus ({plan.selectedLoans.length})</h3>
						<div class="loans-table">
							<table>
								<thead>
									<tr>
										<th>Prêt</th>
										<th>Montant</th>
										<th>Taux</th>
										<th>Durée</th>
										<th>Mensualité</th>
										<th>Date de départ</th>
									</tr>
								</thead>
								<tbody>
									{#each plan.selectedLoans as loan}
										<tr>
											<td class="loan-name">{loan.name}</td>
											<td>{loan.amount.toLocaleString('fr-FR')} €</td>
											<td>{loan.annualRate} %</td>
											<td>{loan.durationYears} ans</td>
											<td class="highlight">{loan.monthlyPayment.toFixed(2)} €</td>
											<td>{format(new Date(loan.startDate), 'dd/MM/yyyy', { locale: fr })}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<div class="plan-summary">
						<h3>Résumé du plan</h3>
						<div class="summary-grid">
							<SummaryCard
								label="Montant total"
								value="{plan.selectedLoans
									.reduce((sum, loan) => sum + loan.amount, 0)
									.toLocaleString('fr-FR')} €"
							/>
							<SummaryCard
								label="Mensualité totale"
								value="{plan.selectedLoans
									.reduce((sum, loan) => sum + loan.monthlyPayment, 0)
									.toFixed(2)} €"
							/>
							<SummaryCard
								label="Durée max"
								value="{Math.max(...plan.selectedLoans.map((l) => l.durationYears))} ans"
							/>
						</div>
					</div>

					<div class="plan-details-section">
						<button
							on:click={() => {
								selectedPlanIndex = selectedPlanIndex === index ? -1 : index;
								if (selectedPlanIndex !== -1) {
									handleCalculateAmortization(plan);
								}
							}}
							class="btn-expand"
						>
							{selectedPlanIndex === index
								? "▼ Masquer le tableau d'amortissement"
								: "▶ Voir le tableau d'amortissement"}
						</button>

						{#if selectedPlanIndex === index}
							<div class="amortization-detail">
								<div class="detail-summary">
									<SummaryCard
										label="Mensualité moyenne"
										value="{(
											planAmortizationTable.reduce((sum, row) => sum + row.totalMonthlyPayment, 0) /
											Math.max(planAmortizationTable.length, 1)
										).toFixed(2)} €"
									/>
									<SummaryCard
										label="Intérêts totaux"
										value="{planAmortizationTable
											.reduce((sum, row) => sum + row.totalInterest, 0)
											.toFixed(2)} €"
									/>
									<SummaryCard
										label="Durée du plan"
										value="{Math.ceil(
											planAmortizationTable.length / 12
										)} ans ({planAmortizationTable.length} mois)"
									/>
									<SummaryCard
										label="Coût total"
										value="{(planAmortizationTable[planAmortizationTable.length - 1]
											?.totalMonthlyPayment ?? 0) > 0
											? (
													plan.selectedLoans.reduce((sum, l) => sum + l.amount, 0) +
													planAmortizationTable.reduce((sum, row) => sum + row.totalInterest, 0)
												).toLocaleString('fr-FR')
											: '0'} €"
										variant="default"
									/>
								</div>

								<div class="action-buttons">
									<Button variant="info" on:click={() => handleExportPlan(plan)}>
										📥 Exporter en CSV
									</Button>
									<Button variant="success" on:click={() => handleOptimizePlan(plan)}>
										⚡ Optimiser le plan
									</Button>
								</div>

								<Button
									variant="secondary"
									on:click={() => (showPlanAmortizationTable = !showPlanAmortizationTable)}
								>
									{showPlanAmortizationTable ? 'Masquer' : 'Afficher'} le tableau d'amortissement
								</Button>

								{#if showPlanAmortizationTable && selectedPlanIndex === index}
									<LoanComparisonChart data={planAmortizationTable} />
									<AmortizationTable
										data={planAmortizationTable}
										showFull={showFullAmortizationTable}
										variant="default"
										onToggleFull={() => (showFullAmortizationTable = !showFullAmortizationTable)}
									/>
								{/if}

								{#if showOptimizedPlan && selectedPlanIndex === index}
									<div class="optimization-section">
										<h5>Plan Optimisé</h5>
										<OptimizationAlert savings={optimizationSavings} />

										<div class="detail-summary">
											<SummaryCard
												label="Intérêts originaux"
												value="{planAmortizationTable
													.reduce((sum, row) => sum + row.totalInterest, 0)
													.toFixed(2)} €"
											/>
											<SummaryCard
												label="Intérêts optimisés"
												value="{optimizedPlanAmortizationTable
													.reduce((sum, row) => sum + row.totalInterest, 0)
													.toFixed(2)} €"
												variant="optimized"
											/>
											<SummaryCard
												label="Économie"
												value="-{optimizationSavings.toFixed(2)} €"
												variant="savings"
											/>
										</div>

										<div class="comparison-note">
											<strong>💡 Comment ça marche ?</strong>
											<p>
												L'optimisation utilise la méthode "avalanche" : chaque mois, après avoir
												payé les intérêts de tous les prêts, le reste de votre budget est alloué en
												priorité au prêt avec le taux d'intérêt le plus élevé. Cette stratégie
												minimise les intérêts totaux.
											</p>
										</div>

										<LoanComparisonChart data={optimizedPlanAmortizationTable} />

										<AmortizationTable
											data={optimizedPlanAmortizationTable}
											showFull={showFullOptimizedTable}
											variant="optimized"
											onToggleFull={() => (showFullOptimizedTable = !showFullOptimizedTable)}
										/>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
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
		flex-wrap: wrap;
		gap: 1rem;
	}

	h1 {
		color: white;
		font-size: 2.5rem;
		margin: 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
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

	.plans-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.plans-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.plan-section {
		background: white;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.plan-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.plan-title h2 {
		margin: 0;
		font-size: 1.8rem;
	}

	.plan-date {
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.9rem;
		margin: 0.5rem 0 0 0;
	}

	.plan-actions {
		display: flex;
		gap: 0.5rem;
	}

	.plan-loans,
	.plan-summary {
		padding: 2rem;
		border-bottom: 1px solid #e0e0e0;
	}

	.plan-loans h3,
	.plan-summary h3 {
		color: #333;
		margin: 0 0 1.5rem 0;
	}

	.loans-table {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: #f5f5f5;
	}

	th {
		padding: 1rem;
		text-align: left;
		color: #333;
		font-weight: 600;
		border-bottom: 2px solid #e0e0e0;
	}

	td {
		padding: 1rem;
		border-bottom: 1px solid #e0e0e0;
	}

	tr:hover {
		background: #fafafa;
	}

	.loan-name {
		font-weight: 600;
		color: #667eea;
	}

	td.highlight {
		background: #f0f0ff;
		font-weight: 600;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.plan-details-section {
		padding: 2rem;
	}

	.btn-expand {
		width: 100%;
		padding: 1rem;
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-expand:hover {
		background: #667eea;
		color: white;
	}

	.amortization-detail {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 2px solid #e0e0e0;
	}

	.detail-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: 2rem;
	}

	.optimization-section {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 3px solid #28a745;
	}

	.optimization-section h5 {
		color: #28a745;
		font-size: 1.2rem;
		margin: 0 0 1rem 0;
	}

	.comparison-note {
		background: #f8f9fa;
		border-left: 4px solid #667eea;
		padding: 1rem 1.5rem;
		margin-bottom: 1.5rem;
		border-radius: 4px;
	}

	.comparison-note strong {
		color: #667eea;
		display: block;
		margin-bottom: 0.5rem;
	}

	.comparison-note p {
		color: #555;
		margin: 0;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.header {
			flex-direction: column;
			align-items: stretch;
		}

		.btn-back {
			width: 100%;
			text-align: center;
		}

		.plan-header {
			flex-direction: column;
			align-items: stretch;
		}

		.plan-loans,
		.plan-summary,
		.plan-details-section {
			padding: 1rem;
		}

		.loans-table {
			font-size: 0.8rem;
		}

		th,
		td {
			padding: 0.5rem;
			font-size: 0.8rem;
		}

		.summary-grid,
		.detail-summary {
			grid-template-columns: 1fr;
		}

		.btn-expand {
			padding: 0.75rem;
		}

		.action-buttons {
			flex-direction: column;
		}
	}
</style>
