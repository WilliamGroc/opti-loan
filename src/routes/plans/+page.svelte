<script lang="ts">
	import { addMonths, format, parse } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import { onMount } from 'svelte';

	interface MonthlyPaymentPeriod {
		id: string;
		startMonth: number;
		endMonth: number;
		monthlyPayment: number;
	}

	interface SavedLoan {
		id: string;
		name: string;
		amount: number;
		annualRate: number;
		durationYears: number;
		monthlyPayment: number;
		startDate: string;
		calculationMode: 'payment' | 'duration' | 'variable';
		saveDate: string;
		paymentPeriods?: MonthlyPaymentPeriod[];
	}

	interface FinancingPlan {
		name: string;
		selectedLoans: SavedLoan[];
		createdDate: string;
	}

	let financingPlans: FinancingPlan[] = [];
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
	const FINANCING_PLANS_KEY = 'opti-loan-plans';

	// Load financing plans from local storage
	function loadFinancingPlans() {
		if (typeof window !== 'undefined') {
			const data = localStorage.getItem(FINANCING_PLANS_KEY);
			if (data) {
				try {
					financingPlans = JSON.parse(data);
				} catch (e) {
					console.error('Erreur lors du chargement des plans:', e);
					financingPlans = [];
				}
			}
		}
	}

	// Delete financing plan
	function deleteFinancingPlan(index: number) {
		if (confirm('Voulez-vous vraiment supprimer ce plan ?')) {
			financingPlans.splice(index, 1);
			financingPlans = financingPlans;
			localStorage.setItem(FINANCING_PLANS_KEY, JSON.stringify(financingPlans));
		}
	}

	// Calculate combined amortization for financing plan
	function calculatePlanAmortization(plan: FinancingPlan) {
		planAmortizationTable = [];

		// Find the earliest start date and latest end date
		let minStartDate = new Date(plan.selectedLoans[0].startDate);
		let maxEndDate = new Date(plan.selectedLoans[0].startDate);

		plan.selectedLoans.forEach(loan => {
			const start = parse(loan.startDate, 'yyyy-MM-dd', new Date());
			const end = addMonths(start, loan.durationYears * 12);
			if (start < minStartDate) minStartDate = start;
			if (end > maxEndDate) maxEndDate = end;
		});

		// Calculate months between min and max
		const totalMonths = Math.ceil((maxEndDate.getTime() - minStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

		// Create amortization table
		for (let month = 1; month <= totalMonths; month++) {
			const currentDate = addMonths(minStartDate, month);
			let totalMonthlyPayment = 0;
			let totalPrincipal = 0;
			let totalInterest = 0;
			let totalRemaining = 0;
			const loansData: Array<{ name: string; monthlyPayment: number; principal: number; interest: number }> = [];

			plan.selectedLoans.forEach(loan => {
				const loanStartDate = parse(loan.startDate, 'yyyy-MM-dd', new Date());
				const loanStartMonth = Math.round((loanStartDate.getTime() - minStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
				const loanEndMonth = loanStartMonth + loan.durationYears * 12;
				const monthInLoan = month - loanStartMonth;

				if (monthInLoan > 0 && monthInLoan <= loan.durationYears * 12) {
					const monthlyRate = loan.annualRate / 100 / 12;
					
					// Calculate remaining balance at this month
					let remaining = loan.amount;
					let principal = 0;
					let interest = 0;
					let monthlyPaymentForMonth = loan.monthlyPayment;

					// Get monthly payment based on calculation mode
					if (loan.calculationMode === 'variable' && loan.paymentPeriods) {
						const period = loan.paymentPeriods.find(p => monthInLoan >= p.startMonth && monthInLoan <= p.endMonth);
						monthlyPaymentForMonth = period ? period.monthlyPayment : loan.monthlyPayment;
					}

					// Calculate amortization for each month up to current
					for (let m = 1; m <= monthInLoan; m++) {
						let paymentForMonth = monthlyPaymentForMonth;
						if (loan.calculationMode === 'variable' && loan.paymentPeriods) {
							const period = loan.paymentPeriods.find(p => m >= p.startMonth && m <= p.endMonth);
							paymentForMonth = period ? period.monthlyPayment : loan.monthlyPayment;
						}

						const monthInterest = remaining * monthlyRate;
						const monthPrincipal = paymentForMonth - monthInterest;
						remaining -= monthPrincipal;

						if (m === monthInLoan) {
							interest = monthInterest;
							principal = monthPrincipal;
						}
					}

					if (remaining < 0) remaining = 0;

					totalMonthlyPayment += monthlyPaymentForMonth;
					totalPrincipal += principal;
					totalInterest += interest;
					totalRemaining += remaining;

					loansData.push({
						name: loan.name,
						monthlyPayment: monthlyPaymentForMonth,
						principal: principal,
						interest: interest
					});
				}
			});

			if (loansData.length > 0) {
				planAmortizationTable.push({
					month,
					date: currentDate,
					loansData,
					totalMonthlyPayment,
					totalPrincipal,
					totalInterest,
					totalRemaining
				});
			}
		}
	}

	// Export plan as CSV
	function exportPlanAsCSV(plan: FinancingPlan, index: number) {
		calculatePlanAmortization(plan);
		
		let csv = `Plan de Financement: ${plan.name}\n`;
		csv += `Créé le: ${format(new Date(plan.createdDate), 'dd/MM/yyyy HH:mm', { locale: fr })}\n`;
		csv += `\nPrêts inclus:\n`;
		
		plan.selectedLoans.forEach(loan => {
			csv += `- ${loan.name}: ${loan.amount.toLocaleString('fr-FR')} € (${loan.durationYears} ans, ${loan.annualRate}%)\n`;
		});
		
		csv += `\nMois,Date,Mensualité Totale,Capital Total,Intérêts Totaux,Restant Dû\n`;
		
		planAmortizationTable.forEach(row => {
			csv += `${row.month},${format(row.date, 'MMM yyyy', { locale: fr })},${row.totalMonthlyPayment.toFixed(2)},${row.totalPrincipal.toFixed(2)},${row.totalInterest.toFixed(2)},${row.totalRemaining.toFixed(2)}\n`;
		});
		
		const dataBlob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `plan-${plan.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}

	// Clone financing plan
	function clonePlan(plan: FinancingPlan) {
		const newName = prompt('Nom du nouveau plan :', `${plan.name} (copie)`);
		if (!newName || !newName.trim()) {
			return;
		}

		const clonedPlan: FinancingPlan = {
			name: newName.trim(),
			selectedLoans: [...plan.selectedLoans],
			createdDate: new Date().toISOString()
		};

		financingPlans = [clonedPlan, ...financingPlans];
		localStorage.setItem(FINANCING_PLANS_KEY, JSON.stringify(financingPlans));
		alert('Plan cloné avec succès !');
	}

	onMount(() => {
		loadFinancingPlans();
	});
</script>

<div class="container">
	<div class="header">
		<h1>Plans de Financement</h1>
		<a href="/" class="btn-back">← Retour au calculateur</a>
	</div>

	{#if financingPlans.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📋</div>
			<h2>Aucun plan de financement</h2>
			<p>Créez votre premier plan depuis la page du calculateur en sélectionnant plusieurs prêts.</p>
			<a href="/" class="btn-primary">Aller au calculateur</a>
		</div>
	{:else}
		<div class="plans-stats">
			<div class="stat-card">
				<div class="stat-value">{financingPlans.length}</div>
				<div class="stat-label">Plans créés</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{financingPlans.reduce((sum, p) => sum + p.selectedLoans.length, 0)}</div>
				<div class="stat-label">Prêts totaux</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{financingPlans.reduce((sum, p) => sum + p.selectedLoans.reduce((s, l) => s + l.amount, 0), 0).toLocaleString('fr-FR')} €</div>
				<div class="stat-label">Montant total financé</div>
			</div>
		</div>

		<div class="plans-container">
			{#each financingPlans as plan, index}
				<div class="plan-section">
					<div class="plan-header">
						<div class="plan-title">
							<h2>{plan.name}</h2>
							<p class="plan-date">Créé le {format(new Date(plan.createdDate), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
						</div>
						<div class="plan-actions">
							<button
								on:click={() => clonePlan(plan)}
								class="btn-clone"
								title="Cloner ce plan"
							>
								📋 Cloner
							</button>
							<button
								on:click={() => deleteFinancingPlan(index)}
								class="btn-delete"
								title="Supprimer"
							>
								🗑️ Supprimer
							</button>
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
											<td>{format(parse(loan.startDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: fr })}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<div class="plan-summary">
						<h3>Résumé du plan</h3>
						<div class="summary-grid">
							<div class="summary-item">
								<span class="label">Montant total</span>
								<span class="value">{plan.selectedLoans.reduce((sum, loan) => sum + loan.amount, 0).toLocaleString('fr-FR')} €</span>
							</div>
							<div class="summary-item">
								<span class="label">Mensualité totale</span>
								<span class="value">{plan.selectedLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0).toFixed(2)} €</span>
							</div>
							<div class="summary-item">
								<span class="label">Durée max</span>
								<span class="value">{Math.max(...plan.selectedLoans.map(l => l.durationYears))} ans</span>
							</div>
						</div>
					</div>

					<div class="plan-details-section">
						<button
							on:click={() => {
								selectedPlanIndex = selectedPlanIndex === index ? -1 : index;
								if (selectedPlanIndex !== -1) {
									calculatePlanAmortization(plan);
								}
							}}
							class="btn-expand"
						>
							{selectedPlanIndex === index ? '▼ Masquer le tableau d\'amortissement' : '▶ Voir le tableau d\'amortissement'}
						</button>

						{#if selectedPlanIndex === index}
							<div class="amortization-detail">
								<div class="detail-summary">
									<div class="summary-card">
										<span class="label">Mensualité moyenne</span>
										<span class="value">
											{(planAmortizationTable.reduce((sum, row) => sum + row.totalMonthlyPayment, 0) / Math.max(planAmortizationTable.length, 1)).toFixed(2)} €
										</span>
									</div>
									<div class="summary-card">
										<span class="label">Intérêts totaux</span>
										<span class="value">
											{planAmortizationTable.reduce((sum, row) => sum + row.totalInterest, 0).toFixed(2)} €
										</span>
									</div>
									<div class="summary-card">
										<span class="label">Durée du plan</span>
										<span class="value">
											{Math.ceil(planAmortizationTable.length / 12)} ans ({planAmortizationTable.length} mois)
										</span>
									</div>
									<div class="summary-card">
										<span class="label">Coût total</span>
										<span class="value highlight">
											{(planAmortizationTable[planAmortizationTable.length - 1]?.totalMonthlyPayment ?? 0) > 0 
												? (plan.selectedLoans.reduce((sum, l) => sum + l.amount, 0) + planAmortizationTable.reduce((sum, row) => sum + row.totalInterest, 0)).toLocaleString('fr-FR') 
												: '0'} €
										</span>
									</div>
								</div>

								<div class="table-wrapper">
									<table class="amortization-table">
										<thead>
											<tr>
												<th>Mois</th>
												<th>Date</th>
												<th>Mensualité totale</th>
												<th>Capital</th>
												<th>Intérêts</th>
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

								<div class="action-buttons">
									<button on:click={() => exportPlanAsCSV(plan, index)} class="btn-export">
										📥 Exporter en CSV
									</button>
								</div>
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
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, sans-serif;
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

	.empty-state {
		background: white;
		border-radius: 12px;
		padding: 3rem;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-state h2 {
		color: #333;
		margin: 0 0 0.5rem 0;
	}

	.empty-state p {
		color: #666;
		margin: 0 0 1.5rem 0;
	}

	.btn-primary {
		display: inline-block;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.75rem 2rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.plans-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		text-align: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #667eea;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		color: #666;
		font-size: 0.9rem;
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

	.btn-clone,
	.btn-delete {
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		background: white;
		color: #667eea;
	}

	.btn-clone:hover {
		transform: scale(1.05);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.btn-delete:hover {
		background: #ff6b6b;
		color: white;
		transform: scale(1.05);
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

	.summary-item {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1.5rem;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.summary-item .label {
		font-size: 0.9rem;
		opacity: 0.9;
		margin-bottom: 0.5rem;
	}

	.summary-item .value {
		font-size: 1.5rem;
		font-weight: 700;
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

	.summary-card {
		background: #f8f9fa;
		padding: 1.5rem;
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

	.summary-card .value.highlight {
		color: #764ba2;
	}

	.table-wrapper {
		overflow-x: auto;
		margin-bottom: 1.5rem;
	}

	.amortization-table {
		font-size: 0.9rem;
	}

	.amortization-table th {
		background: #667eea;
		color: white;
	}

	.amortization-table td {
		padding: 0.75rem;
	}

	.amortization-table tr.ellipsis td {
		text-align: center;
		font-weight: bold;
		color: #999;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn-export {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-export:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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

		.plan-actions {
			justify-content: stretch;
		}

		.btn-clone,
		.btn-delete {
			flex: 1;
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
		}

		.summary-grid,
		.detail-summary {
			grid-template-columns: 1fr;
		}

		.summary-item {
			padding: 1rem;
		}

		.btn-expand {
			padding: 0.75rem;
		}

		.action-buttons {
			flex-direction: column;
		}

		.btn-export {
			width: 100%;
		}
	}
</style>
