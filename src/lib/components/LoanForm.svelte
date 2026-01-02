<script lang="ts">
	import type { MonthlyPaymentPeriod } from '$lib/services';
	import VariablePaymentPeriods from './VariablePaymentPeriods.svelte';

	// Props
	export let amount = 200000;
	export let annualRate = 1.5;
	export let durationYears = 20;
	export let monthlyPayment = 0;
	export let startDate: string;
	export let calculationMode: 'payment' | 'duration' | 'variable' = 'payment';
	export let paymentPeriods: MonthlyPaymentPeriod[] = [];
	export let loanName = '';
	export let onSaveLoan: () => void;
</script>

<div class="calculator">
	<div class="input-group">
		<label for="montant">
			Montant du prêt (€)
			<input id="montant" type="number" bind:value={amount} min="1000" step="1000" />
		</label>
	</div>

	<div class="input-group">
		<label for="taux">
			Taux d'intérêt annuel (%)
			<input id="taux" type="number" bind:value={annualRate} min="0" max="20" step="0.1" />
		</label>
	</div>

	<div class="input-group">
		<label for="duree">
			Durée (années)
			<input id="duree" type="number" bind:value={durationYears} min="1" max="50" />
		</label>
	</div>

	<div class="input-group">
		<label for="dateDebut">
			Date de début du prêt
			<input id="dateDebut" type="date" bind:value={startDate} />
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
				<input id="mensualite" type="number" bind:value={monthlyPayment} min="100" step="10" />
			</label>
		</div>
	{/if}

	{#if calculationMode === 'variable'}
		<VariablePaymentPeriods
			bind:monthlyPayment
			bind:paymentPeriods
			{durationYears}
		/>
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
			<button on:click={onSaveLoan} class="btn-primary"> 💾 Sauvegarder </button>
		</div>
	</div>
</div>

<style>
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
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		white-space: nowrap;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-primary:active {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.calculator {
			padding: 1.5rem;
		}

		.mode-selector {
			flex-direction: column;
			gap: 1rem;
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
	}
</style>
