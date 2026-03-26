<script lang="ts">
	type Props = {
		monthlySalary: number;
		otherIncome: number;
		otherLoans: number;
	};

	let {
		monthlySalary = $bindable(),
		otherIncome = $bindable(),
		otherLoans = $bindable()
	}: Props = $props();

	let totalIncome = $derived(monthlySalary + otherIncome);
	let netIncome = $derived(totalIncome - otherLoans);
</script>

<div class="income-section">
	<div class="income-grid">
		<div class="form-group">
			<label for="monthly-salary">
				<span class="label-text">💵 Salaire mensuel net</span>
				<span class="label-hint">Après impôts</span>
			</label>
			<div class="input-with-icon">
				<span class="icon">€</span>
				<input
					id="monthly-salary"
					type="number"
					bind:value={monthlySalary}
					min="0"
					step="100"
					class="input-field"
					placeholder="3000"
				/>
			</div>
		</div>

		<div class="form-group">
			<label for="other-income">
				<span class="label-text">💰 Autres revenus mensuels</span>
				<span class="label-hint">Locatifs, allocations, etc.</span>
			</label>
			<div class="input-with-icon">
				<span class="icon">€</span>
				<input
					id="other-income"
					type="number"
					bind:value={otherIncome}
					min="0"
					step="100"
					class="input-field"
					placeholder="0"
				/>
			</div>
		</div>

		<div class="form-group">
			<label for="other-loans">
				<span class="label-text">💳 Autres crédits mensuels</span>
				<span class="label-hint">Mensualités en cours</span>
			</label>
			<div class="input-with-icon">
				<span class="icon">€</span>
				<input
					id="other-loans"
					type="number"
					bind:value={otherLoans}
					min="0"
					step="50"
					class="input-field"
					placeholder="0"
				/>
			</div>
		</div>
	</div>

	{#if totalIncome > 0}
		<div class="income-summary">
			<div class="summary-item">
				<span class="summary-label">Revenus totaux:</span>
				<span class="summary-value positive">{totalIncome.toLocaleString('fr-FR')} €/mois</span>
			</div>
			{#if otherLoans > 0}
				<div class="summary-item">
					<span class="summary-label">Charges mensuelles:</span>
					<span class="summary-value negative">- {otherLoans.toLocaleString('fr-FR')} €/mois</span>
				</div>
				<div class="summary-item highlight">
					<span class="summary-label">Reste disponible:</span>
					<span class="summary-value">{netIncome.toLocaleString('fr-FR')} €/mois</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.income-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		background-color: white;
		padding: 1.5rem;
		border-radius: 12px;
	}

	.income-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label-text {
		font-weight: 600;
		color: #1a202c;
		font-size: 0.95rem;
	}

	.label-hint {
		font-size: 0.85rem;
		color: #718096;
	}

	.input-with-icon {
		position: relative;
		display: flex;
		align-items: center;
	}

	.icon {
		position: absolute;
		left: 1rem;
		color: #718096;
		font-weight: 600;
		font-size: 1rem;
		pointer-events: none;
	}

	.input-field {
		flex: 1;
		padding: 0.75rem;
		padding-left: 2.5rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1rem;
		transition: all 0.2s;
		font-family: inherit;
	}

	.input-field:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.income-summary {
		background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
		border: 2px solid #667eea30;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
	}

	.summary-item.highlight {
		padding-top: 1rem;
		border-top: 2px solid #667eea30;
	}

	.summary-label {
		font-weight: 600;
		color: #4a5568;
		font-size: 0.95rem;
	}

	.summary-value {
		font-weight: 700;
		font-size: 1.1rem;
		color: #1a202c;
	}

	.summary-value.positive {
		color: #48bb78;
	}

	.summary-value.negative {
		color: #f56565;
	}

	@media (max-width: 768px) {
		.income-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
