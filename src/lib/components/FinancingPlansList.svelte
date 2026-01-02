<script lang="ts">
	import type { FinancingPlan } from '$lib/services';
	import FinancingPlanCard from './FinancingPlanCard.svelte';

	export let financingPlans: FinancingPlan[];
	export let onDelete: (index: number) => void;

	let showFinancingPlans = false;
</script>

{#if financingPlans.length > 0}
	<div class="plans-list">
		<div class="plans-header">
			<h3>Plans créés ({financingPlans.length})</h3>
			<button on:click={() => (showFinancingPlans = !showFinancingPlans)} class="btn-secondary">
				{showFinancingPlans ? '▼ Masquer' : '▶ Afficher'}
			</button>
		</div>

		{#if showFinancingPlans}
			<div class="plans-grid">
				{#each financingPlans as plan, index}
					<FinancingPlanCard {plan} {index} {onDelete} />
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.plans-list {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 2px solid #e0e0e0;
	}

	.plans-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	h3 {
		color: #333;
		font-size: 1.2rem;
		margin: 0;
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

	.plans-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;
	}

	@media (max-width: 768px) {
		.plans-header {
			flex-direction: column;
			align-items: stretch;
		}

		.plans-header button {
			width: 100%;
		}

		.plans-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
