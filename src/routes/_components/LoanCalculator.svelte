<script lang="ts">
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import type { MonthlyPaymentPeriod } from '$lib/services';
	import { calculateLoan as calculateLoanService } from '$lib/services';
	import { createLoansListStore } from '$lib/composables';
	import { PageSection } from '$lib/components';
	import LoanForm from './LoanForm.svelte';
	import ResultsCards from './ResultsCards.svelte';
	import ParameterImpactAnalysis from './ParameterImpactAnalysis.svelte';

	const loansStore = createLoansListStore();

	let amount = $state(200000);
	let annualRate = $state(1.5);
	let durationYears = $state(20);
	let monthlyPayment = $state(0);
	let totalCost = $state(0);
	let totalInterest = $state(0);
	let startDate = $state(format(new Date(), 'yyyy-MM-dd'));
	let calculationMode = $state<'payment' | 'duration' | 'variable'>('payment');
	let paymentPeriods = $state<MonthlyPaymentPeriod[]>([]);
	let loanName = $state('');

	let amortizationTable = $state<
		Array<{
			month: number;
			date: Date;
			monthlyPayment: number;
			principal: number;
			interest: number;
			remaining: number;
		}>
	>([]);

	function handleCalculateLoan() {
		const result = calculateLoanService(
			amount,
			annualRate,
			durationYears,
			monthlyPayment,
			startDate,
			calculationMode,
			paymentPeriods
		);

		monthlyPayment = result.monthlyPayment;
		totalCost = result.totalCost;
		totalInterest = result.totalInterest;
		amortizationTable = result.amortizationTable;
	}

	function handleSaveLoan() {
		if (!loanName.trim()) {
			alert('Veuillez entrer un nom pour ce prêt');
			return;
		}

		loansStore.add({
			name: loanName,
			amount,
			annualRate,
			durationYears,
			monthlyPayment,
			startDate,
			calculationMode,
			paymentPeriods: calculationMode === 'variable' ? [...paymentPeriods] : undefined
		});
		loanName = '';

		// Feedback visuel
		const notification = document.createElement('div');
		notification.className = 'save-notification';
		notification.textContent = '✅ Prêt sauvegardé avec succès !';
		document.body.appendChild(notification);
		setTimeout(() => notification.remove(), 3000);
	}

	$effect(() => {
		handleCalculateLoan();
	});
</script>

<div class="loan-calculator">
	<!-- Formulaire de saisie -->
	<PageSection
		title="Paramètres du prêt"
		subtitle="Configurez les paramètres de votre prêt"
		icon="⚙️"
		variant="primary"
	>
		<LoanForm
			bind:amount
			bind:annualRate
			bind:durationYears
			bind:monthlyPayment
			bind:startDate
			bind:calculationMode
			bind:paymentPeriods
			bind:loanName
			onSaveLoan={handleSaveLoan}
		/>
	</PageSection>

	<!-- Résultats -->
	<PageSection title="Résultats du calcul" subtitle="Mensualité, coût total et intérêts" icon="📊">
		<ResultsCards {monthlyPayment} {totalCost} {totalInterest} {durationYears} />
	</PageSection>

	<!-- Tableau d'amortissement (pliable) -->
	<PageSection
		title="Tableau d'amortissement"
		subtitle="{amortizationTable.length} mensualités détaillées"
		icon="📅"
		collapsible={true}
		defaultExpanded={false}
	>
		<div class="table-wrapper">
			<table class="amortization-table">
				<thead>
					<tr>
						<th>Mois</th>
						<th>Date</th>
						<th>Mensualité</th>
						<th>Capital</th>
						<th>Intérêts</th>
						<th>Restant dû</th>
					</tr>
				</thead>
				<tbody>
					{#each amortizationTable as row, i (row.date.getTime())}
						{#if i < 12 || i >= amortizationTable.length - 12 || i % 12 === 0}
							<tr>
								<td>{row.month}</td>
								<td>{format(row.date, 'MMM yyyy', { locale: fr })}</td>
								<td class="amount">{row.monthlyPayment.toFixed(2)} €</td>
								<td class="amount">{row.principal.toFixed(2)} €</td>
								<td class="amount">{row.interest.toFixed(2)} €</td>
								<td class="amount highlight">{row.remaining.toFixed(2)} €</td>
							</tr>
						{:else if i === 12}
							<tr class="ellipsis">
								<td colspan="6">... ({amortizationTable.length - 24} autres mois)</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</PageSection>

	<ParameterImpactAnalysis
		baseAmount={amount}
		baseAnnualRate={annualRate}
		baseDurationYears={durationYears}
		{startDate}
		{calculationMode}
		{paymentPeriods}
	/>
</div>

<style>
	.loan-calculator {
		max-width: 1000px;
		margin: 0 auto;
	}

	.table-wrapper {
		overflow-x: auto;
		margin-top: 1rem;
	}

	.amortization-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.amortization-table th {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.75rem;
		text-align: left;
		font-weight: 600;
		position: sticky;
		top: 0;
	}

	.amortization-table td {
		padding: 0.625rem 0.75rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.amortization-table tbody tr:hover {
		background: #f9fafb;
	}

	.amortization-table .amount {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.amortization-table .highlight {
		font-weight: 600;
		color: #667eea;
	}

	.ellipsis td {
		text-align: center;
		color: #9ca3af;
		font-style: italic;
		padding: 1rem;
	}

	:global(.save-notification) {
		position: fixed;
		top: 20px;
		right: 20px;
		background: #10b981;
		color: white;
		padding: 1rem 1.5rem;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
		z-index: 1000;
		animation:
			slideIn 0.3s ease,
			slideOut 0.3s ease 2.7s;
	}

	@keyframes slideIn {
		from {
			transform: translateX(400px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slideOut {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(400px);
			opacity: 0;
		}
	}

	@media (max-width: 768px) {
		.amortization-table {
			font-size: 0.75rem;
		}

		.amortization-table th,
		.amortization-table td {
			padding: 0.5rem;
		}
	}
</style>
