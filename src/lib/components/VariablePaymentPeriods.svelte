<script lang="ts">
	import type { MonthlyPaymentPeriod } from '$lib/services';
	import { addPaymentPeriod, deletePaymentPeriod } from '$lib/services';

	export let monthlyPayment = 0;
	export let paymentPeriods: MonthlyPaymentPeriod[] = [];
	export let durationYears = 20;

	let newPeriodStartMonth = 1;
	let newPeriodEndMonth = 12;
	let newPeriodMonthlyPayment = 1000;

	function handleAddPeriod() {
		if (newPeriodStartMonth < 1 || newPeriodEndMonth > durationYears * 12) {
			alert('Les mois doivent être entre 1 et ' + durationYears * 12);
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

		paymentPeriods = addPaymentPeriod(
			paymentPeriods,
			newPeriodStartMonth,
			newPeriodEndMonth,
			newPeriodMonthlyPayment
		);
	}

	function handleDeletePeriod(id: string) {
		paymentPeriods = deletePaymentPeriod(paymentPeriods, id);
	}
</script>

<div class="variable-section">
	<h3>Mensualités par défaut</h3>
	<div class="input-group">
		<label for="mensualite-defaut">
			Mensualité par défaut (€)
			<input id="mensualite-defaut" type="number" bind:value={monthlyPayment} min="100" step="10" />
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
			<button on:click={handleAddPeriod} class="btn-add">➕ Ajouter</button>
		</div>
	</div>

	{#if paymentPeriods.length > 0}
		<div class="periodes-list">
			<h4>Périodes définies :</h4>
			{#each paymentPeriods as period}
				<div class="periode-item">
					<span class="periode-info">
						Mois {period.startMonth} à {period.endMonth} :
						<strong>{period.monthlyPayment.toFixed(2)} €</strong>
					</span>
					<button on:click={() => handleDeletePeriod(period.id)} class="btn-delete-small">
						❌
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
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

	input[type='number']:focus {
		outline: none;
		border-color: #667eea;
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

	@media (max-width: 768px) {
		.periode-inputs {
			grid-template-columns: 1fr;
		}

		.btn-add {
			width: 100%;
		}
	}
</style>
