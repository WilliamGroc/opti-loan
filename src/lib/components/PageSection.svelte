<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		subtitle?: string;
		icon?: string;
		collapsible?: boolean;
		defaultExpanded?: boolean;
		variant?: 'default' | 'primary' | 'secondary';
		children: Snippet;
	};

	let {
		title,
		subtitle = '',
		icon = '',
		collapsible = false,
		defaultExpanded = true,
		variant = 'default',
		children
	}: Props = $props();

	let isExpanded = $state(defaultExpanded);

	function toggleExpanded() {
		if (collapsible) {
			isExpanded = !isExpanded;
		}
	}
</script>

<section class="page-section {variant}" class:collapsed={!isExpanded}>
	{#snippet sectionTitleGroup()}
		<div class="section-title-group">
			{#if icon}
				<span class="section-icon">{icon}</span>
			{/if}
			<div class="section-text">
				<h2 class="section-title">{title}</h2>
				{#if subtitle}
					<p class="section-subtitle">{subtitle}</p>
				{/if}
			</div>
		</div>
	{/snippet}

	{#if collapsible}
		<button
			class="section-header clickable"
			type="button"
			onclick={toggleExpanded}
			aria-expanded={isExpanded}
			aria-label={`${title}. ${isExpanded ? 'Cliquez pour réduire' : 'Cliquez pour développer'}`}
		>
			{@render sectionTitleGroup()}

			<span class="collapse-toggle" aria-hidden="true">
				{isExpanded ? '▼' : '▶'}
			</span>
		</button>
	{:else}
		<div class="section-header">
			{@render sectionTitleGroup()}
		</div>
	{/if}

	{#if isExpanded}
		<div class="section-content">
			{@render children()}
		</div>
	{/if}
</section>

<style>
	.page-section {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		margin-bottom: 1.5rem;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.page-section:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
	}

	.page-section.primary {
		border: 2px solid #667eea;
	}

	.page-section.secondary {
		background: linear-gradient(135deg, #f0f0ff 0%, #fef5ff 100%);
	}

	.section-header {
		padding: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		border-bottom: 1px solid #f0f0f0;
		width: 100%;
		background: transparent;
		border-top: none;
		border-left: none;
		border-right: none;
		text-align: left;
		font: inherit;
	}

	.section-header.clickable {
		cursor: pointer;
		user-select: none;
		transition: background 0.2s ease;
	}

	.section-header.clickable:hover {
		background: #fafafa;
	}

	.section-header.clickable:focus-visible {
		outline: 2px solid #667eea;
		outline-offset: -2px;
	}

	.section-title-group {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		flex: 1;
	}

	.section-text {
		flex: 1;
	}

	.section-icon {
		font-size: 1.75rem;
		line-height: 1;
	}

	.section-title {
		margin: 0;
		font-size: 1.375rem;
		color: #1a202c;
		font-weight: 600;
	}

	.section-subtitle {
		margin: 0.25rem 0 0 0;
		font-size: 0.875rem;
		color: #718096;
	}

	.collapse-toggle {
		font-size: 1rem;
		color: #667eea;
		padding: 0.5rem;
		transition: transform 0.2s;
		flex-shrink: 0;
	}

	.section-header.clickable:hover .collapse-toggle {
		transform: scale(1.1);
	}

	.section-content {
		padding: 1.5rem;
		animation: fadeIn 0.3s ease;
	}

	.page-section.collapsed {
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.section-header {
			padding: 1rem;
		}

		.section-content {
			padding: 1rem;
		}

		.section-title {
			font-size: 1.125rem;
		}

		.section-icon {
			font-size: 1.5rem;
		}
	}
</style>
