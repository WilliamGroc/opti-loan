<script lang="ts">
	export let label: string;
	export let value: string;
	export let variant: 'default' | 'optimized' | 'savings' = 'default';
</script>

<div class="summary-card" class:optimized={variant === 'optimized'} class:savings={variant === 'savings'}>
	<span class="label">{label}</span>
	<span class="value" class:highlight={variant !== 'default'}>{value}</span>
</div>

<style>
	.summary-card {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.summary-card .label {
		color: #666;
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
	}

	.summary-card .value {
		color: #667eea;
		font-size: 1.3rem;
		font-weight: 700;
	}

	.summary-card .value.highlight {
		font-size: 1.5rem;
	}

	.summary-card.optimized {
		border: 2px solid #28a745;
		background: #f0fff4;
	}

	.summary-card.optimized .value {
		color: #28a745;
	}

	.summary-card.savings {
		border: 2px solid #ffc107;
		background: #fffbf0;
	}

	.summary-card.savings .value {
		color: #ff6b00;
		font-size: 1.5rem;
	}
</style>
