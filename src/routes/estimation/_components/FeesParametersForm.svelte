<script lang="ts">
	import type { PropertyType } from './types';

	type Props = {
		propertyType: PropertyType;
		notaryFeesPercentNew: number;
		notaryFeesPercentOld: number;
		fileFeePercent: number;
		insurancePercent: number;
		guaranteePercent: number;
		loanRate: number;
		loanDuration: number;
	};

	let {
		propertyType,
		notaryFeesPercentNew = $bindable(),
		notaryFeesPercentOld = $bindable(),
		fileFeePercent = $bindable(),
		insurancePercent = $bindable(),
		guaranteePercent = $bindable(),
		loanRate = $bindable(),
		loanDuration = $bindable()
	}: Props = $props();
</script>

<div class="fees-grid">
	{#if propertyType === 'new'}
		<div class="form-group">
			<label for="notary-new">
				<span class="label-text">📋 Frais de notaire (Neuf)</span>
				<span class="label-hint">Généralement 2-3%</span>
			</label>
			<div class="input-with-unit">
				<input
					id="notary-new"
					type="number"
					bind:value={notaryFeesPercentNew}
					min="2"
					max="3"
					step="0.1"
					class="input-field"
				/>
				<span class="unit">%</span>
			</div>
		</div>
	{:else}
		<div class="form-group">
			<label for="notary-old">
				<span class="label-text">📋 Frais de notaire (Ancien)</span>
				<span class="label-hint">Généralement 7-8%</span>
			</label>
			<div class="input-with-unit">
				<input
					id="notary-old"
					type="number"
					bind:value={notaryFeesPercentOld}
					min="7"
					max="8"
					step="0.1"
					class="input-field"
				/>
				<span class="unit">%</span>
			</div>
		</div>
	{/if}

	<div class="form-group">
		<label for="file-fee">
			<span class="label-text">📄 Frais de dossier bancaire</span>
			<span class="label-hint">Sur le montant emprunté</span>
		</label>
		<div class="input-with-unit">
			<input
				id="file-fee"
				type="number"
				bind:value={fileFeePercent}
				min="0.5"
				max="1.5"
				step="0.1"
				class="input-field"
			/>
			<span class="unit">%</span>
		</div>
	</div>

	<div class="form-group">
		<label for="insurance">
			<span class="label-text">🛡️ Assurance emprunteur</span>
			<span class="label-hint">Taux annuel</span>
		</label>
		<div class="input-with-unit">
			<input
				id="insurance"
				type="number"
				bind:value={insurancePercent}
				min="0.2"
				max="0.6"
				step="0.05"
				class="input-field"
			/>
			<span class="unit">%/an</span>
		</div>
	</div>

	<div class="form-group">
		<label for="guarantee">
			<span class="label-text">🔒 Garantie de prêt</span>
			<span class="label-hint">Caution ou hypothèque</span>
		</label>
		<div class="input-with-unit">
			<input
				id="guarantee"
				type="number"
				bind:value={guaranteePercent}
				min="1"
				max="2"
				step="0.1"
				class="input-field"
			/>
			<span class="unit">%</span>
		</div>
	</div>

	<div class="form-group">
		<label for="loan-rate">
			<span class="label-text">📈 Taux d'intérêt du prêt</span>
			<span class="label-hint">Taux annuel nominal</span>
		</label>
		<div class="input-with-unit">
			<input
				id="loan-rate"
				type="number"
				bind:value={loanRate}
				min="0.1"
				max="5"
				step="0.05"
				class="input-field"
			/>
			<span class="unit">%</span>
		</div>
	</div>

	<div class="form-group">
		<label for="loan-duration">
			<span class="label-text">⏱️ Durée du prêt</span>
			<span class="label-hint">Période de remboursement</span>
		</label>
		<div class="input-with-unit">
			<input
				id="loan-duration"
				type="number"
				bind:value={loanDuration}
				min="5"
				max="30"
				step="1"
				class="input-field"
			/>
			<span class="unit">ans</span>
		</div>
	</div>
</div>

<style>
	.fees-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		background-color: white;
		padding: 1.5rem;
		border-radius: 12px;
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

	.input-with-unit {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-field {
		flex: 1;
		padding: 0.75rem;
		padding-right: 3.5rem;
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

	.unit {
		position: absolute;
		right: 1rem;
		color: #718096;
		font-weight: 600;
		font-size: 0.9rem;
		pointer-events: none;
	}

	@media (max-width: 768px) {
		.fees-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
