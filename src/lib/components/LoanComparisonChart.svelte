<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { AmortizationRow } from '$lib/services/types';

	Chart.register(...registerables);

	interface Props {
		data: AmortizationRow[];
	}

	let { data }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	// Palette de couleurs pour les différents prêts
	const colors = [
		'rgba(59, 130, 246, 0.8)', // Bleu
		'rgba(16, 185, 129, 0.8)', // Vert
		'rgba(245, 158, 11, 0.8)', // Orange
		'rgba(239, 68, 68, 0.8)', // Rouge
		'rgba(139, 92, 246, 0.8)', // Violet
		'rgba(236, 72, 153, 0.8)', // Rose
		'rgba(14, 165, 233, 0.8)', // Cyan
		'rgba(251, 146, 60, 0.8)' // Orange clair
	];

	function createChart() {
		if (!canvas || !data || data.length === 0) return;

		// Extraire les noms des prêts depuis la première ligne
		const loanNames = data[0]?.loansData.map((loan) => loan.name) || [];

		// Préparer les datasets pour les lignes (capital restant dû)
		const lineDatasets = loanNames.map((loanName, index) => {
			const loanData = data.map((row) => {
				const loan = row.loansData.find((l) => l.name === loanName);
				return loan ? loan.remaining : 0;
			});

			return {
				type: 'line' as const,
				label: `${loanName} - Capital restant`,
				data: loanData,
				borderColor: colors[index % colors.length],
				backgroundColor: colors[index % colors.length].replace('0.8', '0.1'),
				borderWidth: 2,
				fill: false,
				tension: 0.4,
				pointRadius: 0,
				pointHoverRadius: 4,
				yAxisID: 'y'
			};
		});

		// Préparer les datasets pour les barres (intérêts payés)
		const barDatasets = loanNames.map((loanName, index) => {
			const interestData = data.map((row) => {
				const loan = row.loansData.find((l) => l.name === loanName);
				return loan ? loan.interest : 0;
			});

			return {
				type: 'bar' as const,
				label: `${loanName} - Intérêts`,
				data: interestData,
				backgroundColor: colors[index % colors.length].replace('0.8', '0.6'),
				borderColor: colors[index % colors.length],
				borderWidth: 1,
				yAxisID: 'y1',
				stack: 'interest'
			};
		});

		const datasets = [...lineDatasets, ...barDatasets];

		// Labels pour l'axe X (en années)
		const labels = data.map((row, index) => {
			if (index % 12 === 0) {
				return `Année ${Math.floor(index / 12) + 1}`;
			}
			return '';
		});

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		if (chart) {
			chart.destroy();
		}

		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: true,
						text: 'Évolution du capital restant dû et des intérêts par prêt',
						font: {
							size: 16,
							weight: 'bold'
						}
					},
					legend: {
						position: 'bottom',
						labels: {
							padding: 10,
							usePointStyle: true,
							font: {
								size: 11
							}
						}
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						callbacks: {
							label: function (context) {
								let label = context.dataset.label || '';
								if (label) {
									label += ': ';
								}
								if (context.parsed.y !== null) {
									label += context.parsed.y.toLocaleString('fr-FR', {
										style: 'currency',
										currency: 'EUR',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									});
								}
								return label;
							},
							title: function (tooltipItems) {
								const index = tooltipItems[0].dataIndex;
								return `Mois ${index + 1}`;
							}
						}
					}
				},
				scales: {
					y: {
						type: 'linear',
						display: true,
						position: 'left',
						beginAtZero: true,
						ticks: {
							callback: function (value) {
								return (
									(value as number).toLocaleString('fr-FR', {
										minimumFractionDigits: 0,
										maximumFractionDigits: 0
									}) + ' €'
								);
							}
						},
						title: {
							display: true,
							text: 'Capital restant dû (€)'
						}
					},
					y1: {
						type: 'linear',
						display: true,
						position: 'right',
						beginAtZero: true,
						stacked: true,
						ticks: {
							callback: function (value) {
								return (
									(value as number).toLocaleString('fr-FR', {
										minimumFractionDigits: 0,
										maximumFractionDigits: 0
									}) + ' €'
								);
							}
						},
						title: {
							display: true,
							text: 'Intérêts mensuels (€)'
						},
						grid: {
							drawOnChartArea: false
						}
					},
					x: {
						stacked: false,
						title: {
							display: true,
							text: 'Période'
						}
					}
				},
				interaction: {
					mode: 'index',
					intersect: false
				}
			}
		});
	}

	onMount(() => {
		createChart();
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});

	$effect(() => {
		if (data) {
			createChart();
		}
	});
</script>

<div class="chart-container">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.chart-container {
		width: 100%;
		height: 500px;
		padding: 1.5rem;
		background: white;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		margin: 1.5rem 0;
	}

	@media (max-width: 768px) {
		.chart-container {
			height: 400px;
			padding: 1rem;
		}
	}
</style>
