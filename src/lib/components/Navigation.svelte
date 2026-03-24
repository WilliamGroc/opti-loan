<script lang="ts">
	import { resolve } from '$app/paths';
	let { currentPage = '' }: { currentPage?: '' | 'plans' | 'estimation' } = $props();
</script>

<nav class="main-navigation">
	<div class="nav-container">
		<div class="nav-brand">
			<a href={resolve('/')}>
				<span class="logo">💰</span>
				<span class="brand-name">Opti-Loan</span>
			</a>
		</div>

		<div class="nav-links">
			<a
				href={resolve('/')}
				class="nav-link"
				class:active={currentPage === ''}
				title="Calculateur de prêt"
			>
				🧮 Calculateur
			</a>
			<a
				href={resolve('/plans')}
				class="nav-link"
				class:active={currentPage === 'plans'}
				title="Vos plans de financement"
			>
				📋 Plans
			</a>
			<a
				href={resolve('/estimation')}
				class="nav-link"
				class:active={currentPage === 'estimation'}
				title="Estimation de capacité d'emprunt"
			>
				🏠 Estimation
			</a>
		</div>

		<div class="nav-actions">
			<a
				href="mailto:william.groc@gmail.com?subject=Feedback%20OptiLoan"
				class="btn-action btn-feedback"
				title="Envoyer un feedback"
			>
				💬 Feedback
			</a>
			<a
				href="https://www.paypal.com/paypalme/grocwilliam"
				target="_blank"
				rel="noopener noreferrer"
				class="btn-action btn-donate"
				title="Soutenir le projet"
			>
				❤️ Soutenir
			</a>
		</div>
	</div>
</nav>

<style>
	.main-navigation {
		background: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 100;
		margin-bottom: 2rem;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.nav-brand a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: #667eea;
		font-weight: bold;
		font-size: 1.25rem;
	}

	.logo {
		font-size: 1.5rem;
	}

	.brand-name {
		color: #333;
	}

	.nav-links {
		display: flex;
		gap: 0.5rem;
		flex: 1;
		justify-content: center;
	}

	.nav-link {
		padding: 0.625rem 1.25rem;
		border-radius: 8px;
		text-decoration: none;
		color: #666;
		font-weight: 500;
		transition: all 0.2s;
		border: 2px solid transparent;
	}

	.nav-link:hover {
		background: #f0f0ff;
		color: #667eea;
	}

	.nav-link.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
	}

	.nav-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-action {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.btn-feedback {
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.btn-feedback:hover {
		background: #e5e7eb;
	}

	.btn-donate {
		background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
		color: white;
		border: none;
	}

	.btn-donate:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(238, 90, 111, 0.3);
	}

	@media (max-width: 768px) {
		.nav-container {
			padding: 0.75rem 1rem;
		}

		.nav-links {
			order: 3;
			width: 100%;
			justify-content: space-around;
		}

		.nav-link {
			padding: 0.5rem 0.75rem;
			font-size: 0.875rem;
		}

		.brand-name {
			display: none;
		}

		.btn-action {
			font-size: 0.75rem;
			padding: 0.4rem 0.75rem;
		}
	}
</style>
