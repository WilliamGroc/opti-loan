<script lang="ts">
	export let monthlyPayment = 0;
	export let totalCost = 0;
	export let totalInterest = 0;
	export let durationYears = 20;
</script>

<div class="results">
	<h2>Résultats</h2>
	<div class="result-cards">
		<div class="card">
			<div class="card-label">Mensualité</div>
			<div class="card-value">{monthlyPayment.toFixed(2)} €</div>
		</div>
		<div class="card">
			<div class="card-label">Coût total</div>
			<div class="card-value">{totalCost.toFixed(2)} €</div>
		</div>
		<div class="card">
			<div class="card-label">Intérêts totaux</div>
			<div class="card-value">{totalInterest.toFixed(2)} €</div>
		</div>
		<div class="card">
			<div class="card-label">Nombre de mensualités</div>
			<div class="card-value">{durationYears * 12}</div>
		</div>
	</div>
</div>

<style>
	.results {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	h2 {
		color: #333;
		font-size: 1.5rem;
		margin: 0 0 1rem 0;
	}

	.result-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1.5rem;
		border-radius: 8px;
		color: white;
		text-align: center;
	}

	.card-label {
		font-size: 0.9rem;
		opacity: 0.9;
		margin-bottom: 0.5rem;
	}

	.card-value {
		font-size: 1.5rem;
		font-weight: bold;
	}

	@media (max-width: 768px) {
		.results {
			padding: 1.5rem;
		}

		.result-cards {
			grid-template-columns: 1fr;
		}
	}
</style>
