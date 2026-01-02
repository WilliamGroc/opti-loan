<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'default' =
		'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let fullWidth = false;
	export let disabled = false;
</script>

<button class="btn btn-{variant} btn-{size}" class:full-width={fullWidth} {disabled} on:click>
	<slot />
</button>

<style>
	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		display: inline-block;
		font-size: 1rem;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #667eea;
		color: white;
	}

	.btn-danger {
		background: white;
		color: #ff6b6b;
		border: 2px solid #ff6b6b;
	}

	.btn-danger:hover:not(:disabled) {
		background: #ff6b6b;
		color: white;
		transform: scale(1.05);
	}

	.btn-success {
		background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
		color: white;
	}

	.btn-success:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
	}

	.btn-info {
		background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
		color: white;
	}

	.btn-info:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
	}

	.btn-default {
		background: white;
		color: #666;
		border: 2px solid #ddd;
	}

	.btn-default:hover:not(:disabled) {
		background: #f8f9fa;
		border-color: #667eea;
		color: #667eea;
	}

	.btn-sm {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
	}

	.btn-lg {
		padding: 1rem 2rem;
		font-size: 1.125rem;
	}

	.full-width {
		width: 100%;
	}
</style>
