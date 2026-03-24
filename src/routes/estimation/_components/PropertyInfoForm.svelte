<script lang="ts">
	import type { PropertyType } from './types';

	type Props = {
		propertyValue: number;
		downPayment: number;
		propertyType: PropertyType;
	};

	let {
		propertyValue = $bindable(),
		downPayment = $bindable(),
		propertyType = $bindable()
	}: Props = $props();
</script>

<div class="form-grid">
	<div class="form-group">
		<label for="property-value">
			<span class="label-text">💰 Valeur du bien</span>
			<span class="label-hint">Prix de vente affiché</span>
		</label>
		<input
			id="property-value"
			type="number"
			bind:value={propertyValue}
			min="50000"
			max="10000000"
			step="5000"
			class="input-field"
		/>
		<div class="input-hint">{propertyValue.toLocaleString('fr-FR')} €</div>
	</div>

	<div class="form-group">
		<label for="down-payment">
			<span class="label-text">💵 Apport personnel</span>
			<span class="label-hint">Votre épargne disponible</span>
		</label>
		<input
			id="down-payment"
			type="number"
			bind:value={downPayment}
			min="0"
			max={propertyValue}
			step="1000"
			class="input-field"
		/>
		<div class="input-hint">
			{downPayment.toLocaleString('fr-FR')} € ({((downPayment / propertyValue) * 100).toFixed(1)}%
			du bien)
		</div>
	</div>

	<div class="form-group">
		<div class="field-label">
			<span class="label-text">🏗️ Type de bien</span>
			<span class="label-hint">Impacte les frais de notaire</span>
		</div>
		<div class="property-type-selector">
			<button
				type="button"
				class="type-button"
				class:active={propertyType === 'new'}
				onclick={() => (propertyType = 'new')}
			>
				<span class="type-icon">🏗️</span>
				<span class="type-label">Neuf</span>
				<span class="type-desc">~2-3% de frais</span>
			</button>
			<button
				type="button"
				class="type-button"
				class:active={propertyType === 'old'}
				onclick={() => (propertyType = 'old')}
			>
				<span class="type-icon">🏛️</span>
				<span class="type-label">Ancien</span>
				<span class="type-desc">~7-8% de frais</span>
			</button>
		</div>
	</div>
</div>

<style>
	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

	.input-field {
		padding: 0.75rem;
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

	.input-hint {
		font-size: 0.85rem;
		color: #667eea;
		font-weight: 500;
	}

	.property-type-selector {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.type-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.type-button:hover {
		border-color: #cbd5e0;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.type-button.active {
		border-color: #667eea;
		background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
	}

	.type-icon {
		font-size: 2rem;
	}

	.type-label {
		font-weight: 600;
		color: #1a202c;
		font-size: 1rem;
	}

	.type-desc {
		font-size: 0.8rem;
		color: #718096;
	}

	@media (max-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
