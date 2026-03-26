<script lang="ts">
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import type { FinancingPlan } from '$lib/services';
	import { deleteFinancingPlanById } from '$lib/services';
	import { resolve } from '$app/paths';

	type Props = {
		plan: FinancingPlan;
	};

	let { plan }: Props = $props();

	function handleDelete() {
		if (confirm(`Voulez-vous vraiment supprimer le plan "${plan.name}" ?`)) {
			deleteFinancingPlanById(plan.id);
			// Trigger page refresh
			window.location.reload();
		}
	}
</script>

<div class="plan-card">
	<div class="plan-card-header">
		<h4>{plan.name}</h4>
		<button onclick={handleDelete} class="btn-delete" title="Supprimer"> 🗑️ </button>
	</div>

	<div class="plan-details">
		<div class="plan-detail">
			<span class="label">Nombre de prêts:</span>
			<span class="value">{plan.selectedLoans.length}</span>
		</div>
		<div class="plan-detail">
			<span class="label">Montant total:</span>
			<span class="value highlight"
				>{plan.loans?.reduce((sum, loan) => sum + loan.amount, 0).toLocaleString('fr-FR')} €</span
			>
		</div>
		<div class="plan-detail">
			<span class="label">Créé le:</span>
			<span class="value"
				>{format(new Date(plan.createdDate), 'dd/MM/yyyy HH:mm', {
					locale: fr
				})}</span
			>
		</div>
	</div>

	<div class="plan-loans-list">
		<h5>Prêts inclus:</h5>
		<ul>
			{#each plan.loans as loan (loan.id)}
				<li>
					{loan.name} - {loan.amount.toLocaleString('fr-FR')} € ({loan.durationYears} ans)
				</li>
			{/each}
		</ul>
	</div>

	<a href={resolve(`/plans/${plan.id}`)} class="btn-view-details"> 👁️ Voir les détails </a>
</div>

<style>
	.plan-card {
		background: #f8f9fa;
		border: 2px solid #e0e0e0;
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.3s;
	}

	.plan-card:hover {
		border-color: #667eea;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
		transform: translateY(-2px);
	}

	.plan-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.plan-card-header h4 {
		margin: 0;
		color: #333;
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

	.plan-details {
		margin-bottom: 1rem;
	}

	.plan-detail {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e0e0e0;
	}

	.plan-detail:last-child {
		border-bottom: none;
	}

	.plan-detail .label {
		color: #666;
		font-size: 0.9rem;
	}

	.plan-detail .value {
		color: #333;
		font-weight: 600;
	}

	.plan-detail .value.highlight {
		color: #667eea;
		font-weight: 700;
	}

	.plan-loans-list {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		border: 1px solid #e0e0e0;
	}

	.plan-loans-list h5 {
		margin-top: 0;
		margin-bottom: 0.5rem;
		color: #555;
		font-size: 1rem;
	}

	.plan-loans-list ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.plan-loans-list li {
		padding: 0.5rem 0;
		color: #555;
		font-size: 0.9rem;
		border-bottom: 1px solid #f0f0f0;
	}

	.plan-loans-list li:last-child {
		border-bottom: none;
	}

	.btn-view-details {
		display: block;
		width: 100%;
		padding: 0.75rem;
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		text-align: center;
	}

	.btn-view-details:hover {
		background: #667eea;
		color: white;
	}
</style>
