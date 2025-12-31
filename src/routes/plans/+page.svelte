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
	let optimizedPlanAmortizationTable: Array<{
		month: number;
		date: Date;
		loansData: Array<{ name: string; monthlyPayment: number; principal: number; interest: number }>;
		totalMonthlyPayment: number;
		totalPrincipal: number;
		totalInterest: number;
		totalRemaining: number;
	}> = [];
	let showOptimizedPlan = false;
	let optimizationSavings = 0;
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

					// Calculate amortization for each month up to current
					for (let m = 1; m < monthInLoan; m++) {
						let paymentForMonth = loan.monthlyPayment;
						if (loan.calculationMode === 'variable' && loan.paymentPeriods) {
							const period = loan.paymentPeriods.find(p => m >= p.startMonth && m <= p.endMonth);
							paymentForMonth = period ? period.monthlyPayment : loan.monthlyPayment;
						}

						const monthInterest = remaining * monthlyRate;
						const monthPrincipal = paymentForMonth - monthInterest;
						remaining -= monthPrincipal;
					}

					// Now calculate for the current month
					let currentMonthPayment = loan.monthlyPayment;
					if (loan.calculationMode === 'variable' && loan.paymentPeriods) {
						const period = loan.paymentPeriods.find(p => monthInLoan >= p.startMonth && monthInLoan <= p.endMonth);
						currentMonthPayment = period ? period.monthlyPayment : loan.monthlyPayment;
					}

					const interest = remaining * monthlyRate;
					const principal = currentMonthPayment - interest;
					remaining -= principal;

					if (remaining < 0) remaining = 0;

					totalMonthlyPayment += currentMonthPayment;
					totalPrincipal += principal;
					totalInterest += interest;
					totalRemaining += remaining;

					loansData.push({
						name: loan.name,
						monthlyPayment: currentMonthPayment,
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

	// Optimize financing plan using avalanche method (pay highest rate first)
	function optimizePlan(plan: FinancingPlan) {
		optimizedPlanAmortizationTable = [];

		// Find the earliest start date and latest end date
		let minStartDate = new Date(plan.selectedLoans[0].startDate);
		let maxEndDate = new Date(plan.selectedLoans[0].startDate);

		plan.selectedLoans.forEach(loan => {
			const start = parse(loan.startDate, 'yyyy-MM-dd', new Date());
			const end = addMonths(start, loan.durationYears * 12);
			if (start < minStartDate) minStartDate = start;
			if (end > maxEndDate) maxEndDate = end;
		});

		const totalMonths = Math.ceil((maxEndDate.getTime() - minStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

		// Calculate total monthly payment available
		const totalMonthlyBudget = plan.selectedLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);

		// Initialize loan balances
		interface LoanBalance {
			loan: SavedLoan;
			remaining: number;
			startMonth: number;
			endMonth: number;
		}

		const loanBalances: LoanBalance[] = plan.selectedLoans.map(loan => {
			const start = parse(loan.startDate, 'yyyy-MM-dd', new Date());
			const startMonth = Math.round((start.getTime() - minStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
			return {
				loan,
				remaining: loan.amount,
				startMonth,
				endMonth: startMonth + loan.durationYears * 12
			};
		});

		// Create optimized amortization table
		for (let month = 1; month <= totalMonths; month++) {
			const currentDate = addMonths(minStartDate, month);
			let budgetRemaining = totalMonthlyBudget;
			let totalPrincipal = 0;
			let totalInterest = 0;
			let totalRemaining = 0;
			const loansData: Array<{ name: string; monthlyPayment: number; principal: number; interest: number }> = [];

			// Get active loans for this month
			const activeLoans = loanBalances.filter(lb => 
				month > lb.startMonth && month <= lb.endMonth && lb.remaining > 0.01
			);

			if (activeLoans.length === 0) {
				continue;
			}

			// Étape 1: Calculer et payer tous les intérêts
			const loanPayments: Array<{
				loanBalance: LoanBalance;
				interest: number;
				principal: number;
			}> = [];

			activeLoans.forEach(lb => {
				const monthlyRate = lb.loan.annualRate / 100 / 12;
				const interest = lb.remaining * monthlyRate;
				
				loanPayments.push({
					loanBalance: lb,
					interest,
					principal: 0
				});

				budgetRemaining -= interest;
			});

			// Étape 2: Trier les prêts par taux d'intérêt (décroissant)
			const sortedPayments = [...loanPayments].sort((a, b) => 
				b.loanBalance.loan.annualRate - a.loanBalance.loan.annualRate
			);

			// Étape 3: Distribuer le budget restant pour rembourser le capital
			// en priorité sur les prêts avec les taux les plus élevés (méthode avalanche)
			for (const payment of sortedPayments) {
				if (budgetRemaining <= 0) break;

				// Montant maximum qu'on peut rembourser sur ce prêt
				const maxPrincipal = Math.min(budgetRemaining, payment.loanBalance.remaining);
				payment.principal = maxPrincipal;
				budgetRemaining -= maxPrincipal;

				// Mettre à jour le capital restant
				payment.loanBalance.remaining -= maxPrincipal;

				if (payment.loanBalance.remaining < 0.01) {
					payment.loanBalance.remaining = 0;
				}
			}

			// Étape 4: Enregistrer les données pour l'affichage
			loanPayments.forEach(payment => {
				totalPrincipal += payment.principal;
				totalInterest += payment.interest;
				totalRemaining += payment.loanBalance.remaining;

				loansData.push({
					name: payment.loanBalance.loan.name,
					monthlyPayment: payment.interest + payment.principal,
					principal: payment.principal,
					interest: payment.interest
				});
			});

			optimizedPlanAmortizationTable.push({
				month,
				date: currentDate,
				loansData,
				totalMonthlyPayment: totalMonthlyBudget,
				totalPrincipal,
				totalInterest,
				totalRemaining
			});
		}

		// Calculate savings
		calculatePlanAmortization(plan);
		const originalInterest = planAmortizationTable.reduce((sum, row) => sum + row.totalInterest, 0);
		const optimizedInterest = optimizedPlanAmortizationTable.reduce((sum, row) => sum + row.totalInterest, 0);
		optimizationSavings = originalInterest - optimizedInterest;

		showOptimizedPlan = true;
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
												<th rowspan="2">Mois</th>
												<th rowspan="2">Date</th>
												<th rowspan="2">Prêt</th>
												<th colspan="3">Détails du paiement</th>
												<th rowspan="2">Restant dû</th>
											</tr>
											<tr>
												<th>Mensualité</th>
												<th>Capital</th>
												<th>Intérêts</th>
											</tr>
										</thead>
										<tbody>
											{#each planAmortizationTable as row, i}
												{#if i < 12 || i >= planAmortizationTable.length - 12 || i % 12 === 0}
													{#each row.loansData as loanData, loanIndex}
														<tr class="loan-row">
															{#if loanIndex === 0}
																<td rowspan={row.loansData.length + 1} class="month-cell">{row.month}</td>
																<td rowspan={row.loansData.length + 1} class="date-cell">{format(row.date, 'MMM yyyy', { locale: fr })}</td>
															{/if}
															<td class="loan-name-cell">{loanData.name}</td>
															<td>{loanData.monthlyPayment.toFixed(2)} €</td>
															<td>{loanData.principal.toFixed(2)} €</td>
															<td>{loanData.interest.toFixed(2)} €</td>
															{#if loanIndex === 0}
																<td rowspan={row.loansData.length + 1} class="remaining-cell">{row.totalRemaining.toFixed(2)} €</td>
															{/if}
														</tr>
													{/each}
													<tr class="total-row">
														<td class="total-label">TOTAL</td>
														<td class="total-value">{row.totalMonthlyPayment.toFixed(2)} €</td>
														<td class="total-value">{row.totalPrincipal.toFixed(2)} €</td>
														<td class="total-value">{row.totalInterest.toFixed(2)} €</td>
													</tr>
												{:else if i === 12}
													<tr class="ellipsis">
														<td colspan="7">...</td>
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
									<button on:click={() => optimizePlan(plan)} class="btn-optimize">
										⚡ Optimiser le plan
									</button>
								</div>

								{#if showOptimizedPlan && selectedPlanIndex === index}
									<div class="optimization-section">
										<h5>Plan Optimisé</h5>
										<div class="optimization-alert">
											<div class="alert-icon">✨</div>
											<div class="alert-content">
												<strong>Économie potentielle : {optimizationSavings.toFixed(2)} €</strong>
												<p>En redistribuant vos paiements pour rembourser en priorité les prêts à taux élevé, vous économiserez {optimizationSavings.toFixed(2)} € d'intérêts !</p>
											</div>
										</div>

										<div class="detail-summary">
											<div class="summary-card">
												<span class="label">Intérêts originaux</span>
												<span class="value">
													{planAmortizationTable.reduce((sum, row) => sum + row.totalInterest, 0).toFixed(2)} €
												</span>
											</div>
											<div class="summary-card optimized">
												<span class="label">Intérêts optimisés</span>
												<span class="value">
													{optimizedPlanAmortizationTable.reduce((sum, row) => sum + row.totalInterest, 0).toFixed(2)} €
												</span>
											</div>
											<div class="summary-card savings">
												<span class="label">Économie</span>
												<span class="value">
													-{optimizationSavings.toFixed(2)} €
												</span>
											</div>
										</div>

										<div class="comparison-note">
											<strong>💡 Comment ça marche ?</strong>
											<p>L'optimisation utilise la méthode "avalanche" : chaque mois, après avoir payé les intérêts de tous les prêts, le reste de votre budget est alloué en priorité au prêt avec le taux d'intérêt le plus élevé. Cette stratégie minimise les intérêts totaux.</p>
										</div>

										<div class="table-wrapper">
											<table class="amortization-table optimized-table">
												<thead>
													<tr>
														<th rowspan="2">Mois</th>
														<th rowspan="2">Date</th>
														<th rowspan="2">Prêt</th>
														<th colspan="3">Détails du paiement optimisé</th>
														<th rowspan="2">Restant dû</th>
													</tr>
													<tr>
														<th>Mensualité</th>
														<th>Capital</th>
														<th>Intérêts</th>
													</tr>
												</thead>
												<tbody>
													{#each optimizedPlanAmortizationTable as row, i}
														{#if i < 12 || i >= optimizedPlanAmortizationTable.length - 12 || i % 12 === 0}
															{#each row.loansData as loanData, loanIndex}
																<tr class="loan-row optimized">
																	{#if loanIndex === 0}
																		<td rowspan={row.loansData.length + 1} class="month-cell">{row.month}</td>
																		<td rowspan={row.loansData.length + 1} class="date-cell">{format(row.date, 'MMM yyyy', { locale: fr })}</td>
																	{/if}
																	<td class="loan-name-cell">{loanData.name}</td>
																	<td class="optimized-value">{loanData.monthlyPayment.toFixed(2)} €</td>
																	<td class="optimized-value">{loanData.principal.toFixed(2)} €</td>
																	<td class="optimized-value">{loanData.interest.toFixed(2)} €</td>
																	{#if loanIndex === 0}
																		<td rowspan={row.loansData.length + 1} class="remaining-cell">{row.totalRemaining.toFixed(2)} €</td>
																	{/if}
																</tr>
															{/each}
															<tr class="total-row optimized">
																<td class="total-label">TOTAL</td>
																<td class="total-value optimized">{row.totalMonthlyPayment.toFixed(2)} €</td>
																<td class="total-value optimized">{row.totalPrincipal.toFixed(2)} €</td>
																<td class="total-value optimized">{row.totalInterest.toFixed(2)} €</td>
															</tr>
														{:else if i === 12}
															<tr class="ellipsis">
																<td colspan="7">...</td>
															</tr>
														{/if}
													{/each}
												</tbody>
											</table>
										</div>
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
		padding: 0.75rem;
		text-align: center;
		vertical-align: middle;
	}

	.amortization-table td {
		padding: 0.75rem;
		text-align: center;
		vertical-align: middle;
	}

	.amortization-table .month-cell,
	.amortization-table .date-cell {
		background: #f8f9fa;
		font-weight: 600;
		border-right: 2px solid #e0e0e0;
	}

	.amortization-table .loan-name-cell {
		text-align: left;
		color: #667eea;
		font-weight: 500;
		padding-left: 1rem;
	}

	.amortization-table .remaining-cell {
		background: #f8f9fa;
		font-weight: 600;
		border-left: 2px solid #e0e0e0;
	}

	.amortization-table .loan-row {
		border-bottom: 1px solid #f0f0f0;
	}

	.amortization-table .loan-row:hover {
		background: #fafafa;
	}

	.amortization-table .total-row {
		background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
		font-weight: 700;
		border-top: 2px solid #667eea;
		border-bottom: 2px solid #667eea;
	}

	.amortization-table .total-label {
		text-align: left;
		padding-left: 1rem;
		color: #667eea;
		font-size: 0.85rem;
		letter-spacing: 0.5px;
	}

	.amortization-table .total-value {
		color: #667eea;
		font-weight: 700;
	}

	.amortization-table.optimized-table th {
		background: #28a745;
	}

	.amortization-table.optimized-table .total-row {
		background: linear-gradient(135deg, #28a74520 0%, #20c99720 100%);
		border-top: 2px solid #28a745;
		border-bottom: 2px solid #28a745;
	}

	.amortization-table.optimized-table .total-label {
		color: #28a745;
	}

	.amortization-table.optimized-table .total-value {
		color: #28a745;
	}

	.amortization-table .optimized-value {
		color: #28a745;
		font-weight: 500;
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
		flex-wrap: wrap;
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

	.btn-optimize {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-optimize:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
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

	.optimization-alert {
		background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
		border: 2px solid #28a745;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.alert-icon {
		font-size: 2.5rem;
		flex-shrink: 0;
	}

	.alert-content {
		flex: 1;
	}

	.alert-content strong {
		color: #155724;
		font-size: 1.2rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.alert-content p {
		color: #155724;
		margin: 0;
		line-height: 1.5;
	}

	.summary-card.optimized {
		border: 2px solid #28a745;
		background: #f0fff4;
	}

	.summary-card.optimized .value {
		color: #28a745;
	}

	.summary-card.savings {
		border: 2px solid #ffc107;
		background: #fffbf0;
	}

	.summary-card.savings .value {
		color: #ff6b00;
		font-size: 1.5rem;
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
			font-size: 0.8rem;
		}

		.amortization-table {
			font-size: 0.75rem;
		}

		.amortization-table th,
		.amortization-table td {
			padding: 0.5rem 0.3rem;
		}

		.amortization-table .loan-name-cell,
		.amortization-table .total-label {
			padding-left: 0.5rem;
			font-size: 0.75rem;
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

		.btn-export,
		.btn-optimize {
			width: 100%;
		}

		.optimization-alert {
			flex-direction: column;
			text-align: center;
		}

		.alert-icon {
			font-size: 3rem;
		}
	}
</style>
