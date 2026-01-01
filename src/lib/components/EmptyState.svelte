<script lang="ts">
	export let title: string;
	export let description: string;
	export let icon: string = '📋';
	export let buttonText: string = 'Action';
	export let buttonHref: string | undefined = undefined;
	export let onButtonClick: (() => void) | undefined = undefined;
</script>

<div class="empty-state">
	<div class="empty-icon">{icon}</div>
	<h2>{title}</h2>
	<p>{description}</p>
	{#if buttonHref}
		<a href={buttonHref} class="btn-primary">{buttonText}</a>
	{:else if onButtonClick}
		<button class="btn-primary" on:click={onButtonClick}>{buttonText}</button>
	{/if}
</div>

<style>
	.empty-state {
		background: white;
		border-radius: 12px;
		padding: 3rem;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-state h2 {
		color: #333;
		margin: 0 0 0.5rem 0;
	}

	.empty-state p {
		color: #666;
		margin: 0 0 1.5rem 0;
	}

	.btn-primary {
		display: inline-block;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.75rem 2rem;
		border-radius: 8px;
		text-decoration: none;
		border: none;
		font-weight: 600;
		transition: all 0.2s;
		cursor: pointer;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}
</style>
