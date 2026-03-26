<script lang="ts">
	import type { SavedProject, EstimationInputs } from './types';
	import { PageSection } from '$lib/components';

	type Props = {
		currentInputs: EstimationInputs;
		onLoad: (project: SavedProject) => void;
	};

	let { currentInputs, onLoad }: Props = $props();

	let projectName = $state('');
	let savedProjects = $state<SavedProject[]>([]);
	let notification = $state<{ message: string; type: 'success' | 'error' } | null>(null);

	// Afficher une notification
	function showNotification(message: string, type: 'success' | 'error' = 'success') {
		notification = { message, type };
		setTimeout(() => {
			notification = null;
		}, 3000);
	}

	// Charger les projets sauvegardés depuis localStorage
	function loadProjects() {
		const stored = localStorage.getItem('estimationProjects');
		if (stored) {
			try {
				savedProjects = JSON.parse(stored);
			} catch (e) {
				console.error('Erreur lors du chargement des projets:', e);
				savedProjects = [];
			}
		}
	}

	// Sauvegarder un nouveau projet
	function saveProject() {
		if (!projectName.trim()) {
			alert('Veuillez donner un nom au projet');
			return;
		}

		const newProject: SavedProject = {
			...currentInputs,
			id: `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			name: projectName.trim(),
			saveDate: new Date().toISOString()
		};

		savedProjects = [...savedProjects, newProject];
		localStorage.setItem('estimationProjects', JSON.stringify(savedProjects));

		showNotification(`✅ Projet "${projectName.trim()}" sauvegardé avec succès !`);
		projectName = '';
	}

	// Charger un projet existant
	function loadProject(project: SavedProject) {
		onLoad(project);
		showNotification(`📥 Projet "${project.name}" chargé avec succès !`);
	}

	// Cloner un projet (charger ses données mais ne pas écraser l'actuel)
	function cloneProject(project: SavedProject) {
		onLoad(project);
		projectName = `${project.name} (copie)`;
	}

	// Supprimer un projet
	function deleteProject(projectId: string) {
		if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
			return;
		}

		savedProjects = savedProjects.filter((p) => p.id !== projectId);
		localStorage.setItem('estimationProjects', JSON.stringify(savedProjects));
		showNotification('🗑️ Projet supprimé avec succès !');
	}

	// Charger les projets au montage
	$effect(() => {
		loadProjects();
	});

	// Formater la date
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<PageSection
	title="💾 Sauvegarder et charger mes projets"
	icon="📂"
	variant="secondary"
	collapsible={true}
	defaultExpanded={false}
>
	{#if notification}
		<div class="notification {notification.type}">
			{notification.message}
		</div>
	{/if}

	<!-- Formulaire de sauvegarde -->
	<div class="save-section">
		<div class="save-header">
			<span class="section-icon">💾</span>
			<span class="section-title">Sauvegarder le projet actuel</span>
		</div>
		<div class="save-form">
			<input
				type="text"
				bind:value={projectName}
				placeholder="Nom du projet (ex: Appartement Paris 15)"
				class="project-name-input"
			/>
			<button onclick={saveProject} class="save-button">
				<span class="button-icon">💾</span>
				<span>Sauvegarder</span>
			</button>
		</div>
	</div>

	<!-- Liste des projets sauvegardés -->
	{#if savedProjects.length > 0}
		<div class="projects-section">
			<div class="projects-header">
				<span class="section-icon">📂</span>
				<span class="section-title">Mes projets sauvegardés ({savedProjects.length})</span>
			</div>
			<div class="projects-grid">
				{#each savedProjects as project (project.id)}
					<div class="project-card">
						<div class="project-header">
							<span class="project-icon">🏠</span>
							<span class="project-name">{project.name}</span>
						</div>

						<div class="project-details">
							<div class="detail-row">
								<span class="detail-label">Prix du bien:</span>
								<span class="detail-value">
									{project.propertyValue.toLocaleString('fr-FR')} €
								</span>
							</div>
							<div class="detail-row">
								<span class="detail-label">Apport:</span>
								<span class="detail-value">
									{project.downPayment.toLocaleString('fr-FR')} €
								</span>
							</div>
							<div class="detail-row">
								<span class="detail-label">Type:</span>
								<span class="detail-value">
									{project.propertyType === 'new' ? 'Neuf' : 'Ancien'}
								</span>
							</div>
							<div class="detail-row">
								<span class="detail-label">Sauvegardé:</span>
								<span class="detail-value date">{formatDate(project.saveDate)}</span>
							</div>
						</div>

						<div class="project-actions">
							<button onclick={() => loadProject(project)} class="action-button load">
								<span class="button-icon">📥</span>
								<span>Charger</span>
							</button>
							<button onclick={() => cloneProject(project)} class="action-button clone">
								<span class="button-icon">📋</span>
								<span>Cloner</span>
							</button>
							<button onclick={() => deleteProject(project.id)} class="action-button delete">
								<span class="button-icon">🗑️</span>
								<span>Supprimer</span>
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="empty-state">
			<span class="empty-icon">📭</span>
			<p class="empty-text">Aucun projet sauvegardé pour le moment</p>
			<p class="empty-hint">Donnez un nom à votre projet ci-dessus et sauvegardez-le !</p>
		</div>
	{/if}
</PageSection>

<style>
	/* Save Section */
	.save-section {
		margin-bottom: 2rem;
	}

	.save-header,
	.projects-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.section-icon {
		font-size: 1.5rem;
	}

	.section-title {
		font-weight: 600;
		font-size: 1.1rem;
		color: #2d3748;
	}

	.save-form {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.project-name-input {
		flex: 1;
		min-width: 250px;
		padding: 0.875rem 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1rem;
		transition: all 0.2s;
	}

	.project-name-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.save-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.save-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
	}

	.save-button:active {
		transform: translateY(0);
	}

	/* Projects Grid */
	.projects-section {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 2px solid #e2e8f0;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.25rem;
	}

	.project-card {
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.25rem;
		transition: all 0.2s;
	}

	.project-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
		border-color: #cbd5e0;
	}

	.project-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid #f7fafc;
	}

	.project-icon {
		font-size: 1.5rem;
	}

	.project-name {
		font-weight: 700;
		font-size: 1.1rem;
		color: #1a202c;
		flex: 1;
	}

	.project-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.detail-label {
		font-size: 0.9rem;
		color: #718096;
	}

	.detail-value {
		font-weight: 600;
		color: #2d3748;
	}

	.detail-value.date {
		font-size: 0.85rem;
		font-weight: 500;
		color: #a0aec0;
	}

	.project-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 2px solid #f7fafc;
		flex-wrap: wrap;
	}

	.action-button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		padding: 0.625rem 0.75rem;
		border: 2px solid;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-button .button-icon {
		font-size: 1rem;
	}

	.action-button.load {
		background: linear-gradient(135deg, #48bb7808 0%, #38a16908 100%);
		border-color: #48bb78;
		color: #2f855a;
	}

	.action-button.load:hover {
		background: linear-gradient(135deg, #48bb7815 0%, #38a16915 100%);
		transform: translateY(-2px);
	}

	.action-button.clone {
		background: linear-gradient(135deg, #4299e108 0%, #3182ce08 100%);
		border-color: #4299e1;
		color: #2c5282;
	}

	.action-button.clone:hover {
		background: linear-gradient(135deg, #4299e115 0%, #3182ce15 100%);
		transform: translateY(-2px);
	}

	.action-button.delete {
		background: linear-gradient(135deg, #fc858508 0%, #f2709c08 100%);
		border-color: #fc8585;
		color: #c53030;
	}

	.action-button.delete:hover {
		background: linear-gradient(135deg, #fc858515 0%, #f2709c15 100%);
		transform: translateY(-2px);
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border: 2px dashed #cbd5e0;
		border-radius: 12px;
		margin-top: 1rem;
	}

	.empty-icon {
		font-size: 3rem;
		display: block;
		margin-bottom: 1rem;
	}

	.empty-text {
		font-size: 1.1rem;
		font-weight: 600;
		color: #4a5568;
		margin: 0 0 0.5rem 0;
	}

	.empty-hint {
		color: #718096;
		margin: 0;
	}

	/* Notification */
	.notification {
		margin-bottom: 1.5rem;
		padding: 1rem 1.5rem;
		border-radius: 8px;
		font-weight: 600;
		text-align: center;
		animation: slideDown 0.3s ease-out;
	}

	.notification.success {
		background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
	}

	.notification.error {
		background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.save-form {
			flex-direction: column;
		}

		.project-name-input {
			min-width: 100%;
		}

		.projects-grid {
			grid-template-columns: 1fr;
		}

		.project-actions {
			flex-direction: column;
		}
	}
</style>
