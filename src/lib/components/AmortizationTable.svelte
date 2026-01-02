<script lang="ts">
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';

	interface LoanData {
		name: string;
		monthlyPayment: number;
		principal: number;
		interest: number;
		remaining: number;
	}

	interface AmortizationRow {
		month: number;
		date: Date;
		loansData: LoanData[];
		totalMonthlyPayment: number;
		totalPrincipal: number;
		totalInterest: number;
		totalRemaining: number;
	}

	export let data: AmortizationRow[];
	export let showFull = false;
	export let variant: 'default' | 'optimized' = 'default';
	export let onToggleFull: (() => void) | undefined = undefined;
</script>

{#if onToggleFull}
	<div class="button-container">
		<button on:click={onToggleFull} class="btn-toggle">
			{showFull ? '📊 Affichage condensé' : '📊 Afficher toutes les mensualités'}
		</button>
	</div>
{/if}
<div class="table-wrapper">
	<table class="amortization-table" class:optimized={variant === 'optimized'}>
		<thead>
			<tr>
				<th rowspan="2">Mois</th>
				<th rowspan="2">Date</th>
				<th rowspan="2">Prêt</th>
				<th colspan="3">Détails du paiement{variant === 'optimized' ? ' optimisé' : ''}</th>
				<th rowspan="2">Restant dû (par prêt)</th>
			</tr>
			<tr>
				<th>Mensualité</th>
				<th>Capital</th>
				<th>Intérêts</th>
			</tr>
		</thead>
		<tbody>
			{#each data as row, i}
				{#if showFull || i < 12 || i >= data.length - 12 || i % 12 === 0}
					{#each row.loansData as loanData, loanIndex}
						<tr class="loan-row" class:optimized={variant === 'optimized'}>
							{#if loanIndex === 0}
								<td rowspan={row.loansData.length + 1} class="month-cell">{row.month}</td>
								<td rowspan={row.loansData.length + 1} class="date-cell"
									>{format(row.date, 'MMM yyyy', { locale: fr })}</td
								>
							{/if}
							<td class="loan-name-cell">{loanData.name}</td>
							<td class:optimized-value={variant === 'optimized'}
								>{loanData.monthlyPayment.toFixed(2)} €</td
							>
							<td class:optimized-value={variant === 'optimized'}
								>{loanData.principal.toFixed(2)} €</td
							>
							<td class:optimized-value={variant === 'optimized'}
								>{loanData.interest.toFixed(2)} €</td
							>
							<td class:optimized-value={variant === 'optimized'}
								>{loanData.remaining.toFixed(2)} €</td
							>
						</tr>
					{/each}
					<tr class="total-row" class:optimized={variant === 'optimized'}>
						<td class="total-label">TOTAL</td>
						<td class="total-value" class:optimized={variant === 'optimized'}
							>{row.totalMonthlyPayment.toFixed(2)} €</td
						>
						<td class="total-value" class:optimized={variant === 'optimized'}
							>{row.totalPrincipal.toFixed(2)} €</td
						>
						<td class="total-value" class:optimized={variant === 'optimized'}
							>{row.totalInterest.toFixed(2)} €</td
						>
						<td class="total-value" class:optimized={variant === 'optimized'}
							>{row.totalRemaining.toFixed(2)} €</td
						>
					</tr>
				{:else if i === 12 && !showFull}
					<tr class="ellipsis">
						<td colspan="8">...</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-wrapper {
		overflow-x: auto;
		margin-bottom: 1.5rem;
	}

	.button-container {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}

	.amortization-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	.amortization-table th {
		background: #667eea;
		color: white;
		padding: 0.75rem;
		text-align: center;
		vertical-align: middle;
		border-bottom: 2px solid #e0e0e0;
	}

	.amortization-table td {
		padding: 0.75rem;
		text-align: center;
		vertical-align: middle;
		border-bottom: 1px solid #e0e0e0;
	}

	.amortization-table .month-cell,
	.amortization-table .date-cell {
		background: #f8f9fa;
		font-weight: 600;
		border-right: 2px solid #e0e0e0;
	}

	.amortization-table .loan-name-cell {
		text-align: left;
		color: #667eea;
		font-weight: 500;
		padding-left: 1rem;
	}

	.amortization-table .loan-row {
		border-bottom: 1px solid #f0f0f0;
	}

	.amortization-table .loan-row:hover {
		background: #fafafa;
	}

	.amortization-table .total-row {
		background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
		font-weight: 700;
		border-top: 2px solid #667eea;
		border-bottom: 2px solid #667eea;
	}

	.amortization-table .total-label {
		text-align: left;
		padding-left: 1rem;
		color: #667eea;
		font-size: 0.85rem;
		letter-spacing: 0.5px;
	}

	.amortization-table .total-value {
		color: #667eea;
		font-weight: 700;
	}

	.amortization-table.optimized th {
		background: #28a745;
	}

	.amortization-table.optimized .total-row {
		background: linear-gradient(135deg, #28a74520 0%, #20c99720 100%);
		border-top: 2px solid #28a745;
		border-bottom: 2px solid #28a745;
	}

	.amortization-table.optimized .total-label {
		color: #28a745;
	}

	.amortization-table.optimized .total-value {
		color: #28a745;
	}

	.amortization-table .optimized-value {
		color: #28a745;
		font-weight: 500;
	}

	.amortization-table tr.ellipsis td {
		text-align: center;
		font-weight: bold;
		color: #999;
	}

	.btn-toggle {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-toggle:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
	}

	@media (max-width: 768px) {
		.amortization-table {
			font-size: 0.75rem;
		}

		.amortization-table th,
		.amortization-table td {
			padding: 0.5rem 0.3rem;
		}

		.amortization-table .loan-name-cell,
		.amortization-table .total-label {
			padding-left: 0.5rem;
			font-size: 0.75rem;
		}
	}
</style>
