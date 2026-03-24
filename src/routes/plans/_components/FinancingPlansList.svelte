<script lang="ts">
	import FinancingPlanCard from './FinancingPlanCard.svelte';
	import { createPlansListStore } from '$lib/composables';

	const plansStore = createPlansListStore();

	$effect(() => {
		plansStore.refresh();
	});
</script>

{#if $plansStore.length > 0}
	<div class="plans-list">
		<div class="plans-grid">
			{#each $plansStore as plan (plan.id)}
				<FinancingPlanCard {plan} />
			{/each}
		</div>
	</div>
{:else}
	<p class="empty-message">Aucun plan créé pour le moment.</p>
{/if}

<style>
	.plans-list {
		width: 100%;
	}

	.empty-message {
		text-align: center;
		color: #718096;
		font-size: 1.1rem;
		padding: 2rem;
	}

	.plans-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	@media (max-width: 768px) {
		.plans-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
