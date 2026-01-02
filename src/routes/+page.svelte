<script lang="ts">
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import { onMount } from 'svelte';
	import type { SavedLoan, FinancingPlan, MonthlyPaymentPeriod } from '$lib/services';
	import {
		loadLoans,
		saveLoan as saveLoanService,
		deleteLoan as deleteLoanService,
		cloneLoan as cloneLoanService,
		loadFinancingPlans,
		deleteFinancingPlan as deleteFinancingPlanService,
		calculateLoan as calculateLoanService
	} from '$lib/services';
	import {
		LoanForm,
		SavedLoansList,
		ResultsCards,
		FinancingPlanForm,
		FinancingPlansList
	} from '$lib/components';

	let amount = 200000;
	let annualRate = 1.5;
	let durationYears = 20;
	let monthlyPayment = 0;
	let totalCost = 0;
	let totalInterest = 0;
	let startDate = format(new Date(), 'yyyy-MM-dd');
	let amortizationTable: Array<{
		month: number;
		date: Date;
		monthlyPayment: number;
		principal: number;
		interest: number;
		remaining: number;
	}> = [];

	let calculationMode: 'payment' | 'duration' | 'variable' = 'payment';
	let paymentPeriods: MonthlyPaymentPeriod[] = [];

	let savedLoans: SavedLoan[] = [];
	let loanName = '';

	let financingPlans: FinancingPlan[] = [];

	function handleSaveLoan() {
		if (!loanName.trim()) {
			alert('Veuillez entrer un nom pour ce prêt');
			return;
		}

		savedLoans = saveLoanService(savedLoans, {
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
		alert('Prêt sauvegardé avec succès !');
	}

	function loadLoan(loan: SavedLoan) {
		amount = loan.amount;
		annualRate = loan.annualRate;
		durationYears = loan.durationYears;
		monthlyPayment = loan.monthlyPayment;
		startDate = loan.startDate;
		calculationMode = loan.calculationMode;
		paymentPeriods = loan.paymentPeriods ? [...loan.paymentPeriods] : [];
	}

	function handleDeleteLoan(id: string) {
		if (confirm('Voulez-vous vraiment supprimer ce prêt ?')) {
			savedLoans = deleteLoanService(savedLoans, id);
		}
	}

	function handleCloneLoan(loan: SavedLoan) {
		const newName = prompt('Nom du nouveau prêt :', `${loan.name} (copie)`);
		if (!newName || !newName.trim()) {
			return;
		}

		savedLoans = cloneLoanService(savedLoans, loan, newName);
		alert('Prêt cloné avec succès !');
	}

	function handleDeleteFinancingPlan(index: number) {
		if (confirm('Voulez-vous vraiment supprimer ce plan ?')) {
			financingPlans = deleteFinancingPlanService(financingPlans, index);
		}
	}

	function handlePlanCreated(updatedPlans: FinancingPlan[]) {
		financingPlans = updatedPlans;
	}

	onMount(() => {
		savedLoans = loadLoans();
		financingPlans = loadFinancingPlans();
	});

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

	$: {
		(amount, annualRate, durationYears, monthlyPayment, calculationMode, startDate, paymentPeriods);
		handleCalculateLoan();
	}
</script>

<div class="container">
	<div class="page-header">
		<h1>Calculateur de Prêt</h1>
		<nav class="nav-links">
			<a href="/plans" class="btn-nav" title="Voir les plans de financement"> 📋 Mes Plans </a>
		</nav>
	</div>

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

	<SavedLoansList
		bind:savedLoans
		onLoad={loadLoan}
		onDelete={handleDeleteLoan}
		onClone={handleCloneLoan}
	/>

	<div class="financing-plan">
		<h2>Plan de Financement</h2>

		<FinancingPlanForm
			{savedLoans}
			bind:financingPlans
			onPlanCreated={handlePlanCreated}
		/>

		<FinancingPlansList
			bind:financingPlans
			onDelete={handleDeleteFinancingPlan}
		/>
	</div>

	<ResultsCards {monthlyPayment} {totalCost} {totalInterest} {durationYears} />

	<div class="amortization">
		<h2>Tableau d'amortissement</h2>
		<div class="table-wrapper">
			<table>
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
					{#each amortizationTable as row, i}
						{#if i < 12 || i >= amortizationTable.length - 12 || i % 12 === 0}
							<tr>
								<td>{row.month}</td>
								<td>{format(row.date, 'MMM yyyy', { locale: fr })}</td>
								<td>{row.monthlyPayment.toFixed(2)} €</td>
								<td>{row.principal.toFixed(2)} €</td>
								<td>{row.interest.toFixed(2)} €</td>
								<td>{row.remaining.toFixed(2)} €</td>
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
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		text-align: center;
		color: white;
		font-size: 2.5rem;
		margin: 0 0 2rem 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
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
		white-space: nowrap;
	}

	.btn-nav:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	h2 {
		color: #333;
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.financing-plan {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.amortization {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.table-wrapper {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}

	th {
		background: #667eea;
		color: white;
		padding: 1rem;
		text-align: left;
		font-weight: 600;
	}

	td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e0e0e0;
	}

	tbody tr:hover {
		background: #f5f5f5;
	}

	tr.ellipsis td {
		text-align: center;
		font-weight: bold;
		color: #999;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
		}

		.nav-links {
			justify-content: center;
		}

		.btn-nav {
			width: 100%;
			text-align: center;
		}

		.financing-plan,
		.amortization {
			padding: 1.5rem;
		}

		table {
			font-size: 0.9rem;
		}

		th,
		td {
			padding: 0.5rem;
		}
	}
</style>
