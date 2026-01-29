<!-- 
  Exemple d'utilisation des composables refactorisés
  Ce fichier montre comment utiliser les nouveaux stores dans les composants
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { createLoanFormStore, createLoanFormValidation } from '$lib/composables/loanForm';
	import { createLoansListStore } from '$lib/composables/loansList';
	import { calculateLoan } from '$lib/services';

	// Créer les stores
	const formStore = createLoanFormStore({
		startDate: new Date().toISOString().split('T')[0]
	});

	const validation = createLoanFormValidation(formStore);
	const loansStore = createLoansListStore();

	// Variables réactives dérivées
	$: formData = $formStore;
	$: validationData = $validation;
	$: loans = $loansStore;

	// Calculer l'amortissement en temps réel
	$: loanResult =
		formData.calculationMode === 'payment' && formData.amount > 0
			? calculateLoan(
					formData.amount,
					formData.annualRate,
					formData.durationYears,
					formData.monthlyPayment,
					formData.startDate,
					formData.calculationMode,
					formData.paymentPeriods
				)
			: null;

	// Sauvegarder un prêt
	function handleSave() {
		if (!validationData.canSave) return;

		loansStore.add({
			name: formData.loanName,
			amount: formData.amount,
			annualRate: formData.annualRate,
			durationYears: formData.durationYears,
			monthlyPayment: loanResult?.monthlyPayment || formData.monthlyPayment,
			startDate: formData.startDate,
			calculationMode: formData.calculationMode,
			paymentPeriods: formData.paymentPeriods
		});

		// Reset le formulaire après sauvegarde
		formStore.reset();
	}

	// Charger un prêt existant
	function loadLoan(loanId: string) {
		const loan = loansStore.getById(loans, loanId);
		if (loan) {
			formStore.loadFromLoan(loan);
		}
	}

	// Cloner un prêt
	function handleClone(loan: (typeof loans)[0]) {
		const newName = prompt('Nom du nouveau prêt:', `${loan.name} (copie)`);
		if (newName) {
			loansStore.clone(loan, newName);
		}
	}

	onMount(() => {
		loansStore.refresh();
	});
</script>

<div class="example-component">
	<h2>Formulaire de Prêt</h2>

	<!-- Formulaire -->
	<div class="form-section">
		<label>
			Montant (€)
			<input
				type="number"
				value={formData.amount}
				on:input={(e) => formStore.updateField('amount', Number(e.currentTarget.value))}
			/>
			{#if validationData.errors.amount}
				<span class="error">{validationData.errors.amount}</span>
			{/if}
		</label>

		<label>
			Taux annuel (%)
			<input
				type="number"
				value={formData.annualRate}
				on:input={(e) => formStore.updateField('annualRate', Number(e.currentTarget.value))}
			/>
			{#if validationData.errors.annualRate}
				<span class="error">{validationData.errors.annualRate}</span>
			{/if}
		</label>

		<label>
			Durée (années)
			<input
				type="number"
				value={formData.durationYears}
				on:input={(e) => formStore.updateField('durationYears', Number(e.currentTarget.value))}
			/>
		</label>

		<label>
			Date de début
			<input
				type="date"
				value={formData.startDate}
				on:input={(e) => formStore.updateField('startDate', e.currentTarget.value)}
			/>
		</label>
	</div>

	<!-- Résultat -->
	{#if loanResult}
		<div class="result-section">
			<h3>Résultat</h3>
			<p>Mensualité: <strong>{loanResult.monthlyPayment.toFixed(2)} €</strong></p>
			<p>Coût total: {loanResult.totalCost.toLocaleString('fr-FR')} €</p>
			<p>Intérêts totaux: {loanResult.totalInterest.toLocaleString('fr-FR')} €</p>
		</div>
	{/if}

	<!-- Sauvegarde -->
	<div class="save-section">
		<input
			type="text"
			placeholder="Nom du prêt"
			value={formData.loanName}
			on:input={(e) => formStore.updateField('loanName', e.currentTarget.value)}
		/>
		<button on:click={handleSave} disabled={!validationData.canSave}> Sauvegarder </button>
	</div>

	<!-- Liste des prêts -->
	<div class="loans-list">
		<h3>Prêts sauvegardés ({loans.length})</h3>
		{#each loans as loan}
			<div class="loan-item">
				<span>{loan.name}</span>
				<span>{loan.amount.toLocaleString('fr-FR')} €</span>
				<button on:click={() => loadLoan(loan.id)}>Charger</button>
				<button on:click={() => handleClone(loan)}>Cloner</button>
				<button on:click={() => loansStore.remove(loan.id)}>Supprimer</button>
			</div>
		{/each}
	</div>
</div>

<style>
	.example-component {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.form-section label {
		display: block;
		margin-bottom: 1rem;
	}

	.form-section input {
		display: block;
		width: 100%;
		padding: 0.5rem;
		margin-top: 0.25rem;
	}

	.error {
		color: red;
		font-size: 0.875rem;
	}

	.result-section {
		background: #f0f9ff;
		padding: 1rem;
		border-radius: 8px;
		margin: 1rem 0;
	}

	.loan-item {
		display: flex;
		gap: 1rem;
		align-items: center;
		padding: 0.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.loan-item button {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}
</style>
