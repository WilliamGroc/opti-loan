<script lang="ts">
	import PropertyInfoForm from './PropertyInfoForm.svelte';
	import FeesParametersForm from './FeesParametersForm.svelte';
	import IncomeForm from './IncomeForm.svelte';
	import EstimationResults from './EstimationResults.svelte';
	import ProjectManagement from './ProjectManagement.svelte';
	import { calculateEstimation } from './estimationService';
	import type { PropertyType, EstimationInputs, SavedProject } from './types';

	// État de l'application - valeurs par défaut raisonnables
	let propertyValue = $state(300000);
	let downPayment = $state(60000);
	let propertyType = $state<PropertyType>('old');

	// Paramètres de frais et taux
	let notaryFeesPercentNew = $state(2.5);
	let notaryFeesPercentOld = $state(7.5);
	let fileFeePercent = $state(1.0);
	let insurancePercent = $state(0.35);
	let guaranteePercent = $state(1.5);
	let loanRate = $state(1.5);
	let loanDuration = $state(20);

	// Revenus et charges
	let monthlySalary = $state(3000);
	let otherIncome = $state(0);
	let otherLoans = $state(0);

	// Calcul automatique des résultats
	let inputs = $derived<EstimationInputs>({
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
		monthlySalary,
		otherIncome,
		otherLoans
	});

	let result = $derived(calculateEstimation(inputs));

	// Gestion du chargement de projet
	function handleLoad(project: SavedProject) {
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
		monthlySalary = project.monthlySalary;
		otherIncome = project.otherIncome;
		otherLoans = project.otherLoans;
	}
</script>

<div class="estimator-container">
	<div class="estimator-header">
		<h1>🏠 Estimation de Financement</h1>
		<p class="subtitle">
			Calculez le coût complet de votre projet immobilier en résidence principale
		</p>
	</div>

	<div class="forms-container">
		<PropertyInfoForm bind:propertyValue bind:downPayment bind:propertyType />

		<FeesParametersForm
			{propertyType}
			bind:notaryFeesPercentNew
			bind:notaryFeesPercentOld
			bind:fileFeePercent
			bind:insurancePercent
			bind:guaranteePercent
			bind:loanRate
			bind:loanDuration
		/>

		<IncomeForm bind:monthlySalary bind:otherIncome bind:otherLoans />
	</div>

	<div class="results-container">
		<EstimationResults
			{result}
			{propertyType}
			{loanDuration}
			{loanRate}
			{notaryFeesPercentNew}
			{notaryFeesPercentOld}
			{fileFeePercent}
			{insurancePercent}
			{guaranteePercent}
		/>
	</div>

	<div class="project-management-container">
		<ProjectManagement currentInputs={inputs} onLoad={handleLoad} />
	</div>
</div>

<style>
	.estimator-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem;
	}

	.estimator-header {
		text-align: center;
		margin-bottom: 2.5rem;
		padding: 2rem 1rem;
	}

	h1 {
		color: white;
		font-size: 2.5rem;
		margin: 0 0 1rem 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
		font-weight: 700;
	}

	.subtitle {
		color: rgba(255, 255, 255, 0.95);
		font-size: 1.15rem;
		margin: 0;
		font-weight: 400;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
	}

	.forms-container,
	.results-container,
	.project-management-container {
		margin-bottom: 2rem;
	}

	@media (max-width: 768px) {
		.estimator-container {
			padding: 0.5rem;
		}

		h1 {
			font-size: 1.75rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.estimator-header {
			padding: 1.5rem 0.5rem;
			margin-bottom: 1.5rem;
		}
	}
</style>
