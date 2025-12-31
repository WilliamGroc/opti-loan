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

	// Calculation mode: 'payment' or 'duration' or 'variable'
	let calculationMode: 'payment' | 'duration' | 'variable' = 'payment';

	// Variable monthly payments management
	let paymentPeriods: MonthlyPaymentPeriod[] = [];
	let newPeriodStartMonth = 1;
	let newPeriodEndMonth = 12;
	let newPeriodMonthlyPayment = 1000;

	// Saved loans management
	let savedLoans: SavedLoan[] = [];
	let loanName = '';
	let showSavedLoans = false;
	const LOCAL_STORAGE_KEY = 'opti-loan-prets';

	// Load loans from local storage
	function loadLoans() {
		if (typeof window !== 'undefined') {
			const data = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (data) {
				try {
					savedLoans = JSON.parse(data);
				} catch (e) {
					console.error('Erreur lors du chargement des prêts:', e);
					savedLoans = [];
				}
			}
		}
	}

	// Save a loan
	function saveLoan() {
		if (!loanName.trim()) {
			alert('Veuillez entrer un nom pour ce prêt');
			return;
		}

		const newLoan: SavedLoan = {
			id: Date.now().toString(),
			name: loanName,
			amount,
			annualRate,
			durationYears,
			monthlyPayment,
			startDate,
			calculationMode,
			saveDate: new Date().toISOString(),
			paymentPeriods: calculationMode === 'variable' ? [...paymentPeriods] : undefined
		};

		savedLoans = [newLoan, ...savedLoans];
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedLoans));
		loanName = '';
		alert('Prêt sauvegardé avec succès !');
	}

	// Load a saved loan
	function loadLoan(loan: SavedLoan) {
		amount = loan.amount;
		annualRate = loan.annualRate;
		durationYears = loan.durationYears;
		monthlyPayment = loan.monthlyPayment;
		startDate = loan.startDate;
		calculationMode = loan.calculationMode;
		paymentPeriods = loan.paymentPeriods ? [...loan.paymentPeriods] : [];
		showSavedLoans = false;
	}

	// Delete a loan
	function deleteLoan(id: string) {
		if (confirm('Voulez-vous vraiment supprimer ce prêt ?')) {
			savedLoans = savedLoans.filter(p => p.id !== id);
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedLoans));
		}
	}

	// Clone a loan
	function cloneLoan(loan: SavedLoan) {
		const newName = prompt('Nom du nouveau prêt :', `${loan.name} (copie)`);
		if (!newName || !newName.trim()) {
			return;
		}

		const clonedLoan: SavedLoan = {
			...loan,
			id: Date.now().toString(),
			name: newName.trim(),
			saveDate: new Date().toISOString()
		};

		savedLoans = [clonedLoan, ...savedLoans];
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedLoans));
		alert('Prêt cloné avec succès !');
	}

	// Export all loans
	function exportLoans() {
		const dataStr = JSON.stringify(savedLoans, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `prets-opti-loan-${format(new Date(), 'yyyy-MM-dd')}.json`;
		link.click();
		URL.revokeObjectURL(url);
	}

	// Add a payment period
	function addPeriod() {
		if (newPeriodStartMonth < 1 || newPeriodEndMonth > durationYears * 12) {
			alert('Les mois doivent être entre 1 et ' + (durationYears * 12));
			return;
		}
		if (newPeriodStartMonth > newPeriodEndMonth) {
			alert('Le mois de début doit être inférieur au mois de fin');
			return;
		}
		if (newPeriodMonthlyPayment <= 0) {
			alert('La mensualité doit être positive');
			return;
		}

		const newPeriod: MonthlyPaymentPeriod = {
			id: Date.now().toString(),
			startMonth: newPeriodStartMonth,
			endMonth: newPeriodEndMonth,
			monthlyPayment: newPeriodMonthlyPayment
		};

		paymentPeriods = [...paymentPeriods, newPeriod].sort((a, b) => a.startMonth - b.startMonth);
	}

	// Delete a period
	function deletePeriod(id: string) {
		paymentPeriods = paymentPeriods.filter(p => p.id !== id);
	}

	// Get monthly payment for a given month
	function getMonthlyPaymentForMonth(month: number): number {
		if (calculationMode !== 'variable') return monthlyPayment;
		
		const period = paymentPeriods.find(p => month >= p.startMonth && month <= p.endMonth);
		return period ? period.monthlyPayment : monthlyPayment;
	}

	onMount(() => {
		loadLoans();
	});

	function calculateLoan() {
		const monthlyRate = annualRate / 100 / 12;
		const totalMonths = durationYears * 12;

		if (calculationMode === 'payment') {
			// Calculate monthly payment from amount, rate and duration
			if (monthlyRate === 0) {
				monthlyPayment = amount / totalMonths;
			} else {
				monthlyPayment =
					(amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
					(Math.pow(1 + monthlyRate, totalMonths) - 1);
			}
		}

		// Generate amortization table
		amortizationTable = [];
		let remainingPrincipal = amount;
		let sumPayments = 0;

		for (let month = 1; month <= totalMonths; month++) {
			const monthPayment = getMonthlyPaymentForMonth(month);
			const monthInterest = remainingPrincipal * monthlyRate;
			const principalRepaid = monthPayment - monthInterest;
			remainingPrincipal -= principalRepaid;

			if (remainingPrincipal < 0) remainingPrincipal = 0;

			const dueDate = addMonths(parse(startDate, 'yyyy-MM-dd', new Date()), month);

			amortizationTable.push({
				month,
				date: dueDate,
				monthlyPayment: monthPayment,
				principal: principalRepaid,
				interest: monthInterest,
				remaining: remainingPrincipal
			});

			sumPayments += monthPayment;
		}

		totalCost = sumPayments;
		totalInterest = totalCost - amount;
	}

	// Initial calculation
	$: {
		amount, annualRate, durationYears, monthlyPayment, calculationMode, startDate, paymentPeriods;
		calculateLoan();
	}
</script>

<div class="container">
	<h1>Calculateur de Prêt</h1>

	<div class="calculator">
		<div class="input-group">
			<label for="montant">
				Montant du prêt (€)
				<input
					id="montant"
					type="number"
					bind:value={amount}
					min="1000"
					step="1000"
				/>
			</label>
		</div>

		<div class="input-group">
			<label for="taux">
				Taux d'intérêt annuel (%)
				<input
					id="taux"
					type="number"
					bind:value={annualRate}
					min="0"
					max="20"
					step="0.1"
				/>
			</label>
		</div>

		<div class="input-group">
			<label for="duree">
				Durée (années)
				<input
					id="duree"
					type="number"
					bind:value={durationYears}
					min="1"
					max="50"
				/>
			</label>
		</div>

		<div class="input-group">
			<label for="dateDebut">
				Date de début du prêt
				<input
					id="dateDebut"
					type="date"
					bind:value={startDate}
				/>
			</label>
		</div>

		<div class="mode-selector">
			<label>
				<input type="radio" bind:group={calculationMode} value="payment" />
				Calculer la mensualité
			</label>
			<label>
				<input type="radio" bind:group={calculationMode} value="duration" />
				Saisir la mensualité
			</label>
			<label>
				<input type="radio" bind:group={calculationMode} value="variable" />
				Mensualités variables
			</label>
		</div>

		{#if calculationMode === 'duration'}
			<div class="input-group">
				<label for="mensualite">
					Mensualité souhaitée (€)
					<input
						id="mensualite"
						type="number"
						bind:value={monthlyPayment}
						min="100"
						step="10"
					/>
				</label>
			</div>
		{/if}

		{#if calculationMode === 'variable'}
			<div class="variable-section">
				<h3>Mensualités par défaut</h3>
				<div class="input-group">
					<label for="mensualite-defaut">
						Mensualité par défaut (€)
						<input
							id="mensualite-defaut"
							type="number"
							bind:value={monthlyPayment}
							min="100"
							step="10"
						/>
					</label>
				</div>

				<h3>Périodes spécifiques</h3>
				<div class="periode-form">
					<div class="periode-inputs">
						<div class="input-small">
							<label for="mois-debut">
								Mois début
								<input
									id="mois-debut"
									type="number"
									bind:value={newPeriodStartMonth}
									min="1"
									max={durationYears * 12}
								/>
							</label>
						</div>
						<div class="input-small">
							<label for="mois-fin">
								Mois fin
								<input
									id="mois-fin"
									type="number"
									bind:value={newPeriodEndMonth}
									min="1"
									max={durationYears * 12}
								/>
							</label>
						</div>
						<div class="input-small">
							<label for="mensualite-periode">
								Mensualité (€)
								<input
									id="mensualite-periode"
									type="number"
									bind:value={newPeriodMonthlyPayment}
									min="0"
									step="10"
								/>
							</label>
						</div>
						<button on:click={addPeriod} class="btn-add">➕ Ajouter</button>
					</div>
				</div>

				{#if paymentPeriods.length > 0}
					<div class="periodes-list">
						<h4>Périodes définies :</h4>
						{#each paymentPeriods as period}
							<div class="periode-item">
								<span class="periode-info">
									Mois {period.startMonth} à {period.endMonth} : <strong>{period.monthlyPayment.toFixed(2)} €</strong>
								</span>
								<button on:click={() => deletePeriod(period.id)} class="btn-delete-small">
									❌
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<div class="save-section">
			<h3>Sauvegarder ce prêt</h3>
			<div class="save-controls">
				<input
					type="text"
					placeholder="Nom du prêt (ex: Maison principale)"
					bind:value={loanName}
					class="save-input"
				/>
				<button on:click={saveLoan} class="btn-primary">
					💾 Sauvegarder
				</button>
			</div>
		</div>
	</div>

	{#if savedLoans.length > 0}
		<div class="saved-loans">
			<div class="saved-loans-header">
				<h2>Prêts sauvegardés ({savedLoans.length})</h2>
				<div class="header-actions">
					<button
						on:click={() => showSavedLoans = !showSavedLoans}
						class="btn-secondary"
					>
						{showSavedLoans ? '▼ Masquer' : '▶ Afficher'}
					</button>
					<button on:click={exportLoans} class="btn-secondary">
						📥 Exporter
					</button>
				</div>
			</div>

			{#if showSavedLoans}
				<div class="loans-grid">
					{#each savedLoans as loan}
						<div class="loan-card">
							<div class="loan-card-header">
								<h3>{loan.name}</h3>
								<button
									on:click={() => deleteLoan(loan.id)}
									class="btn-delete"
									title="Supprimer"
								>
									🗑️
								</button>
							</div>
							<div class="loan-details">
								<div class="loan-detail">
									<span class="label">Montant:</span>
									<span class="value">{loan.amount.toLocaleString('fr-FR')} €</span>
								</div>
								<div class="loan-detail">
									<span class="label">Taux:</span>
									<span class="value">{loan.annualRate}%</span>
								</div>
								<div class="loan-detail">
									<span class="label">Durée:</span>
									<span class="value">{loan.durationYears} ans</span>
								</div>
								<div class="loan-detail highlight">
									<span class="label">Mensualité:</span>
									<span class="value">{loan.monthlyPayment.toFixed(2)} €</span>
								</div>
								<div class="loan-detail">
									<span class="label">Sauvegardé le:</span>
									<span class="value">{format(new Date(loan.saveDate), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
								</div>
							</div>
							<div class="loan-actions">
								<button on:click={() => loadLoan(loan)} class="btn-load">
									📂 Charger
								</button>
								<button on:click={() => cloneLoan(loan)} class="btn-clone">
									📋 Cloner
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<div class="results">
		<h2>Résultats</h2>
		<div class="result-cards">
			<div class="card">
				<div class="card-label">Mensualité</div>
				<div class="card-value">{monthlyPayment.toFixed(2)} €</div>
			</div>
			<div class="card">
				<div class="card-label">Coût total</div>
				<div class="card-value">{totalCost.toFixed(2)} €</div>
			</div>
			<div class="card">
				<div class="card-label">Intérêts totaux</div>
				<div class="card-value">{totalInterest.toFixed(2)} €</div>
			</div>
			<div class="card">
				<div class="card-label">Nombre de mensualités</div>
				<div class="card-value">{durationYears * 12}</div>
			</div>
		</div>
	</div>

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
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, sans-serif;
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
		margin-bottom: 2rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	h2 {
		color: #333;
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.calculator {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.input-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		font-weight: 600;
		color: #333;
		margin-bottom: 0.5rem;
	}

	input[type='number'] {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.3s;
		box-sizing: border-box;
	}

	input[type='number']:focus,
	input[type='date']:focus {
		outline: none;
		border-color: #667eea;
	}

	input[type='date'] {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.3s;
		box-sizing: border-box;
	}

	.mode-selector {
		display: flex;
		gap: 1.5rem;
		margin: 1.5rem 0;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 8px;
		flex-wrap: wrap;
	}

	.mode-selector label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		margin: 0;
	}

	.mode-selector input[type='radio'] {
		cursor: pointer;
	}

	.variable-section {
		margin-top: 1.5rem;
		padding: 1.5rem;
		background: #f8f9fa;
		border-radius: 8px;
		border: 2px solid #e0e0e0;
	}

	.variable-section h3 {
		color: #333;
		font-size: 1.1rem;
		margin-bottom: 1rem;
		margin-top: 0;
	}

	.variable-section h4 {
		color: #555;
		font-size: 1rem;
		margin-bottom: 0.75rem;
		margin-top: 0;
	}

	.periode-form {
		margin-bottom: 1.5rem;
	}

	.periode-inputs {
		display: grid;
		grid-template-columns: 1fr 1fr 1.5fr auto;
		gap: 1rem;
		align-items: end;
	}

	.input-small {
		flex: 1;
	}

	.input-small label {
		font-size: 0.9rem;
	}

	.input-small input {
		width: 100%;
	}

	.btn-add {
		padding: 0.75rem 1.25rem;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.btn-add:hover {
		background: #218838;
		transform: translateY(-2px);
	}

	.periodes-list {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
	}

	.periode-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: #f8f9fa;
		border-radius: 6px;
		margin-bottom: 0.5rem;
	}

	.periode-item:last-child {
		margin-bottom: 0;
	}

	.periode-info {
		color: #333;
		font-size: 0.95rem;
	}

	.btn-delete-small {
		background: transparent;
		border: none;
		font-size: 1.1rem;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
		padding: 0.25rem 0.5rem;
	}

	.btn-delete-small:hover {
		opacity: 1;
	}

	.save-section {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 2px solid #e0e0e0;
	}

	.save-section h3 {
		color: #333;
		font-size: 1.2rem;
		margin-bottom: 1rem;
	}

	.save-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.save-input {
		flex: 1;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.3s;
	}

	.save-input:focus {
		outline: none;
		border-color: #667eea;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		white-space: nowrap;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-primary:active {
		transform: translateY(0);
	}

	.btn-secondary {
		padding: 0.5rem 1rem;
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: #667eea;
		color: white;
	}

	.saved-loans {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.saved-loans-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.loans-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.loan-card {
		background: #f8f9fa;
		border: 2px solid #e0e0e0;
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.3s;
	}

	.loan-card:hover {
		border-color: #667eea;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
		transform: translateY(-2px);
	}

	.loan-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.loan-card-header h3 {
		color: #333;
		font-size: 1.2rem;
		margin: 0;
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

	.loan-details {
		margin-bottom: 1rem;
	}

	.loan-detail {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e0e0e0;
	}

	.loan-detail:last-child {
		border-bottom: none;
	}

	.loan-detail.highlight {
		background: #f0f0ff;
		padding: 0.5rem;
		border-radius: 4px;
		margin: 0.5rem 0;
		font-weight: 600;
	}

	.loan-detail .label {
		color: #666;
		font-size: 0.9rem;
	}

	.loan-detail .value {
		color: #333;
		font-weight: 600;
	}

	.loan-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.btn-load {
		padding: 0.75rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.btn-load:hover {
		transform: scale(1.02);
	}

	.btn-load:active {
		transform: scale(0.98);
	}

	.btn-clone {
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

	.btn-clone:hover {
		background: #667eea;
		color: white;
		transform: scale(1.02);
	}

	.btn-clone:active {
		transform: scale(0.98);
	}

	.results {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.result-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1.5rem;
		border-radius: 8px;
		color: white;
		text-align: center;
	}

	.card-label {
		font-size: 0.9rem;
		opacity: 0.9;
		margin-bottom: 0.5rem;
	}

	.card-value {
		font-size: 1.5rem;
		font-weight: bold;
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

		.calculator,
		.results,
		.amortization {
			padding: 1.5rem;
		}

		.result-cards {
			grid-template-columns: 1fr;
		}

		.mode-selector {
			flex-direction: column;
			gap: 1rem;
		}

		.periode-inputs {
			grid-template-columns: 1fr;
		}

		.btn-add {
			width: 100%;
		}

		table {
			font-size: 0.9rem;
		}

		th,
		td {
			padding: 0.5rem;
		}

		.save-controls {
			flex-direction: column;
		}

		.save-input {
			width: 100%;
		}

		.btn-primary {
			width: 100%;
		}

		.saved-loans-header {
			flex-direction: column;
			align-items: stretch;
		}

		.header-actions {
			justify-content: stretch;
			flex-direction: column;
		}

		.loans-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
