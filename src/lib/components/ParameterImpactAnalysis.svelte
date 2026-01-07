<script lang="ts">
	import { calculateLoan } from '$lib/services';
	import type { MonthlyPaymentPeriod } from '$lib/services';

	export let baseAmount: number;
	export let baseAnnualRate: number;
	export let baseDurationYears: number;
	export let startDate: string;
	export let calculationMode: 'payment' | 'duration' | 'variable' = 'payment';
	export let paymentPeriods: MonthlyPaymentPeriod[] = [];

	// Valeurs modifiables avec les sliders
	let currentAmount = baseAmount;
	let currentRate = baseAnnualRate;
	let currentDuration = baseDurationYears;

	// Calcul de base (référence)
	let baseResult = {
		monthlyPayment: 0,
		totalCost: 0,
		totalInterest: 0
	};

	// Résultat avec les valeurs actuelles des sliders
	let currentResult = {
		monthlyPayment: 0,
		totalCost: 0,
		totalInterest: 0
	};

	let hidden = true;

	// Plages min/max pour les sliders
	$: minAmount = Math.round(baseAmount * 0.5);
	$: maxAmount = Math.round(baseAmount * 1.5);
	$: minRate = Math.max(0.1, baseAnnualRate * 0.5);
	$: maxRate = baseAnnualRate * 1.5;
	$: minDuration = Math.max(1, Math.round(baseDurationYears * 0.5));
	$: maxDuration = Math.round(baseDurationYears * 1.5);

	function calculateResults() {
		// Calcul de base
		const base = calculateLoan(
			baseAmount,
			baseAnnualRate,
			baseDurationYears,
			0,
			startDate,
			calculationMode,
			paymentPeriods
		);

		baseResult = {
			monthlyPayment: base.monthlyPayment,
			totalCost: base.totalCost,
			totalInterest: base.totalInterest
		};

		// Calcul avec les valeurs actuelles
		const current = calculateLoan(
			currentAmount,
			currentRate,
			currentDuration,
			0,
			startDate,
			calculationMode,
			paymentPeriods
		);

		currentResult = {
			monthlyPayment: current.monthlyPayment,
			totalCost: current.totalCost,
			totalInterest: current.totalInterest
		};
	}

	function resetToBase() {
		currentAmount = baseAmount;
		currentRate = baseAnnualRate;
		currentDuration = baseDurationYears;
	}

	function getImpactClass(current: number, base: number): string {
		const diff = current - base;
		if (diff > 0) return 'negative';
		if (diff < 0) return 'positive';
		return 'neutral';
	}

	function formatDiff(current: number, base: number): string {
		const diff = current - base;
		const sign = diff > 0 ? '+' : '';
		return `${sign}${diff.toFixed(2)} €`;
	}

	function formatPercentDiff(current: number, base: number): string {
		if (base === 0) return '0 %';
		const diff = ((current - base) / base) * 100;
		const sign = diff > 0 ? '+' : '';
		return `${sign}${diff.toFixed(1)} %`;
	}

	// Recalculer quand les paramètres de base ou les sliders changent
	$: {
		(baseAmount,
			baseAnnualRate,
			baseDurationYears,
			currentAmount,
			currentRate,
			currentDuration,
			startDate);
		calculateResults();
	}

	// Réinitialiser les sliders quand les paramètres de base changent
	$: {
		(baseAmount, baseAnnualRate, baseDurationYears);
		currentAmount = baseAmount;
		currentRate = baseAnnualRate;
		currentDuration = baseDurationYears;
	}
</script>

<div class="impact-analysis">
	<div class="header">
		<h2>🎛️ Simulateur Interactif</h2>
		<button on:click={() => (hidden = !hidden)}>
			{#if hidden}👁️ Montrer{:else}🙈 Cacher{/if}
		</button>
	</div>
	{#if hidden}
		<p>
			Cliquez sur "Montrer l'analyse d'impact" pour explorer comment les variations des paramètres
			affectent votre prêt.
		</p>
	{:else}
		<button class="reset-btn" on:click={resetToBase}> 🔄 Réinitialiser </button>
		<p class="description">
			Utilisez les curseurs pour faire varier les paramètres de votre prêt et visualisez
			instantanément l'impact sur la mensualité, le coût total et les intérêts.
		</p>

		<div class="sliders-container">
			<!-- Slider Montant -->
			<div class="slider-group">
				<label for="amount-slider">
					<span class="label-text">💰 Montant du prêt</span>
					<span class="value-display">{currentAmount.toLocaleString('fr-FR')} €</span>
				</label>
				<input
					id="amount-slider"
					type="range"
					bind:value={currentAmount}
					min={minAmount}
					max={maxAmount}
					step="1000"
					class="slider"
				/>
				<div class="range-labels">
					<span>{minAmount.toLocaleString('fr-FR')} €</span>
					<span class="base-label">Base: {baseAmount.toLocaleString('fr-FR')} €</span>
					<span>{maxAmount.toLocaleString('fr-FR')} €</span>
				</div>
			</div>

			<!-- Slider Taux -->
			<div class="slider-group">
				<label for="rate-slider">
					<span class="label-text">📈 Taux d'intérêt annuel</span>
					<span class="value-display">{currentRate.toFixed(2)} %</span>
				</label>
				<input
					id="rate-slider"
					type="range"
					bind:value={currentRate}
					min={minRate}
					max={maxRate}
					step="0.01"
					class="slider"
				/>
				<div class="range-labels">
					<span>{minRate.toFixed(2)} %</span>
					<span class="base-label">Base: {baseAnnualRate.toFixed(2)} %</span>
					<span>{maxRate.toFixed(2)} %</span>
				</div>
			</div>

			<!-- Slider Durée -->
			<div class="slider-group">
				<label for="duration-slider">
					<span class="label-text">⏱️ Durée</span>
					<span class="value-display">{currentDuration} ans</span>
				</label>
				<input
					id="duration-slider"
					type="range"
					bind:value={currentDuration}
					min={minDuration}
					max={maxDuration}
					step="1"
					class="slider"
				/>
				<div class="range-labels">
					<span>{minDuration} ans</span>
					<span class="base-label">Base: {baseDurationYears} ans</span>
					<span>{maxDuration} ans</span>
				</div>
			</div>
		</div>

		<div class="results-grid">
			<!-- Mensualité -->
			<div class="result-card">
				<h3>💳 Mensualité</h3>
				<div class="result-value">{currentResult.monthlyPayment.toLocaleString('fr-FR')} €</div>
				<div class="result-comparison">
					<div class="base-value">
						Base: {baseResult.monthlyPayment.toLocaleString('fr-FR')} €
					</div>
					<div
						class="impact {getImpactClass(currentResult.monthlyPayment, baseResult.monthlyPayment)}"
					>
						{formatDiff(currentResult.monthlyPayment, baseResult.monthlyPayment)}
						<span class="impact-percent">
							({formatPercentDiff(currentResult.monthlyPayment, baseResult.monthlyPayment)})
						</span>
					</div>
				</div>
			</div>

			<!-- Coût Total -->
			<div class="result-card">
				<h3>💰 Coût Total</h3>
				<div class="result-value">{currentResult.totalCost.toLocaleString('fr-FR')} €</div>
				<div class="result-comparison">
					<div class="base-value">Base: {baseResult.totalCost.toLocaleString('fr-FR')} €</div>
					<div class="impact {getImpactClass(currentResult.totalCost, baseResult.totalCost)}">
						{formatDiff(currentResult.totalCost, baseResult.totalCost)}
						<span class="impact-percent">
							({formatPercentDiff(currentResult.totalCost, baseResult.totalCost)})
						</span>
					</div>
				</div>
			</div>

			<!-- Intérêts -->
			<div class="result-card">
				<h3>📊 Intérêts Totaux</h3>
				<div class="result-value">{currentResult.totalInterest.toLocaleString('fr-FR')} €</div>
				<div class="result-comparison">
					<div class="base-value">Base: {baseResult.totalInterest.toLocaleString('fr-FR')} €</div>
					<div
						class="impact {getImpactClass(currentResult.totalInterest, baseResult.totalInterest)}"
					>
						{formatDiff(currentResult.totalInterest, baseResult.totalInterest)}
						<span class="impact-percent">
							({formatPercentDiff(currentResult.totalInterest, baseResult.totalInterest)})
						</span>
					</div>
				</div>
			</div>
		</div>

		<div class="legend">
			<h3>💡 Interprétation</h3>
			<ul>
				<li>
					<span class="legend-positive">Vert</span> : Impact positif (réduction par rapport à la base)
				</li>
				<li>
					<span class="legend-negative">Rouge</span> : Impact négatif (augmentation par rapport à la base)
				</li>
				<li>Ajustez les curseurs pour explorer différents scénarios de prêt</li>
			</ul>
		</div>
	{/if}
</div>

<style>
	.impact-analysis {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	h2 {
		color: #333;
		font-size: 1.8rem;
		margin: 0;
	}

	.reset-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reset-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.description {
		color: #666;
		font-size: 1rem;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.sliders-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.slider-group {
		background: #f9fafb;
		padding: 1.5rem;
		border-radius: 8px;
	}

	.slider-group label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.label-text {
		color: #333;
		font-size: 1.1rem;
	}

	.value-display {
		color: #667eea;
		font-size: 1.3rem;
		font-weight: 700;
	}

	.slider {
		width: 100%;
		height: 8px;
		border-radius: 5px;
		background: #e0e0e0;
		outline: none;
		appearance: none;
		-webkit-appearance: none;
		margin-bottom: 0.5rem;
	}

	.slider::-webkit-slider-thumb {
		appearance: none;
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		cursor: pointer;
		transition: all 0.2s;
	}

	.slider::-webkit-slider-thumb:hover {
		transform: scale(1.2);
		box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.1);
	}

	.slider::-moz-range-thumb {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		cursor: pointer;
		border: none;
		transition: all 0.2s;
	}

	.slider::-moz-range-thumb:hover {
		transform: scale(1.2);
		box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.1);
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		color: #666;
	}

	.base-label {
		color: #f59e0b;
		font-weight: 600;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.result-card {
		background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
		padding: 1.5rem;
		border-radius: 12px;
		border: 2px solid #e0e0e0;
		transition: all 0.3s;
	}

	.result-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		border-color: #667eea;
	}

	.result-card h3 {
		color: #333;
		font-size: 1.1rem;
		margin: 0 0 1rem 0;
	}

	.result-value {
		font-size: 1.8rem;
		font-weight: 700;
		color: #667eea;
		margin-bottom: 1rem;
	}

	.result-comparison {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.base-value {
		font-size: 0.9rem;
		color: #666;
	}

	.impact {
		font-weight: 600;
		font-size: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.impact-percent {
		font-size: 0.85rem;
		opacity: 0.8;
	}

	.positive {
		color: #10b981;
	}

	.negative {
		color: #ef4444;
	}

	.neutral {
		color: #6b7280;
	}

	.legend {
		background: #f9fafb;
		padding: 1.5rem;
		border-radius: 8px;
	}

	.legend h3 {
		color: #333;
		font-size: 1.1rem;
		margin: 0 0 1rem 0;
	}

	.legend ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.legend li {
		padding: 0.5rem 0;
		color: #666;
	}

	.legend-positive {
		color: #10b981;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		background: #d1fae5;
		border-radius: 4px;
	}

	.legend-negative {
		color: #ef4444;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		background: #fee2e2;
		border-radius: 4px;
	}

	@media (max-width: 768px) {
		.impact-analysis {
			padding: 1.5rem;
		}

		.header {
			flex-direction: column;
			align-items: stretch;
		}

		h2 {
			font-size: 1.5rem;
		}

		.reset-btn {
			width: 100%;
		}

		.slider-group {
			padding: 1rem;
		}

		.label-text {
			font-size: 1rem;
		}

		.value-display {
			font-size: 1.1rem;
		}

		.results-grid {
			grid-template-columns: 1fr;
		}

		.result-value {
			font-size: 1.5rem;
		}
	}
</style>
