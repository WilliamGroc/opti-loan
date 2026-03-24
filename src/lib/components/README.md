# Composants Partagés

Ce dossier contient les composants Svelte **partagés** utilisés dans plusieurs pages de l'application.

> **Note** : Les composants spécifiques à chaque page sont maintenant dans des dossiers `_components/` à côté de leurs pages respectives :
>
> - [Page principale](./../../../routes/_components/README.md) - Composants de calcul de prêt
> - [Page plans](./../../../routes/plans/_components/README.md) - Composants de gestion des plans
> - [Page estimation](./../../../routes/estimation/_components/README.md) - Composants d'estimation

## Composants UI Génériques

### 🔘 Button.svelte

Composant bouton polyvalent avec plusieurs variantes de style.

**Props:**

- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'info' (défaut: 'primary')
- `size`: 'sm' | 'md' | 'lg' (défaut: 'md')
- `fullWidth`: boolean (défaut: false)
- `disabled`: boolean (défaut: false)
- `onClick`: () => void (optionnel)

**Usage dans** : Page plans, composants diverses

**Exemple:**

```svelte
<Button variant="success" size="lg" onclick={handleClick}>✓ Valider</Button>
```

### 📋 SummaryCard.svelte

Carte de résumé affichant un label et une valeur.

**Props:**

- `label`: string - Le libellé du résumé
- `value`: string - La valeur à afficher
- `variant`: 'default' | 'optimized' | 'savings' (défaut: 'default')

**Usage dans** : Page plans (statistiques et résumés)

**Exemple:**

```svelte
<SummaryCard label="Montant total" value="10 000 €" variant="optimized" />
```

### 🗂️ EmptyState.svelte

Affichage vide avec message, icône et bouton d'action optionnel.

**Props:**

- `title`: string - Titre du message vide
- `description`: string - Description du message
- `icon`: string (défaut: '📋') - Emoji ou icône
- `buttonText`: string (défaut: 'Action') - Texte du bouton
- `buttonHref`: string (optionnel) - Lien du bouton
- `onButtonClick`: () => void (optionnel) - Callback du clic

**Usage dans** : Page plans (état vide de la liste)

**Exemple:**

```svelte
<EmptyState
	title="Aucun plan créé"
	description="Commencez par créer votre premier plan"
	buttonText="Créer un plan"
	icon="📋"
/>
```

## Composants de Visualisation

### 📊 AmortizationTable.svelte

Tableau d'amortissement détaillé avec vue résumée et complète.

**Props:**

- `data`: MonthlyPayment[] - Données d'amortissement
- `showFull`: boolean - Afficher toutes les lignes
- `variant`: 'default' | 'optimized' - Style du tableau
- `onToggleFull`: () => void - Callback pour basculer la vue

**Usage dans** : Page plans, composants de calcul

### ⚠️ OptimizationAlert.svelte

Alerte d'optimisation affichant les économies réalisées.

**Props:**

- `savings`: number - Montant des économies en euros

**Usage dans** : Page plans (vue optimisée)

### 📈 LoanComparisonChart.svelte

Graphique de comparaison des remboursements de prêts.

**Props:**

- `data`: MonthlyPayment[] - Données pour le graphique

**Usage dans** : Page plans (visualisation comparative)

## Composants de Navigation et Layout

### 🧭 Navigation.svelte

Barre de navigation globale avec indicateur de page active.

**Props:**

- `currentPage`: '' | 'plans' | 'estimation' - Page active

**Usage dans** : Toutes les pages (en-tête)

**Exemple:**

```svelte
<Navigation currentPage="plans" />
```

### 📦 PageSection.svelte

Conteneur de section avec titre, icône et fonctionnalité collapsible.

**Props:**

- `title`: string - Titre de la section
- `subtitle`: string (optionnel) - Sous-titre descriptif
- `icon`: string (optionnel) - Emoji ou icône
- `collapsible`: boolean (défaut: false) - Section pliable
- `defaultExpanded`: boolean (défaut: true) - État initial
- `variant`: 'primary' | 'secondary' (défaut: 'primary')

**Usage dans** : Pages principale et plans (organisation du contenu)

**Exemple:**

```svelte
<PageSection title="Résultats" icon="📊" collapsible={true}>
	<!-- Contenu de la section -->
</PageSection>
```

### 📱 PWAInstallPrompt.svelte

Prompt d'installation Progressive Web App.

**Usage dans** : Layout global (toutes les pages)

## Organisation

```
src/lib/components/          # Composants partagés
  ├── Navigation.svelte      # Barre de navigation
  ├── PageSection.svelte     # Conteneur de section
  ├── Button.svelte          # Bouton générique
  ├── SummaryCard.svelte     # Carte de résumé
  ├── EmptyState.svelte      # État vide
  ├── AmortizationTable.svelte     # Tableau d'amortissement
  ├── LoanComparisonChart.svelte   # Graphique de comparaison
  ├── OptimizationAlert.svelte     # Alerte d'optimisation
  ├── PWAInstallPrompt.svelte      # Prompt PWA
  └── index.ts               # Exports centralisés

src/routes/_components/            # Composants page principale
src/routes/plans/_components/      # Composants page plans
src/routes/estimation/_components/ # Composants page estimation
```

**Exemple:**

```svelte
<EmptyState
	title="Aucune donnée"
	description="Créez votre premier élément"
	icon="📝"
	buttonText="Créer"
	buttonHref="/create"
/>
```

### `AmortizationTable.svelte`

Tableau d'amortissement pour afficher les données de prêts mensuels.

**Props:**

- `data`: AmortizationRow[] - Les données du tableau
- `showFull`: boolean (défaut: false) - Afficher le tableau complet
- `variant`: 'default' | 'optimized' (défaut: 'default')
- `onToggleFull`: () => void (optionnel) - Callback pour basculer l'affichage

**Types:**

```typescript
interface AmortizationRow {
  month: number;
  date: Date;
  loansData: Array<{
    name: string;
    monthlyPayment: number;
    principal: number;
    interest: number;
    remaining: number;
  }>;
  totalMonthlyPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalRemaining: number;
}
```

**Exemple:**

```svelte
<AmortizationTable
	data={amortizationData}
	showFull={isExpanded}
	variant="optimized"
	onToggleFull={() => (isExpanded = !isExpanded)}
/>
```

### `OptimizationAlert.svelte`

Alerte affichant les économies potentielles de l'optimisation.

**Props:**

- `savings`: number - Montant des économies en euros

**Exemple:**

```svelte
<OptimizationAlert savings={1250.5} />
```

## Utilisation

### Importer les composants

```svelte
<script>
	import {
		Button,
		SummaryCard,
		EmptyState,
		AmortizationTable,
		OptimizationAlert
	} from '$lib/components';
</script>
```

ou importer individuellement :

```svelte
<script>
	import Button from '$lib/components/Button.svelte';
</script>
```

## Style et Thème

Les composants utilisent un système de couleurs cohérent :

- **Primaire**: #667eea → #764ba2 (dégradé bleu-violet)
- **Succès**: #28a745 → #20c997 (dégradé vert)
- **Info**: #0d6efd → #0a58ca (dégradé bleu)
- **Danger**: #ff6b6b (rouge)
- **Neutre**: #f8f9fa, #e0e0e0 (gris)

## Responsive Design

Tous les composants sont conçus pour être responsifs et fonctionnent correctement sur :

- Écrans mobiles (< 768px)
- Tablettes (768px - 1024px)
- Écrans de bureau (> 1024px)

## Maintenance

Lors de modifications d'un composant :

1. Vérifier que les props sont bien typées
2. Maintenir la cohérence visuelle avec le thème
3. Tester la responsivité
4. Mettre à jour ce fichier README
