<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import { get } from 'svelte/store';
	import {
		Button,
		SummaryCard,
		AmortizationTable,
		OptimizationAlert,
		LoanComparisonChart,
		Navigation,
		PageSection
	} from '$lib/components';
	import {
		getFinancingPlanById,
		deleteFinancingPlanById,
		exportPlanAsCSV,
		exportPlanAsJSON
	} from '$lib/services';
	import { createPlanAmortizationStore } from '$lib/composables';
	import { page } from '$app/state';

	const planId = $derived(page.params.id)!;
	const plan = $derived(getFinancingPlanById(planId));

	let selectedView: 'standard' | 'optimized' = $state('standard');
	let showFullTable = $state(false);

	const amortizationStore = $derived(plan ? createPlanAmortizationStore(plan) : null);
	const currentTable = $derived.by(() => {
		if (!amortizationStore) return [];
		return selectedView === 'optimized'
			? amortizationStore.optimizedTable
			: amortizationStore.standardTable;
	});
	const currentSummary = $derived.by(() => {
		if (!amortizationStore) return null;
		return get(amortizationStore.summary);
	});

	function handleExport() {
		if (!plan || !amortizationStore) return;
		exportPlanAsCSV(plan, currentTable);
	}

	function handleExportJSON() {
		if (!plan || !amortizationStore) return;
		exportPlanAsJSON(plan, currentTable);
	}

	function handleDelete() {
		if (!plan) return;
		if (confirm(`Voulez-vous vraiment supprimer le plan "${plan.name}" ?`)) {
			deleteFinancingPlanById(plan.id);
			goto(resolve('/plans'));
		}
	}

	function toggleView() {
		selectedView = selectedView === 'standard' ? 'optimized' : 'standard';
	}
</script>

<svelte:head>
	<title>{plan ? `${plan.name} | Plans` : 'Plan introuvable'} - Calcul Prêt</title>
</svelte:head>

<div class="app-wrapper">
	<Navigation currentPage="plans" />

	<div class="container">
		{#if !plan}
			<PageSection title="Plan introuvable" icon="⚠️">
				<div class="error-state">
					<p>Le plan de financement demandé n'existe pas ou a été supprimé.</p>
					<Button variant="primary" onclick={() => goto(resolve('/plans'))}>
						← Retour aux plans
					</Button>
				</div>
			</PageSection>
		{:else}
			<!-- Header -->
			<header class="plan-header">
				<div class="header-content">
					<button class="back-button" onclick={() => goto(resolve('/plans'))}>
						← Retour aux plans
					</button>
					<h1>{plan.name}</h1>
					<p class="plan-meta">
						Créé le {format(new Date(plan.createdDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
					</p>
				</div>
				<div class="header-actions">
					<Button variant="danger" onclick={handleDelete}>🗑️ Supprimer</Button>
				</div>
			</header>

			<!-- Prêts inclus -->
			<PageSection title="Prêts inclus" subtitle="{plan.selectedLoans.length} prêt(s)" icon="💰">
				<div class="loans-grid">
					{#each plan.loans as loan (loan.id)}
						<div class="loan-item">
							<h4>{loan.name}</h4>
							<div class="loan-details">
								<div class="detail">
									<span class="label">Montant:</span>
									<span class="value">{loan.amount.toLocaleString('fr-FR')} €</span>
								</div>
								<div class="detail">
									<span class="label">Taux:</span>
									<span class="value">{loan.annualRate.toFixed(2)} %</span>
								</div>
								<div class="detail">
									<span class="label">Durée:</span>
									<span class="value">{loan.durationYears} ans</span>
								</div>
								<div class="detail">
									<span class="label">Mensualité:</span>
									<span class="value">{loan.monthlyPayment.toFixed(2)} €</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</PageSection>

			<!-- Résumé -->
			{#if currentSummary}
				<PageSection title="Résumé du plan" icon="📊">
					<div class="summary-grid">
						<SummaryCard
							label="Coût total"
							value={currentSummary.totalCost.toLocaleString('fr-FR') + ' €'}
						/>
						<SummaryCard
							label="Capital emprunté"
							value={currentSummary.totalPrincipal.toLocaleString('fr-FR') + ' €'}
						/>
						<SummaryCard
							label="Intérêts totaux"
							value={currentSummary.totalInterest.toLocaleString('fr-FR') + ' €'}
						/>
						<SummaryCard label="Durée" value={currentSummary.durationYears + ' ans'} />
					</div>

					<div class="actions-bar">
						<Button
							variant={selectedView === 'standard' ? 'primary' : 'secondary'}
							onclick={toggleView}
						>
							{selectedView === 'standard' ? '📊 Voir optimisé' : '📊 Voir standard'}
						</Button>
						<Button variant="info" onclick={handleExport}>📥 Exporter CSV</Button>
						<Button variant="secondary" onclick={handleExportJSON}>📥 Exporter JSON</Button>
					</div>
				</PageSection>
			{/if}

			<!-- Alerte d'optimisation -->
			{#if amortizationStore && amortizationStore.savings > 0}
				<OptimizationAlert savings={amortizationStore.savings} />
			{/if}

			<!-- Graphique -->
			{#if currentTable.length > 0}
				<PageSection title="Évolution du remboursement" icon="📈">
					<LoanComparisonChart data={currentTable} />
				</PageSection>
			{/if}

			<!-- Tableau d'amortissement -->
			{#if currentTable.length > 0}
				<PageSection
					title="Tableau d'amortissement"
					subtitle="{currentTable.length} mois"
					icon="📋"
				>
					<AmortizationTable
						data={currentTable}
						showFull={showFullTable}
						onToggleFull={() => (showFullTable = !showFullTable)}
					/>
				</PageSection>
			{/if}
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

	.app-wrapper {
		min-height: 100vh;
		padding-bottom: 2rem;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.error-state {
		text-align: center;
		padding: 2rem;
	}

	.error-state p {
		margin-bottom: 1.5rem;
		color: #666;
		font-size: 1.1rem;
	}

	.plan-header {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
	}

	.header-content {
		flex: 1;
	}

	.back-button {
		background: none;
		border: none;
		color: #667eea;
		font-size: 0.9rem;
		cursor: pointer;
		padding: 0.5rem 0;
		margin-bottom: 0.5rem;
		transition: color 0.2s;
	}

	.back-button:hover {
		color: #764ba2;
		text-decoration: underline;
	}

	.plan-header h1 {
		margin: 0;
		font-size: 2rem;
		color: #1a202c;
	}

	.plan-meta {
		margin: 0.5rem 0 0 0;
		color: #718096;
		font-size: 0.9rem;
	}

	.header-actions {
		display: flex;
		gap: 1rem;
	}

	.loans-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.loan-item {
		background: #f8f9fa;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		padding: 1.5rem;
	}

	.loan-item h4 {
		margin: 0 0 1rem 0;
		color: #1a202c;
		font-size: 1.1rem;
	}

	.loan-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.detail {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.detail .label {
		color: #718096;
		font-size: 0.9rem;
	}

	.detail .value {
		font-weight: 600;
		color: #1a202c;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.actions-bar {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
	}

	@media (max-width: 768px) {
		.plan-header {
			flex-direction: column;
		}

		.header-actions {
			width: 100%;
			justify-content: stretch;
		}

		.header-actions :global(button) {
			flex: 1;
		}

		.loans-grid {
			grid-template-columns: 1fr;
		}

		.actions-bar {
			flex-direction: column;
		}

		.actions-bar :global(button) {
			width: 100%;
		}
	}
</style>
