<script lang="ts">
	import { onMount } from 'svelte';

	type PropertyType = 'new' | 'old';

	interface SavedProject {
		id: string;
		name: string;
		propertyValue: number;
		downPayment: number;
		propertyType: PropertyType;
		notaryFeesPercentNew: number;
		notaryFeesPercentOld: number;
		fileFeePercent: number;
		insurancePercent: number;
		guaranteePercent: number;
		loanRate: number;
		loanDuration: number;
		saveDate: string;
	}

	let propertyValue = 300000;
	let downPayment = 60000;
	let propertyType: PropertyType = 'old';

	// Frais de notaire
	let notaryFeesPercentNew = 2.5;
	let notaryFeesPercentOld = 7.5;

	// Frais de dossier
	let fileFeePercent = 1.0;

	// Assurance emprunteur (annuel)
	let insurancePercent = 0.35;

	// Garantie
	let guaranteePercent = 1.5;

	// Taux d'emprunt et durée
	let loanRate = 1.5;
	let loanDuration = 20;

	// Sauvegarde des projets
	let projectName = '';
	let savedProjects: SavedProject[] = [];

	interface EstimationResult {
		propertyValue: number;
		downPayment: number;
		loanAmount: number;
		notaryFees: number;
		fileFees: number;
		insuranceYearly: number;
		guarantee: number;
		totalInitialCost: number;
		totalToFinance: number;
		totalProjectCost: number;
		monthlyPayment: number;
		totalInterest: number;
		totalCostWithInterest: number;
		insuranceTotal: number;
	}

	let result: EstimationResult;

	function calculateEstimation(): EstimationResult {
		// Montant à emprunter (avant frais)
		const loanAmount = propertyValue - downPayment;

		// Frais de notaire selon le type de bien
		const notaryFeesPercent = propertyType === 'new' ? notaryFeesPercentNew : notaryFeesPercentOld;
		const notaryFees = (propertyValue * notaryFeesPercent) / 100;

		// Frais de dossier
		const fileFees = (loanAmount * fileFeePercent) / 100;

		// Assurance emprunteur (coût annuel)
		const insuranceYearly = (loanAmount * insurancePercent) / 100;

		// Garantie
		const guarantee = (loanAmount * guaranteePercent) / 100;

		// Coûts initiaux totaux (frais à payer dès le début)
		const totalInitialCost = notaryFees + fileFees + guarantee;

		// Montant total à financer (capital + frais initiaux - apport)
		const totalToFinance = propertyValue + totalInitialCost - downPayment;

		// Calcul de la mensualité et des intérêts
		const monthlyRate = loanRate / 100 / 12;
		const totalMonths = loanDuration * 12;
		let monthlyPayment = 0;
		let totalInterest = 0;

		if (totalToFinance > 0) {
			if (monthlyRate === 0) {
				monthlyPayment = totalToFinance / totalMonths;
				totalInterest = 0;
			} else {
				monthlyPayment =
					(totalToFinance * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
					(Math.pow(1 + monthlyRate, totalMonths) - 1);
				totalInterest = monthlyPayment * totalMonths - totalToFinance;
			}
		}

		// Coût total de l'assurance sur la durée
		const insuranceTotal = insuranceYearly * loanDuration;

		// Coût total du projet avec intérêts
		const totalCostWithInterest = propertyValue + totalInitialCost + totalInterest + insuranceTotal;

		// Coût total du projet (sans intérêts)
		const totalProjectCost = propertyValue + totalInitialCost;

		return {
			propertyValue,
			downPayment,
			loanAmount,
			notaryFees,
			fileFees,
			insuranceYearly,
			guarantee,
			totalInitialCost,
			totalToFinance,
			totalProjectCost,
			monthlyPayment,
			totalInterest,
			totalCostWithInterest,
			insuranceTotal
		};
	}

	$: {
		// Force la recalculation quand une de ces variables change
		propertyValue;
		downPayment;
		propertyType;
		notaryFeesPercentNew;
		notaryFeesPercentOld;
		fileFeePercent;
		insurancePercent;
		guaranteePercent;
		loanRate;
		loanDuration;
		result = calculateEstimation();
	}

	function loadProjects() {
		const stored = localStorage.getItem('financingProjects');
		if (stored) {
			try {
				savedProjects = JSON.parse(stored);
			} catch (e) {
				savedProjects = [];
			}
		}
	}

	function saveProject() {
		if (!projectName.trim()) {
			alert('Veuillez entrer un nom pour ce projet');
			return;
		}

		const newProject: SavedProject = {
			id: Date.now().toString(),
			name: projectName,
			propertyValue,
			downPayment,
			propertyType,
			notaryFeesPercentNew,
			notaryFeesPercentOld,
			fileFeePercent,
			insurancePercent,
			guaranteePercent,
			loanRate,
			loanDuration,
			saveDate: new Date().toISOString()
		};

		savedProjects = [...savedProjects, newProject];
		localStorage.setItem('financingProjects', JSON.stringify(savedProjects));
		projectName = '';
		alert('Projet sauvegardé avec succès !');
	}

	function loadProject(project: SavedProject) {
		propertyValue = project.propertyValue;
		downPayment = project.downPayment;
		propertyType = project.propertyType;
		notaryFeesPercentNew = project.notaryFeesPercentNew;
		notaryFeesPercentOld = project.notaryFeesPercentOld;
		fileFeePercent = project.fileFeePercent;
		insurancePercent = project.insurancePercent;
		guaranteePercent = project.guaranteePercent;
		loanRate = project.loanRate;
		loanDuration = project.loanDuration;
	}

	function deleteProject(id: string) {
		if (confirm('Voulez-vous vraiment supprimer ce projet ?')) {
			savedProjects = savedProjects.filter((p) => p.id !== id);
			localStorage.setItem('financingProjects', JSON.stringify(savedProjects));
		}
	}

	function cloneProject(project: SavedProject) {
		const newName = prompt('Nom du nouveau projet :', `${project.name} (copie)`);
		if (!newName || !newName.trim()) {
			return;
		}

		const clonedProject: SavedProject = {
			...project,
			id: Date.now().toString(),
			name: newName,
			saveDate: new Date().toISOString()
		};

		savedProjects = [...savedProjects, clonedProject];
		localStorage.setItem('financingProjects', JSON.stringify(savedProjects));
		alert('Projet cloné avec succès !');
	}

	onMount(() => {
		loadProjects();
	});
</script>

<div class="estimator">
	<div class="estimator-header">
		<h1>🏠 Estimation Plan de Financement</h1>
		<p class="subtitle">
			Estimez le coût global de votre projet d'achat immobilier en résidence principale
		</p>
	</div>

	<div class="form-section">
		<h2>� Sauvegarder le projet</h2>
		<div class="save-section">
			<input
				type="text"
				bind:value={projectName}
				placeholder="Nom du projet (ex: Appartement Paris 15e)"
				class="input-field project-name-input"
			/>
			<button on:click={saveProject} class="save-btn">💾 Enregistrer</button>
		</div>
	</div>

	{#if savedProjects.length > 0}
		<div class="form-section">
			<h2>📂 Projets sauvegardés</h2>
			<div class="projects-list">
				{#each savedProjects as project}
					<div class="project-card">
						<div class="project-info">
							<div class="project-name">{project.name}</div>
							<div class="project-details">
								{project.propertyValue.toLocaleString('fr-FR')} € • Apport: {project.downPayment.toLocaleString(
									'fr-FR'
								)} € • {project.propertyType === 'new' ? 'Neuf' : 'Ancien'}
							</div>
							<div class="project-date">
								Sauvegardé le {new Date(project.saveDate).toLocaleDateString('fr-FR')}
							</div>
						</div>
						<div class="project-actions">
							<button on:click={() => loadProject(project)} class="action-btn load-btn"
								>📂 Charger</button
							>
							<button on:click={() => cloneProject(project)} class="action-btn clone-btn"
								>📋 Dupliquer</button
							>
							<button on:click={() => deleteProject(project.id)} class="action-btn delete-btn"
								>🗑️ Supprimer</button
							>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="form-section">
		<h2>�📝 Informations sur le bien</h2>

		<div class="form-grid">
			<div class="form-group">
				<label for="property-value">
					<span class="label-text">💰 Valeur du bien</span>
				</label>
				<input
					id="property-value"
					type="number"
					bind:value={propertyValue}
					min="50000"
					max="1000000"
					step="5000"
					class="input-field"
				/>
				<div class="input-hint">Entre 50 000 € et 1 000 000 €</div>
			</div>

			<div class="form-group">
				<label for="down-payment">
					<span class="label-text">💵 Apport personnel</span>
				</label>
				<input
					id="down-payment"
					type="number"
					bind:value={downPayment}
					min="0"
					max={propertyValue}
					step="1000"
					class="input-field"
				/>
				<div class="input-hint">Entre 0 € et {propertyValue.toLocaleString('fr-FR')} €</div>
			</div>

			<div class="form-group">
				<label>
					<span class="label-text">🏗️ Type de bien</span>
				</label>
				<div class="radio-group">
					<label class="radio-label">
						<input type="radio" bind:group={propertyType} value="new" />
						<span>Neuf</span>
					</label>
					<label class="radio-label">
						<input type="radio" bind:group={propertyType} value="old" />
						<span>Ancien</span>
					</label>
				</div>
			</div>
		</div>
	</div>

	<div class="form-section">
		<h2>⚙️ Paramètres des frais</h2>

		<div class="form-grid">
			{#if propertyType === 'new'}
				<div class="form-group">
					<label for="notary-new">
						<span class="label-text">📋 Frais de notaire (Neuf)</span>
					</label>
					<input
						id="notary-new"
						type="number"
						bind:value={notaryFeesPercentNew}
						min="2"
						max="3"
						step="0.1"
						class="input-field"
					/>
					<div class="input-hint">Entre 2% et 3%</div>
				</div>
			{:else}
				<div class="form-group">
					<label for="notary-old">
						<span class="label-text">📋 Frais de notaire (Ancien)</span>
					</label>
					<input
						id="notary-old"
						type="number"
						bind:value={notaryFeesPercentOld}
						min="7"
						max="8"
						step="0.1"
						class="input-field"
					/>
					<div class="input-hint">Entre 7% et 8%</div>
				</div>
			{/if}

			<div class="form-group">
				<label for="file-fee">
					<span class="label-text">📄 Frais de dossier</span>
				</label>
				<input
					id="file-fee"
					type="number"
					bind:value={fileFeePercent}
					min="0.5"
					max="1.5"
					step="0.1"
					class="input-field"
				/>
				<div class="input-hint">Entre 0,5% et 1,5%</div>
			</div>

			<div class="form-group">
				<label for="insurance">
					<span class="label-text">🛡️ Assurance emprunteur (annuel)</span>
				</label>
				<input
					id="insurance"
					type="number"
					bind:value={insurancePercent}
					min="0.2"
					max="0.6"
					step="0.05"
					class="input-field"
				/>
				<div class="input-hint">Entre 0,2% et 0,6%</div>
			</div>

			<div class="form-group">
				<label for="guarantee">
					<span class="label-text">🔒 Garantie</span>
				</label>
				<input
					id="guarantee"
					type="number"
					bind:value={guaranteePercent}
					min="1"
					max="2"
					step="0.1"
					class="input-field"
				/>
				<div class="input-hint">Entre 1% et 2%</div>
			</div>

			<div class="form-group">
				<label for="loan-rate">
					<span class="label-text">📈 Taux d'emprunt annuel</span>
				</label>
				<input
					id="loan-rate"
					type="number"
					bind:value={loanRate}
					min="0.1"
					max="5"
					step="0.05"
					class="input-field"
				/>
				<div class="input-hint">Entre 0,1% et 5%</div>
			</div>

			<div class="form-group">
				<label for="loan-duration">
					<span class="label-text">⏱️ Durée du prêt (années)</span>
				</label>
				<input
					id="loan-duration"
					type="number"
					bind:value={loanDuration}
					min="5"
					max="30"
					step="1"
					class="input-field"
				/>
				<div class="input-hint">Entre 5 et 30 ans</div>
			</div>
		</div>
	</div>
</div>

<div class="results-section">
	<h2>📊 Estimation détaillée</h2>

	<div class="results-grid">
		<div class="result-card primary">
			<div class="card-icon">💰</div>
			<div class="card-content">
				<div class="card-label">Montant à emprunter</div>
				<div class="card-value">{result.loanAmount.toLocaleString('fr-FR')} €</div>
				<div class="card-detail">Valeur du bien - Apport</div>
			</div>
		</div>

		<div class="result-card">
			<div class="card-icon">📋</div>
			<div class="card-content">
				<div class="card-label">Frais de notaire</div>
				<div class="card-value">{result.notaryFees.toLocaleString('fr-FR')} €</div>
				<div class="card-detail">
					{propertyType === 'new' ? notaryFeesPercentNew : notaryFeesPercentOld}% de {result.propertyValue.toLocaleString(
						'fr-FR'
					)} €
				</div>
			</div>
		</div>

		<div class="result-card">
			<div class="card-icon">📄</div>
			<div class="card-content">
				<div class="card-label">Frais de dossier</div>
				<div class="card-value">{result.fileFees.toLocaleString('fr-FR')} €</div>
				<div class="card-detail">{fileFeePercent}% du montant emprunté</div>
			</div>
		</div>

		<div class="result-card">
			<div class="card-icon">🛡️</div>
			<div class="card-content">
				<div class="card-label">Assurance (par an)</div>
				<div class="card-value">{result.insuranceYearly.toLocaleString('fr-FR')} €</div>
				<div class="card-detail">{insurancePercent}% du montant emprunté</div>
			</div>
		</div>

		<div class="result-card">
			<div class="card-icon">🔒</div>
			<div class="card-content">
				<div class="card-label">Garantie</div>
				<div class="card-value">{result.guarantee.toLocaleString('fr-FR')} €</div>
				<div class="card-detail">{guaranteePercent}% du montant emprunté</div>
			</div>
		</div>

		<div class="result-card highlight">
			<div class="card-icon">📦</div>
			<div class="card-content">
				<div class="card-label">Frais initiaux totaux</div>
				<div class="card-value">{result.totalInitialCost.toLocaleString('fr-FR')} €</div>
				<div class="card-detail">Notaire + Dossier + Garantie</div>
			</div>
		</div>

		<div class="result-card primary">
			<div class="card-icon">💳</div>
			<div class="card-content">
				<div class="card-label">Mensualité</div>
				<div class="card-value">{result.monthlyPayment.toLocaleString('fr-FR')} €</div>
				<div class="card-detail">Sur {loanDuration} ans à {loanRate}%</div>
			</div>
		</div>

		<div class="result-card">
			<div class="card-icon">📈</div>
			<div class="card-content">
				<div class="card-label">Intérêts du prêt</div>
				<div class="card-value">{result.totalInterest.toLocaleString('fr-FR')} €</div>
				<div class="card-detail">Sur toute la durée du prêt</div>
			</div>
		</div>

		<div class="result-card">
			<div class="card-icon">🛡️</div>
			<div class="card-content">
				<div class="card-label">Assurance totale</div>
				<div class="card-value">{result.insuranceTotal.toLocaleString('fr-FR')} €</div>
				<div class="card-detail">
					{result.insuranceYearly.toLocaleString('fr-FR')} € x {loanDuration} ans
				</div>
			</div>
		</div>

		<div class="summary-card warning">
			<h3>💰 Coût total du projet</h3>
			<div class="summary-value">{result.totalProjectCost.toLocaleString('fr-FR')} €</div>
			<div class="summary-detail">Valeur du bien + Frais initiaux (hors intérêts et assurance)</div>
		</div>

		<div class="summary-card danger">
			<h3>💸 Coût réel total</h3>
			<div class="summary-value">{result.totalCostWithInterest.toLocaleString('fr-FR')} €</div>
			<div class="summary-detail">
				Bien + Frais + Intérêts + Assurance sur {loanDuration} ans
			</div>
		</div>
	</div>

	<div class="info-box">
		<h3>ℹ️ Informations importantes</h3>
		<ul>
			<li>
				<strong>Mensualité :</strong> Calculée sur la base du montant total à financer (bien + frais -
				apport) avec le taux et la durée indiqués. L'assurance n'est pas incluse dans la mensualité.
			</li>
			<li>
				<strong>Intérêts du prêt :</strong> Montant total des intérêts que vous paierez sur toute la durée
				du prêt. Plus la durée est longue, plus les intérêts sont élevés.
			</li>
			<li>
				<strong>Coût réel total :</strong> Somme de tous les coûts du projet incluant le bien, les frais,
				les intérêts du prêt et l'assurance emprunteur sur toute la durée.
			</li>
			<li>
				<strong>Frais variables :</strong> Les pourcentages indiqués sont des fourchettes moyennes. Les
				frais réels peuvent varier selon les banques et notaires.
			</li>
		</ul>
	</div>
</div>

<style>
	.estimator {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.estimator-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		color: white;
		font-size: 2.5rem;
		margin: 0 0 1rem 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	.subtitle {
		color: rgba(255, 255, 255, 0.95);
		font-size: 1.1rem;
		margin: 0;
	}

	.form-section,
	.results-section {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	h2 {
		color: #333;
		font-size: 1.5rem;
		margin: 0 0 1.5rem 0;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.label-text {
		font-weight: 600;
		color: #333;
		font-size: 1rem;
	}

	.input-field {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		color: #333;
		background: white;
		transition: all 0.2s;
	}

	.input-field:hover {
		border-color: #667eea;
	}

	.input-field:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.input-hint {
		font-size: 0.85rem;
		color: #666;
		margin-top: 0.25rem;
	}

	.radio-group {
		display: flex;
		gap: 1rem;
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		flex: 1;
		justify-content: center;
	}

	.radio-label:hover {
		border-color: #667eea;
		background: #f9fafb;
	}

	.radio-label input[type='radio'] {
		cursor: pointer;
	}

	.radio-label input[type='radio']:checked + span {
		font-weight: 700;
		color: #667eea;
	}

	.radio-label:has(input[type='radio']:checked) {
		border-color: #667eea;
		background: #f0f4ff;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.result-card {
		background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
		padding: 1.5rem;
		border-radius: 12px;
		border: 2px solid #e0e0e0;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		transition: all 0.3s;
	}

	.result-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		border-color: #667eea;
	}

	.result-card.primary {
		border-color: #667eea;
		background: linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%);
	}

	.result-card.highlight {
		border-color: #f59e0b;
		background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
	}

	.card-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.card-content {
		flex: 1;
	}

	.card-label {
		font-size: 0.9rem;
		color: #666;
		margin-bottom: 0.5rem;
	}

	.card-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #333;
		margin-bottom: 0.25rem;
	}

	.card-detail {
		font-size: 0.85rem;
		color: #999;
	}

	.summary-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.summary-card {
		padding: 2rem;
		border-radius: 12px;
		text-align: center;
	}

	.summary-card.success {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
	}

	.summary-card.warning {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		color: white;
	}

	.summary-card.danger {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
	}

	.summary-card h3 {
		font-size: 1.2rem;
		margin: 0 0 1rem 0;
		color: white;
	}

	.summary-value {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.summary-detail {
		font-size: 0.9rem;
		opacity: 0.9;
	}

	.info-box {
		background: #f0f4ff;
		padding: 1.5rem;
		border-radius: 8px;
		border-left: 4px solid #667eea;
	}

	.info-box h3 {
		color: #333;
		font-size: 1.1rem;
		margin: 0 0 1rem 0;
	}

	.info-box ul {
		margin: 0;
		padding-left: 1.5rem;
		color: #555;
		line-height: 1.8;
	}

	.info-box li {
		margin-bottom: 0.75rem;
	}

	.info-box strong {
		color: #333;
	}

	.save-section {
		display: flex;
		gap: 1rem;
		align-items: stretch;
	}

	.project-name-input {
		flex: 1;
	}

	.save-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 0.75rem 2rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.save-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.projects-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.project-card {
		background: #f9fafb;
		border: 2px solid #e0e0e0;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		transition: all 0.2s;
	}

	.project-card:hover {
		border-color: #667eea;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.project-info {
		flex: 1;
	}

	.project-name {
		font-size: 1.1rem;
		font-weight: 700;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.project-details {
		font-size: 0.9rem;
		color: #666;
		margin-bottom: 0.25rem;
	}

	.project-date {
		font-size: 0.85rem;
		color: #999;
	}

	.project-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.action-btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.load-btn {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
	}

	.load-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
	}

	.clone-btn {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
	}

	.clone-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
	}

	.delete-btn {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
	}

	.delete-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
	}

	@media (max-width: 768px) {
		.estimator {
			padding: 1rem;
		}

		h1 {
			font-size: 1.8rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.form-section,
		.results-section {
			padding: 1.5rem;
		}

		.form-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.results-grid {
			grid-template-columns: 1fr;
		}

		.summary-cards {
			grid-template-columns: 1fr;
		}

		.summary-value {
			font-size: 2rem;
		}

		.save-section {
			flex-direction: column;
		}

		.project-card {
			flex-direction: column;
			align-items: stretch;
		}

		.project-actions {
			justify-content: stretch;
		}

		.action-btn {
			flex: 1;
			text-align: center;
		}
	}
</style>
