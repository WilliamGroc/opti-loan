<script lang="ts">
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import { onMount } from 'svelte';
	import type { SavedLoan, MonthlyPaymentPeriod } from '$lib/services';
	import { calculateLoan as calculateLoanService } from '$lib/services';
	import { createLoansListStore } from '$lib/composables';
	import {
		LoanForm,
		SavedLoansList,
		ResultsCards,
		FinancingPlanForm,
		FinancingPlansList,
		ParameterImpactAnalysis
	} from '$lib/components';

	const siteName = 'Calcul Prêt';
	const siteUrl = 'https://www.calcul-pret.com';
	const pageTitle = 'Calculateur de prêt immobilier | Calcul-pret.com';
	const pageDescription =
		"Calculez vos mensualités, intérêts et tableaux d'amortissement en quelques secondes et optimisez vos plans de financement.";

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

	const loansStore = createLoansListStore();
	let loanName = '';

	let hiddenAmortization = true;

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

	onMount(() => {
		loansStore.refresh();
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

<div class="container">
	<div class="page-header">
		<h1>Calculateur de Prêt</h1>
		<nav class="nav-links">
			<a
				href="/estimation"
				class="btn-nav btn-estimation"
				title="Estimer le coût global d'un projet"
			>
				🏠 Estimation
			</a>
			<a href="/plans" class="btn-nav" title="Voir les plans de financement"> 📋 Mes Plans </a>
			<a
				href="mailto:william.groc@gmail.com?subject=Feedback%20OptiLoan"
				class="btn-nav btn-feedback"
				title="Envoyer un feedback"
			>
				💬 Feedback
			</a>
			<a
				href="https://www.paypal.com/paypalme/grocwilliam"
				target="_blank"
				rel="noopener noreferrer"
				class="btn-nav btn-donate"
				title="Faire un don"
			>
				❤️ Donation
			</a>
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

	<SavedLoansList onLoad={loadLoan} />

	<ResultsCards {monthlyPayment} {totalCost} {totalInterest} {durationYears} />

	<ParameterImpactAnalysis
		baseAmount={amount}
		baseAnnualRate={annualRate}
		baseDurationYears={durationYears}
		{startDate}
		{calculationMode}
		{paymentPeriods}
	/>

	<div class="financing-plan">
		<h2>Plan de Financement</h2>

		<FinancingPlanForm />

		<FinancingPlansList />
	</div>

	<div class="amortization">
		<div class="flex justify-between">
			<h2>Tableau d'amortissement</h2>
			<button on:click={() => (hiddenAmortization = !hiddenAmortization)}>
				{#if hiddenAmortization}👁️ Montrer{:else}🙈 Cacher{/if}
			</button>
		</div>
		{#if hiddenAmortization}
			<p>Cliquez sur "Montrer" pour afficher le tableau d'amortissement.</p>
		{:else}
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

	.btn-feedback {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
	}

	.btn-feedback:hover {
		background: linear-gradient(135deg, #059669 0%, #047857 100%);
	}

	.btn-estimation {
		background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
		color: white;
	}

	.btn-estimation:hover {
		background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
	}

	.btn-donate {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		color: white;
	}

	.btn-donate:hover {
		background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
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
			flex-wrap: wrap;
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
