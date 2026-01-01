# Exemples d'Utilisation des Composants

## Importer les Composants

### Option 1: Importer depuis l'index centralisé
```svelte
<script>
  import { Button, SummaryCard, EmptyState, AmortizationTable, OptimizationAlert } from '$lib/components';
</script>
```

### Option 2: Importer individuellement
```svelte
<script>
  import Button from '$lib/components/Button.svelte';
  import SummaryCard from '$lib/components/SummaryCard.svelte';
</script>
```

---

## Button.svelte

### Variantes de Couleur

```svelte
<Button variant="primary">Primaire</Button>
<Button variant="secondary">Secondaire</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Succès</Button>
<Button variant="info">Info</Button>
```

### Variantes de Taille

```svelte
<Button size="sm">Petit</Button>
<Button size="md">Moyen (défaut)</Button>
<Button size="lg">Grand</Button>
```

### Avec Événement

```svelte
<script>
  function handleClick() {
    console.log('Bouton cliqué !');
  }
</script>

<Button on:click={handleClick}>Cliquez-moi</Button>
```

### Bouton Désactivé

```svelte
<Button disabled>Désactivé</Button>
```

### Bouton Full Width

```svelte
<Button fullWidth>Pleine Largeur</Button>
```

### Combinaisons

```svelte
<Button variant="success" size="lg" fullWidth on:click={submitForm}>
  ✓ Valider le formulaire
</Button>
```

---

## SummaryCard.svelte

### Variante Défaut

```svelte
<SummaryCard 
  label="Montant Total" 
  value="€10,000"
/>
```

### Variante Optimisée

```svelte
<SummaryCard 
  label="Intérêts Optimisés" 
  value="€1,250"
  variant="optimized"
/>
```

### Variante Économies

```svelte
<SummaryCard 
  label="Économies" 
  value="-€250"
  variant="savings"
/>
```

### Dans une Grille

```svelte
<div class="summary-grid">
  <SummaryCard label="Total" value="€100,000" />
  <SummaryCard label="Intérêts" value="€25,000" />
  <SummaryCard label="Durée" value="20 ans" />
</div>

<style>
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
</style>
```

---

## EmptyState.svelte

### État Vide Simple

```svelte
<EmptyState 
  title="Aucune donnée"
  description="Créez votre premier élément pour commencer."
/>
```

### Avec Bouton Lien

```svelte
<EmptyState 
  title="Aucun plan"
  description="Créez votre premier plan de financement."
  icon="📋"
  buttonText="Créer un plan"
  buttonHref="/create"
/>
```

### Avec Callback

```svelte
<script>
  function onCreate() {
    // Action personnalisée
  }
</script>

<EmptyState 
  title="Aucun résultat"
  description="Aucun plan ne correspond à votre recherche."
  icon="🔍"
  buttonText="Réinitialiser"
  onButtonClick={onCreate}
/>
```

### Customisé

```svelte
<EmptyState 
  title="Panier vide"
  description="Vous n'avez aucun élément dans votre panier."
  icon="🛒"
  buttonText="Continuer les achats"
  buttonHref="/shop"
/>
```

---

## AmortizationTable.svelte

### Données de Base

```svelte
<script>
  let amortizationData = [
    {
      month: 1,
      date: new Date('2024-02-01'),
      loansData: [
        {
          name: 'Prêt immobilier',
          monthlyPayment: 1500,
          principal: 500,
          interest: 1000,
          remaining: 199500
        }
      ],
      totalMonthlyPayment: 1500,
      totalPrincipal: 500,
      totalInterest: 1000,
      totalRemaining: 199500
    }
    // ... plus de mois
  ];
</script>

<AmortizationTable 
  data={amortizationData}
  variant="default"
/>
```

### Avec Toggle Affichage

```svelte
<script>
  let showFull = false;
</script>

<AmortizationTable 
  data={amortizationData}
  showFull={showFull}
  variant="default"
  onToggleFull={() => showFull = !showFull}
/>
```

### Variante Optimisée

```svelte
<AmortizationTable 
  data={optimizedData}
  showFull={showFullOptimized}
  variant="optimized"
  onToggleFull={() => showFullOptimized = !showFullOptimized}
/>
```

### Avec Deux Tables

```svelte
<script>
  let showFullStandard = false;
  let showFullOptimized = false;
</script>

<div class="comparison">
  <div class="table-section">
    <h3>Plan Standard</h3>
    <AmortizationTable 
      data={standardPlan}
      showFull={showFullStandard}
      variant="default"
      onToggleFull={() => showFullStandard = !showFullStandard}
    />
  </div>
  
  <div class="table-section">
    <h3>Plan Optimisé</h3>
    <AmortizationTable 
      data={optimizedPlan}
      showFull={showFullOptimized}
      variant="optimized"
      onToggleFull={() => showFullOptimized = !showFullOptimized}
    />
  </div>
</div>

<style>
  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  @media (max-width: 1024px) {
    .comparison {
      grid-template-columns: 1fr;
    }
  }
</style>
```

---

## OptimizationAlert.svelte

### Usage Simple

```svelte
<script>
  let savings = 1250.50;
</script>

<OptimizationAlert savings={savings} />
```

### Avec Calcul Dynamique

```svelte
<script>
  let originalInterest = 25000;
  let optimizedInterest = 23750;
  
  $: savings = originalInterest - optimizedInterest;
</script>

<OptimizationAlert savings={savings} />
```

### Dans un Contexte Complet

```svelte
<script>
  let originalInterest = 25000;
  let optimizedInterest = 23750;
  let savings = originalInterest - optimizedInterest;
</script>

<div class="optimization-results">
  <OptimizationAlert savings={savings} />
  
  <div class="comparison">
    <SummaryCard 
      label="Intérêts Originaux" 
      value="{originalInterest.toFixed(2)} €"
    />
    <SummaryCard 
      label="Intérêts Optimisés" 
      value="{optimizedInterest.toFixed(2)} €"
      variant="optimized"
    />
    <SummaryCard 
      label="Économies" 
      value="-{savings.toFixed(2)} €"
      variant="savings"
    />
  </div>
</div>

<style>
  .comparison {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
</style>
```

---

## Cas d'Usage Complet: Page de Plans

```svelte
<script>
  import { Button, SummaryCard, EmptyState, AmortizationTable } from '$lib/components';

  let plans = [];
  let selectedPlan = null;
  let showFullTable = false;

  function createPlan() {
    // Créer un nouveau plan
  }
</script>

{#if plans.length === 0}
  <EmptyState 
    title="Aucun plan"
    description="Créez votre premier plan de financement."
    icon="📋"
    buttonText="Créer"
    onButtonClick={createPlan}
  />
{:else}
  <div class="summary-grid">
    <SummaryCard label="Plans" value={plans.length.toString()} />
    <SummaryCard label="Total Financé" value="€500,000" />
  </div>

  <div class="plans-list">
    {#each plans as plan}
      <div class="plan-card">
        <h3>{plan.name}</h3>
        <Button on:click={() => selectedPlan = plan}>Voir Détails</Button>
      </div>
    {/each}
  </div>

  {#if selectedPlan}
    <div class="plan-detail">
      <h2>{selectedPlan.name}</h2>
      
      <AmortizationTable 
        data={selectedPlan.amortization}
        showFull={showFullTable}
        variant="default"
        onToggleFull={() => showFullTable = !showFullTable}
      />
      
      <Button 
        variant="secondary" 
        on:click={() => selectedPlan = null}
      >
        Fermer
      </Button>
    </div>
  {/if}
{/if}

<style>
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .plans-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .plan-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
  }
</style>
```

---

## Bonnes Pratiques

### 1. Réutiliser les Composants
```svelte
<!-- ✅ Bon -->
<Button variant="success">Valider</Button>

<!-- ❌ Mauvais -->
<button style="background: green; ...">Valider</button>
```

### 2. Props Typées
```svelte
<!-- Les composants sont bien typés en TypeScript -->
<Button variant="invalid"> <!-- ❌ Erreur TypeScript -->
```

### 3. Combiner les Variantes
```svelte
<!-- ✅ Bon -->
<Button variant="danger" size="lg" fullWidth>Supprimer</Button>

<!-- Pas idéal -->
<Button>Supprimer</Button>
```

### 4. Utiliser l'Index Central
```svelte
<!-- ✅ Bon -->
import { Button, SummaryCard } from '$lib/components';

<!-- Fonctionne mais moins optimal -->
import Button from '$lib/components/Button.svelte';
```

---

## Troubleshooting

### Les composants ne s'affichent pas
```svelte
<!-- Vérifier l'import -->
import { Button } from '$lib/components'; // ✅

<!-- Utiliser le composant en majuscule -->
<Button>Texte</Button> <!-- ✅ -->
```

### Les styles ne s'appliquent pas
```svelte
<!-- Vérifier la variante -->
<Button variant="success">Text</Button>

<!-- Pas de typo -->
<Button varian="succes">Text</Button> <!-- ❌ -->
```

---

Pour plus d'exemples, consultez les fichiers source dans `src/lib/components/`.
