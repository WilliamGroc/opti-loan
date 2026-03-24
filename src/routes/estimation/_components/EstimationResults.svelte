<script lang="ts">
	import type { EstimationResult, PropertyType } from './types';
	import { PageSection } from '$lib/components';

	type Props = {
		result: EstimationResult;
		propertyType: PropertyType;
		loanDuration: number;
		loanRate: number;
		notaryFeesPercentNew: number;
		notaryFeesPercentOld: number;
		fileFeePercent: number;
		insurancePercent: number;
		guaranteePercent: number;
	};

	let {
		result,
		propertyType,
		loanDuration,
		loanRate,
		notaryFeesPercentNew,
		notaryFeesPercentOld,
		fileFeePercent,
		insurancePercent,
		guaranteePercent
	}: Props = $props();

	let hasIncome = $derived(result.totalMonthlyIncome > 0);
	let isAffordable = $derived(result.maxPropertyValue >= result.propertyValue);
	let debtOk = $derived(result.debtRatio <= 33);
</script>

<!-- Résumé principal -->
<PageSection title="💰 Votre capacité d'achat" icon="🎯" variant="primary">
	{#if hasIncome}
		<div class="capacity-cards">
			<div class="capacity-card {isAffordable ? 'success' : 'warning'}">
				<div class="card-header">
					<span class="card-icon">{isAffordable ? '✅' : '⚠️'}</span>
					<span class="card-title">Prix maximum du bien</span>
				</div>
				<div class="card-value">{result.maxPropertyValue.toLocaleString('fr-FR')} €</div>
				<div class="card-description">
					{#if isAffordable}
						Ce bien est dans votre budget
					{:else}
						Dépassement de {(result.propertyValue - result.maxPropertyValue).toLocaleString(
							'fr-FR'
						)} €
					{/if}
				</div>
			</div>

			<div class="capacity-card">
				<div class="card-header">
					<span class="card-icon">🏦</span>
					<span class="card-title">Capacité d'emprunt</span>
				</div>
				<div class="card-value">{result.maxLoanCapacity.toLocaleString('fr-FR')} €</div>
				<div class="card-description">
					Avec {result.maxMonthlyPayment.toLocaleString('fr-FR')} €/mois max
				</div>
			</div>

			<div class="capacity-card {debtOk ? 'success' : 'warning'}">
				<div class="card-header">
					<span class="card-icon">{debtOk ? '✅' : '⚠️'}</span>
					<span class="card-title">Taux d'endettement</span>
				</div>
				<div class="card-value">{result.debtRatio.toFixed(1)}%</div>
				<div class="card-description">{debtOk ? 'Dans la norme' : 'Au-dessus de 33%'}</div>
			</div>
		</div>
	{:else}
		<div class="no-income-message">
			<span class="message-icon">ℹ️</span>
			<p>
				Renseignez vos revenus mensuels pour voir votre capacité d'achat et le prix maximum du bien
				que vous pouvez acquérir.
			</p>
		</div>
	{/if}
</PageSection>

<!-- Mensualité et coût -->
<PageSection title="💳 Mensualité et coût global" icon="💸">
	<div class="cost-summary">
		<div class="cost-card primary">
			<div class="cost-icon">💳</div>
			<div class="cost-content">
				<div class="cost-label">Mensualité du prêt</div>
				<div class="cost-value">{result.monthlyPayment.toLocaleString('fr-FR')} €</div>
				<div class="cost-detail">Sur {loanDuration} ans à {loanRate}%</div>
			</div>
		</div>

		<div class="cost-card">
			<div class="cost-icon">💰</div>
			<div class="cost-content">
				<div class="cost-label">Coût total du projet</div>
				<div class="cost-value">{result.totalProjectCost.toLocaleString('fr-FR')} €</div>
				<div class="cost-detail">Bien + Frais initiaux</div>
			</div>
		</div>

		<div class="cost-card danger">
			<div class="cost-icon">💸</div>
			<div class="cost-content">
				<div class="cost-label">Coût réel total</div>
				<div class="cost-value">{result.totalCostWithInterest.toLocaleString('fr-FR')} €</div>
				<div class="cost-detail">Avec intérêts et assurance</div>
			</div>
		</div>
	</div>
</PageSection>

<!-- Détails des frais -->
<PageSection title="📋 Détail des frais" icon="🔍" collapsible={true} defaultExpanded={false}>
	<div class="fees-grid">
		<div class="fee-item">
			<div class="fee-header">
				<span class="fee-icon">📋</span>
				<span class="fee-name">Frais de notaire</span>
			</div>
			<div class="fee-amount">{result.notaryFees.toLocaleString('fr-FR')} €</div>
			<div class="fee-calc">
				{propertyType === 'new' ? notaryFeesPercentNew : notaryFeesPercentOld}% × {result.propertyValue.toLocaleString(
					'fr-FR'
				)} €
			</div>
		</div>

		<div class="fee-item">
			<div class="fee-header">
				<span class="fee-icon">📄</span>
				<span class="fee-name">Frais de dossier</span>
			</div>
			<div class="fee-amount">{result.fileFees.toLocaleString('fr-FR')} €</div>
			<div class="fee-calc">
				{fileFeePercent}% × {result.loanAmount.toLocaleString('fr-FR')} €
			</div>
		</div>

		<div class="fee-item">
			<div class="fee-header">
				<span class="fee-icon">🔒</span>
				<span class="fee-name">Garantie</span>
			</div>
			<div class="fee-amount">{result.guarantee.toLocaleString('fr-FR')} €</div>
			<div class="fee-calc">
				{guaranteePercent}% × {result.loanAmount.toLocaleString('fr-FR')} €
			</div>
		</div>

		<div class="fee-item highlight">
			<div class="fee-header">
				<span class="fee-icon">📦</span>
				<span class="fee-name">Total frais initiaux</span>
			</div>
			<div class="fee-amount">{result.totalInitialCost.toLocaleString('fr-FR')} €</div>
			<div class="fee-calc">À payer au départ</div>
		</div>

		<div class="fee-item">
			<div class="fee-header">
				<span class="fee-icon">🛡️</span>
				<span class="fee-name">Assurance annuelle</span>
			</div>
			<div class="fee-amount">{result.insuranceYearly.toLocaleString('fr-FR')} €/an</div>
			<div class="fee-calc">
				{insurancePercent}% × {result.loanAmount.toLocaleString('fr-FR')} €
			</div>
		</div>

		<div class="fee-item">
			<div class="fee-header">
				<span class="fee-icon">📈</span>
				<span class="fee-name">Intérêts totaux</span>
			</div>
			<div class="fee-amount">{result.totalInterest.toLocaleString('fr-FR')} €</div>
			<div class="fee-calc">Sur {loanDuration} ans</div>
		</div>
	</div>
</PageSection>

<!-- Informations -->
<PageSection
	title="ℹ️ Informations importantes"
	icon="💡"
	variant="secondary"
	collapsible={true}
	defaultExpanded={false}
>
	<div class="info-content">
		<div class="info-item">
			<span class="info-icon">📊</span>
			<div class="info-text">
				<strong>Taux d'endettement :</strong> La limite recommandée est de 33% de vos revenus mensuels.
				Un taux supérieur peut compliquer l'obtention du prêt.
			</div>
		</div>

		<div class="info-item">
			<span class="info-icon">🏠</span>
			<div class="info-text">
				<strong>Prix maximum :</strong> Calculé en tenant compte de TOUS les frais (notaire, dossier,
				garantie) et de votre apport personnel, dans la limite de 33% d'endettement.
			</div>
		</div>

		<div class="info-item">
			<span class="info-icon">💰</span>
			<div class="info-text">
				<strong>Coût réel :</strong> Inclut le prix du bien, tous les frais, les intérêts du prêt et l'assurance
				emprunteur sur toute la durée.
			</div>
		</div>

		<div class="info-item">
			<span class="info-icon">⚠️</span>
			<div class="info-text">
				<strong>Estimations :</strong> Les pourcentages sont des moyennes. Les frais réels peuvent varier
				selon les banques et notaires.
			</div>
		</div>
	</div>
</PageSection>

<style>
	/* Capacity Cards */
	.capacity-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-bottom: 1rem;
	}

	.capacity-card {
		background: white;
		border: 3px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.2s;
	}

	.capacity-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
	}

	.capacity-card.success {
		border-color: #48bb78;
		background: linear-gradient(135deg, #48bb7808 0%, #38a16908 100%);
	}

	.capacity-card.warning {
		border-color: #ed8936;
		background: linear-gradient(135deg, #ed893608 0%, #dd672708 100%);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.card-icon {
		font-size: 1.5rem;
	}

	.card-title {
		font-weight: 600;
		color: #4a5568;
		font-size: 0.9rem;
	}

	.card-value {
		font-size: 2rem;
		font-weight: 700;
		color: #1a202c;
		margin-bottom: 0.5rem;
	}

	.card-description {
		color: #718096;
		font-size: 0.9rem;
	}

	.no-income-message {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
		border: 2px solid #667eea30;
		border-radius: 12px;
	}

	.message-icon {
		font-size: 2rem;
	}

	.no-income-message p {
		margin: 0;
		color: #4a5568;
		line-height: 1.6;
	}

	/* Cost Summary */
	.cost-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.cost-card {
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		transition: all 0.2s;
	}

	.cost-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
	}

	.cost-card.primary {
		background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
		border-color: #667eea;
	}

	.cost-card.danger {
		background: linear-gradient(135deg, #fc858515 0%, #f2709c15 100%);
		border-color: #fc8585;
	}

	.cost-icon {
		font-size: 2.5rem;
		flex-shrink: 0;
	}

	.cost-content {
		flex: 1;
	}

	.cost-label {
		font-weight: 600;
		color: #4a5568;
		font-size: 0.9rem;
		margin-bottom: 0.25rem;
	}

	.cost-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a202c;
		margin-bottom: 0.25rem;
	}

	.cost-detail {
		font-size: 0.85rem;
		color: #718096;
	}

	/* Fees Grid */
	.fees-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.fee-item {
		background: #f7fafc;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		padding: 1rem;
	}

	.fee-item.highlight {
		background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
		border-color: #667eea;
	}

	.fee-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.fee-icon {
		font-size: 1.25rem;
	}

	.fee-name {
		font-weight: 600;
		color: #4a5568;
		font-size: 0.9rem;
	}

	.fee-amount {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1a202c;
		margin-bottom: 0.25rem;
	}

	.fee-calc {
		font-size: 0.8rem;
		color: #718096;
	}

	/* Info Content */
	.info-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.info-item {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: white;
		border-radius: 8px;
		border: 2px solid #e2e8f0;
	}

	.info-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.info-text {
		color: #4a5568;
		line-height: 1.6;
	}

	.info-text strong {
		color: #1a202c;
	}

	@media (max-width: 768px) {
		.capacity-cards,
		.cost-summary,
		.fees-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
