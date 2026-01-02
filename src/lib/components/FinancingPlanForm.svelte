<script lang="ts">
	import type { SavedLoan } from '$lib/services';
	import { createFinancingPlan } from '$lib/services';

	export let savedLoans: SavedLoan[];
	export let financingPlans: any[] = [];
	export let onPlanCreated: (plans: any[]) => void;

	let financingPlanName = '';
	let selectedLoansForPlan: Set<string> = new Set();

	function handleCreateFinancingPlan() {
		if (!financingPlanName.trim()) {
			alert('Veuillez entrer un nom pour ce plan');
			return;
		}

		if (selectedLoansForPlan.size === 0) {
			alert('Veuillez sélectionner au moins un prêt');
			return;
		}

		const selectedLoans = savedLoans.filter((loan) => selectedLoansForPlan.has(loan.id));
		const updatedPlans = createFinancingPlan(financingPlans, financingPlanName, selectedLoans);

		onPlanCreated(updatedPlans);
		financingPlanName = '';
		selectedLoansForPlan = new Set();
		alert('Plan de financement créé avec succès !');
	}
</script>

{#if savedLoans.length > 0}
	<div class="plan-creation">
		<h3>Créer un nouveau plan</h3>
		<div class="plan-input">
			<input
				type="text"
				placeholder="Nom du plan (ex: Investissement immobilier 2025)"
				bind:value={financingPlanName}
				class="plan-name-input"
			/>
		</div>

		<div class="loans-selection">
			<h4>Sélectionner les prêts à inclure :</h4>
			<div class="selection-list">
				{#each savedLoans as loan}
					<label class="loan-checkbox">
						<input
							type="checkbox"
							checked={selectedLoansForPlan.has(loan.id)}
							on:change={(e) => {
								if ((e.target as HTMLInputElement)?.checked) {
									selectedLoansForPlan.add(loan.id);
								} else {
									selectedLoansForPlan.delete(loan.id);
								}
								selectedLoansForPlan = selectedLoansForPlan;
							}}
						/>
						<span class="checkbox-label">
							<strong>{loan.name}</strong> - {loan.amount.toLocaleString('fr-FR')} € ({loan.durationYears}
							ans)
						</span>
					</label>
				{/each}
			</div>
		</div>

		<button on:click={handleCreateFinancingPlan} class="btn-create-plan"> 📋 Créer le plan </button>
	</div>
{:else}
	<p class="info-message">
		Créez et sauvegardez au moins un prêt pour créer un plan de financement.
	</p>
{/if}

<style>
	.plan-creation {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 8px;
		border: 2px solid #e0e0e0;
		margin-bottom: 2rem;
	}

	h3 {
		color: #333;
		font-size: 1.2rem;
		margin-bottom: 1rem;
		margin-top: 0;
	}

	h4 {
		color: #555;
		font-size: 1.1rem;
		margin-bottom: 0.75rem;
		margin-top: 0;
	}

	.plan-input {
		margin-bottom: 1.5rem;
	}

	.plan-name-input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.3s;
		box-sizing: border-box;
	}

	.plan-name-input:focus {
		outline: none;
		border-color: #667eea;
	}

	.loans-selection {
		margin-bottom: 1.5rem;
	}

	.selection-list {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
		margin-bottom: 1rem;
	}

	.loan-checkbox {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.loan-checkbox:hover {
		background: #f5f5f5;
		border-radius: 4px;
	}

	.loan-checkbox input[type='checkbox'] {
		cursor: pointer;
		width: 18px;
		height: 18px;
	}

	.checkbox-label {
		color: #333;
		font-size: 0.95rem;
	}

	.btn-create-plan {
		width: 100%;
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
	}

	.btn-create-plan:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.info-message {
		color: #666;
		padding: 1rem;
		background: #f0f0f0;
		border-radius: 8px;
		margin: 1rem 0;
	}

	@media (max-width: 768px) {
		.plan-creation {
			padding: 1.25rem;
		}

		.selection-list {
			max-height: 300px;
			overflow-y: auto;
		}

		.loan-checkbox {
			padding: 0.5rem;
		}

		.checkbox-label {
			font-size: 0.85rem;
		}
	}
</style>
