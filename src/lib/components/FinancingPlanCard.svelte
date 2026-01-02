<script lang="ts">
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import type { FinancingPlan } from '$lib/services';
	import { calculatePlanAmortization } from '$lib/services';

	export let plan: FinancingPlan;
	export let index: number;
	export let onDelete: (index: number) => void;

	let selectedPlanIndex = -1;
	let planAmortizationTable: Array<{
		month: number;
		date: Date;
		loansData: Array<{ name: string; monthlyPayment: number; principal: number; interest: number }>;
		totalMonthlyPayment: number;
		totalPrincipal: number;
		totalInterest: number;
		totalRemaining: number;
	}> = [];

	function handleViewDetails() {
		selectedPlanIndex = selectedPlanIndex === index ? -1 : index;
		if (selectedPlanIndex !== -1) {
			planAmortizationTable = calculatePlanAmortization(plan);
		}
	}
</script>

<div class="plan-card">
	<div class="plan-card-header">
		<h4>{plan.name}</h4>
		<button on:click={() => onDelete(index)} class="btn-delete" title="Supprimer"> 🗑️ </button>
	</div>

	<div class="plan-details">
		<div class="plan-detail">
			<span class="label">Nombre de prêts:</span>
			<span class="value">{plan.selectedLoans.length}</span>
		</div>
		<div class="plan-detail">
			<span class="label">Montant total:</span>
			<span class="value highlight"
				>{plan.selectedLoans
					.reduce((sum, loan) => sum + loan.amount, 0)
					.toLocaleString('fr-FR')} €</span
			>
		</div>
		<div class="plan-detail">
			<span class="label">Créé le:</span>
			<span class="value"
				>{format(new Date(plan.createdDate), 'dd/MM/yyyy HH:mm', {
					locale: fr
				})}</span
			>
		</div>
	</div>

	<div class="plan-loans-list">
		<h5>Prêts inclus:</h5>
		<ul>
			{#each plan.selectedLoans as loan}
				<li>
					{loan.name} - {loan.amount.toLocaleString('fr-FR')} € ({loan.durationYears} ans)
				</li>
			{/each}
		</ul>
	</div>

	<button on:click={handleViewDetails} class="btn-view-details">
		{selectedPlanIndex === index ? '▼ Masquer détails' : '▶ Voir détails'}
	</button>

	{#if selectedPlanIndex === index}
		<div class="plan-amortization">
			<h5>Tableau de synthèse du plan</h5>
			<div class="plan-summary">
				<div class="summary-card">
					<span class="label">Mensualité totale moyenne</span>
					<span class="value">
						{(
							planAmortizationTable.reduce((sum, row) => sum + row.totalMonthlyPayment, 0) /
							Math.max(planAmortizationTable.length, 1)
						).toFixed(2)} €
					</span>
				</div>
				<div class="summary-card">
					<span class="label">Total intérêts</span>
					<span class="value">
						{planAmortizationTable
							.reduce((sum, row) => sum + row.totalInterest, 0)
							.toFixed(2)} €
					</span>
				</div>
				<div class="summary-card">
					<span class="label">Durée totale</span>
					<span class="value">
						{Math.ceil(planAmortizationTable.length / 12)} ans
					</span>
				</div>
			</div>

			<div class="table-wrapper">
				<table class="plan-table">
					<thead>
						<tr>
							<th>Mois</th>
							<th>Date</th>
							<th>Mensualité totale</th>
							<th>Capital total</th>
							<th>Intérêts totaux</th>
							<th>Restant dû</th>
						</tr>
					</thead>
					<tbody>
						{#each planAmortizationTable as row, i}
							{#if i < 12 || i >= planAmortizationTable.length - 12 || i % 12 === 0}
								<tr>
									<td>{row.month}</td>
									<td>{format(row.date, 'MMM yyyy', { locale: fr })}</td>
									<td>{row.totalMonthlyPayment.toFixed(2)} €</td>
									<td>{row.totalPrincipal.toFixed(2)} €</td>
									<td>{row.totalInterest.toFixed(2)} €</td>
									<td>{row.totalRemaining.toFixed(2)} €</td>
								</tr>
							{:else if i === 12}
								<tr class="ellipsis">
									<td colspan="6">...</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
	.plan-card {
		background: #f8f9fa;
		border: 2px solid #e0e0e0;
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.3s;
	}

	.plan-card:hover {
		border-color: #667eea;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
		transform: translateY(-2px);
	}

	.plan-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.plan-card-header h4 {
		margin: 0;
		color: #333;
	}

	.btn-delete {
		background: transparent;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
		padding: 0.25rem;
	}

	.btn-delete:hover {
		opacity: 1;
	}

	.plan-details {
		margin-bottom: 1rem;
	}

	.plan-detail {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e0e0e0;
	}

	.plan-detail:last-child {
		border-bottom: none;
	}

	.plan-detail .label {
		color: #666;
		font-size: 0.9rem;
	}

	.plan-detail .value {
		color: #333;
		font-weight: 600;
	}

	.plan-detail .value.highlight {
		color: #667eea;
		font-weight: 700;
	}

	.plan-loans-list {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		border: 1px solid #e0e0e0;
	}

	.plan-loans-list h5 {
		margin-top: 0;
		margin-bottom: 0.5rem;
		color: #555;
		font-size: 1rem;
	}

	.plan-loans-list ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.plan-loans-list li {
		padding: 0.5rem 0;
		color: #555;
		font-size: 0.9rem;
		border-bottom: 1px solid #f0f0f0;
	}

	.plan-loans-list li:last-child {
		border-bottom: none;
	}

	.btn-view-details {
		width: 100%;
		padding: 0.75rem;
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-view-details:hover {
		background: #667eea;
		color: white;
	}

	.plan-amortization {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 2px solid #e0e0e0;
	}

	h5 {
		color: #555;
		font-size: 1rem;
		margin-bottom: 0.5rem;
		margin-top: 0;
	}

	.plan-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.summary-card {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.summary-card .label {
		color: #666;
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
	}

	.summary-card .value {
		color: #667eea;
		font-size: 1.3rem;
		font-weight: 700;
	}

	.table-wrapper {
		overflow-x: auto;
	}

	.plan-table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
		font-size: 0.9rem;
	}

	.plan-table th {
		background: #667eea;
		color: white;
		padding: 0.75rem;
		text-align: left;
		font-weight: 600;
	}

	.plan-table td {
		padding: 0.75rem;
		border-bottom: 1px solid #e0e0e0;
	}

	.plan-table tbody tr:hover {
		background: #f5f5f5;
	}

	tr.ellipsis td {
		text-align: center;
		font-weight: bold;
		color: #999;
	}

	@media (max-width: 768px) {
		.plan-summary {
			grid-template-columns: 1fr;
		}

		.summary-card {
			padding: 1rem;
		}
	}
</style>
