<script lang="ts">
	import { addMonths, format } from 'date-fns';
	import { fr } from 'date-fns/locale';

	let montant = 200000;
	let tauxAnnuel = 1.5;
	let dureeAnnees = 20;
	let mensualite = 0;
	let coutTotal = 0;
	let interetsTotal = 0;
	let dateDebut = new Date();
	let tableauAmortissement: Array<{
		mois: number;
		date: Date;
		mensualite: number;
		capital: number;
		interets: number;
		restant: number;
	}> = [];

	// Mode de calcul: 'mensualite' ou 'duree'
	let modeCalcul: 'mensualite' | 'duree' = 'mensualite';

	function calculerPret() {
		const tauxMensuel = tauxAnnuel / 100 / 12;
		const nombreMois = dureeAnnees * 12;

		if (modeCalcul === 'mensualite') {
			// Calcul de la mensualité à partir du montant, taux et durée
			if (tauxMensuel === 0) {
				mensualite = montant / nombreMois;
			} else {
				mensualite =
					(montant * tauxMensuel * Math.pow(1 + tauxMensuel, nombreMois)) /
					(Math.pow(1 + tauxMensuel, nombreMois) - 1);
			}
		}

		// Génération du tableau d'amortissement
		tableauAmortissement = [];
		let capitalRestant = montant;

		for (let mois = 1; mois <= nombreMois; mois++) {
			const interetsMois = capitalRestant * tauxMensuel;
			const capitalRembourse = mensualite - interetsMois;
			capitalRestant -= capitalRembourse;

			if (capitalRestant < 0) capitalRestant = 0;

			const dateEcheance = addMonths(dateDebut, mois);

			tableauAmortissement.push({
				mois,
				date: dateEcheance,
				mensualite,
				capital: capitalRembourse,
				interets: interetsMois,
				restant: capitalRestant
			});
		}

		coutTotal = mensualite * nombreMois;
		interetsTotal = coutTotal - montant;
	}

	// Calcul initial
	$: {
		montant, tauxAnnuel, dureeAnnees, mensualite, modeCalcul, dateDebut;
		calculerPret();
	}
</script>

<div class="container">
	<h1>Calculateur de Prêt</h1>

	<div class="calculator">
		<div class="input-group">
			<label for="montant">
				Montant du prêt (€)
				<input
					id="montant"
					type="number"
					bind:value={montant}
					min="1000"
					step="1000"
				/>
			</label>
		</div>

		<div class="input-group">
			<label for="taux">
				Taux d'intérêt annuel (%)
				<input
					id="taux"
					type="number"
					bind:value={tauxAnnuel}
					min="0"
					max="20"
					step="0.1"
				/>
			</label>
		</div>

		<div class="input-group">
			<label for="duree">
				Durée (années)
				<input
					id="duree"
					type="number"
					bind:value={dureeAnnees}
					min="1"
					max="50"
				/>
			</label>
		</div>

		<div class="input-group">
			<label for="dateDebut">
				Date de début du prêt
				<input
					id="dateDebut"
					type="date"
					bind:value={dateDebut}
				/>
			</label>
		</div>

		<div class="mode-selector">
			<label>
				<input type="radio" bind:group={modeCalcul} value="mensualite" />
				Calculer la mensualité
			</label>
			<label>
				<input type="radio" bind:group={modeCalcul} value="duree" />
				Saisir la mensualité
			</label>
		</div>

		{#if modeCalcul === 'duree'}
			<div class="input-group">
				<label for="mensualite">
					Mensualité souhaitée (€)
					<input
						id="mensualite"
						type="number"
						bind:value={mensualite}
						min="100"
						step="10"
					/>
				</label>
			</div>
		{/if}
	</div>

	<div class="results">
		<h2>Résultats</h2>
		<div class="result-cards">
			<div class="card">
				<div class="card-label">Mensualité</div>
				<div class="card-value">{mensualite.toFixed(2)} €</div>
			</div>
			<div class="card">
				<div class="card-label">Coût total</div>
				<div class="card-value">{coutTotal.toFixed(2)} €</div>
			</div>
			<div class="card">
				<div class="card-label">Intérêts totaux</div>
				<div class="card-value">{interetsTotal.toFixed(2)} €</div>
			</div>
			<div class="card">
				<div class="card-label">Nombre de mensualités</div>
				<div class="card-value">{dureeAnnees * 12}</div>
			</div>
		</div>
	</div>

	<div class="amortization">
		<h2>Tableau d'amortissement</h2>
		<div class="table-wrapper">
			<table>
				<thead>
					<tr>
						<th>Mois</th>
						<th>Date</th>
						<th>Mensualité</th>
						<th>Capital</th>
						<th>Intérêts</th>
						<th>Restant dû</th>
					</tr>
				</thead>
				<tbody>
					{#each tableauAmortissement as ligne, i}
						{#if i < 12 || i >= tableauAmortissement.length - 12 || i % 12 === 0}
							<tr>
								<td>{ligne.mois}</td>
								<td>{format(ligne.date, 'MMM yyyy', { locale: fr })}</td>
								<td>{ligne.mensualite.toFixed(2)} €</td>
								<td>{ligne.capital.toFixed(2)} €</td>
								<td>{ligne.interets.toFixed(2)} €</td>
								<td>{ligne.restant.toFixed(2)} €</td>
							</tr>
						{:else if i === 12}
							<tr class="ellipsis">
								<td colspan="6">...</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		text-align: center;
		color: white;
		font-size: 2.5rem;
		margin-bottom: 2rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	h2 {
		color: #333;
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.calculator {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.input-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		font-weight: 600;
		color: #333;
		margin-bottom: 0.5rem;
	}

	input[type='number'] {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.3s;
		box-sizing: border-box;
	}

	input[type='number']:focus,
	input[type='date']:focus {
		outline: none;
		border-color: #667eea;
	}

	input[type='date'] {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.3s;
		box-sizing: border-box;
	}

	.mode-selector {
		display: flex;
		gap: 2rem;
		margin: 1.5rem 0;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 8px;
	}

	.mode-selector label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		margin: 0;
	}

	.mode-selector input[type='radio'] {
		cursor: pointer;
	}

	.results {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
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

	.amortization {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.table-wrapper {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}

	th {
		background: #667eea;
		color: white;
		padding: 1rem;
		text-align: left;
		font-weight: 600;
	}

	td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e0e0e0;
	}

	tbody tr:hover {
		background: #f5f5f5;
	}

	tr.ellipsis td {
		text-align: center;
		font-weight: bold;
		color: #999;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.calculator,
		.results,
		.amortization {
			padding: 1.5rem;
		}

		.result-cards {
			grid-template-columns: 1fr;
		}

		.mode-selector {
			flex-direction: column;
			gap: 1rem;
		}

		table {
			font-size: 0.9rem;
		}

		th,
		td {
			padding: 0.5rem;
		}
	}
</style>
