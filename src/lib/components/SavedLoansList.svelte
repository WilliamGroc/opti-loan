<script lang="ts">
	import type { SavedLoan } from '$lib/services';
	import LoanCard from './LoanCard.svelte';
	import { exportLoans } from '$lib/services';

	export let savedLoans: SavedLoan[];
	export let onLoad: (loan: SavedLoan) => void;
	export let onDelete: (id: string) => void;
	export let onClone: (loan: SavedLoan) => void;

	let showSavedLoans = false;

	function handleExportLoans() {
		exportLoans(savedLoans);
	}
</script>

{#if savedLoans.length > 0}
	<div class="saved-loans">
		<div class="saved-loans-header">
			<h2>Prêts sauvegardés ({savedLoans.length})</h2>
			<div class="header-actions">
				<button on:click={() => (showSavedLoans = !showSavedLoans)} class="btn-secondary">
					{showSavedLoans ? '▼ Masquer' : '▶ Afficher'}
				</button>
				<button on:click={handleExportLoans} class="btn-secondary"> 📥 Exporter </button>
			</div>
		</div>

		{#if showSavedLoans}
			<div class="loans-grid">
				{#each savedLoans as loan}
					<LoanCard {loan} {onLoad} {onDelete} {onClone} />
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.saved-loans {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.saved-loans-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	h2 {
		color: #333;
		font-size: 1.5rem;
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
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

	.loans-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;
	}

	@media (max-width: 768px) {
		.saved-loans {
			padding: 1.5rem;
		}

		.saved-loans-header {
			flex-direction: column;
			align-items: stretch;
		}

		.header-actions {
			justify-content: stretch;
			flex-direction: column;
		}

		.loans-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
