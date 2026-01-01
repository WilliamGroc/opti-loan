# Composants Réutilisables

Ce dossier contient tous les composants Svelte réutilisables de l'application.

## Structure

### `Button.svelte`
Composant bouton polyvalent avec plusieurs variantes de style.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'info' (défaut: 'primary')
- `size`: 'sm' | 'md' | 'lg' (défaut: 'md')
- `fullWidth`: boolean (défaut: false)
- `disabled`: boolean (défaut: false)
- `onClick`: () => void (optionnel)

**Exemple:**
```svelte
<Button variant="success" size="lg" on:click={handleClick}>
  ✓ Valider
</Button>
```

### `SummaryCard.svelte`
Carte de résumé affichant un label et une valeur.

**Props:**
- `label`: string - Le libellé du résumé
- `value`: string - La valeur à afficher
- `variant`: 'default' | 'optimized' | 'savings' (défaut: 'default')

**Exemple:**
```svelte
<SummaryCard 
  label="Montant total" 
  value="10 000 €" 
  variant="optimized"
/>
```

### `EmptyState.svelte`
Affichage vide avec message, icône et bouton d'action optionnel.

**Props:**
- `title`: string - Titre du message vide
- `description`: string - Description du message
- `icon`: string (défaut: '📋') - Emoji ou icône
- `buttonText`: string (défaut: 'Action') - Texte du bouton
- `buttonHref`: string (optionnel) - Lien du bouton
- `onButtonClick`: () => void (optionnel) - Callback du clic

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
  onToggleFull={() => isExpanded = !isExpanded}
/>
```

### `OptimizationAlert.svelte`
Alerte affichant les économies potentielles de l'optimisation.

**Props:**
- `savings`: number - Montant des économies en euros

**Exemple:**
```svelte
<OptimizationAlert savings={1250.50} />
```

## Utilisation

### Importer les composants

```svelte
<script>
  import { Button, SummaryCard, EmptyState, AmortizationTable, OptimizationAlert } from '$lib/components';
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
