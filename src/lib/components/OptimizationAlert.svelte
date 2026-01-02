<script lang="ts">
	export let savings: number;
</script>

<div class="optimization-alert">
	<div class="alert-icon">✨</div>
	<div class="alert-content">
		<strong>Économie potentielle : {savings.toFixed(2)} €</strong>
		<p>
			En redistribuant vos paiements pour rembourser en priorité les prêts à taux élevé, vous
			économiserez {savings.toFixed(2)} € d'intérêts !
		</p>
	</div>
</div>

<style>
	.optimization-alert {
		background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
		border: 2px solid #28a745;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.alert-icon {
		font-size: 2.5rem;
		flex-shrink: 0;
	}

	.alert-content {
		flex: 1;
	}

	.alert-content strong {
		color: #155724;
		font-size: 1.2rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.alert-content p {
		color: #155724;
		margin: 0;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.optimization-alert {
			flex-direction: column;
			text-align: center;
		}

		.alert-icon {
			font-size: 3rem;
		}
	}
</style>
