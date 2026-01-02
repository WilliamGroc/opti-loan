<script lang="ts">
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import type { SavedLoan } from '$lib/services';

	export let loan: SavedLoan;
	export let onLoad: (loan: SavedLoan) => void;
	export let onDelete: (id: string) => void;
	export let onClone: (loan: SavedLoan) => void;
</script>

<div class="loan-card">
	<div class="loan-card-header">
		<h3>{loan.name}</h3>
		<button on:click={() => onDelete(loan.id)} class="btn-delete" title="Supprimer">
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
			<span class="value"
				>{format(new Date(loan.saveDate), 'dd/MM/yyyy HH:mm', { locale: fr })}</span
			>
		</div>
	</div>
	<div class="loan-actions">
		<button on:click={() => onLoad(loan)} class="btn-load"> 📂 Charger </button>
		<button on:click={() => onClone(loan)} class="btn-clone"> 📋 Cloner </button>
	</div>
</div>

<style>
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
</style>
