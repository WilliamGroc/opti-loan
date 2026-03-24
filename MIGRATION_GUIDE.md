# 🎯 Guide de Migration des Composants

## Objectif

Migrer progressivement les composants Svelte existants pour utiliser les nouveaux composables et bénéficier de l'architecture refactorisée.

## 🗺️ Plan de Migration

### Phase 1: Composants de Base (Semaine 1)

#### 1. LoanForm.svelte → loanFormStore

**Priorité: HAUTE** 🔴

**Avant:**

```svelte
<script lang="ts">
	let amount = 200000;
	let annualRate = 1.5;
	let durationYears = 20;
	// ... beaucoup de variables locales
</script>
```

**Après:**

```svelte
<script lang="ts">
	import { createLoanFormStore, createLoanFormValidation } from '$lib/composables';

	const formStore = createLoanFormStore();
	const validation = createLoanFormValidation(formStore);

	$: form = $formStore;
	$: valid = $validation;
</script>
```

**Avantages:**

- ✅ Validation automatique
- ✅ Moins de code boilerplate
- ✅ État centralisé
- ✅ Réutilisable

---

#### 2. SavedLoansList.svelte → loansListStore

**Priorité: HAUTE** 🔴

**Avant:**

```svelte
<script lang="ts">
	import { loadLoans, deleteLoan } from '$lib/services';

	let loans = loadLoans();

	function handleDelete(id: string) {
		loans = deleteLoan(loans, id);
	}
</script>
```

**Après:**

```svelte
<script lang="ts">
	import { createLoansListStore } from '$lib/composables';

	const loansStore = createLoansListStore();

	$: loans = $loansStore;
</script>

<button onclick={() => loansStore.remove(loan.id)}> Supprimer </button>
```

**Avantages:**

- ✅ Synchronisation automatique avec localStorage
- ✅ API simplifiée (add, remove, clone, export)
- ✅ Moins de gestion manuelle de l'état

---

### Phase 2: Composants de Plans (Semaine 2)

#### 3. FinancingPlanForm.svelte → plansListStore

**Priorité: MOYENNE** 🟡

**Migration:**

```svelte
<script lang="ts">
	import { createPlansListStore } from '$lib/composables';

	const plansStore = createPlansListStore();

	function createPlan(name: string, loans: SavedLoan[]) {
		plansStore.create(name, loans);
	}
</script>
```

---

#### 4. FinancingPlansList.svelte → plansListStore

**Priorité: MOYENNE** 🟡

---

#### 5. AmortizationTable.svelte → planAmortizationStore

**Priorité: HAUTE** 🔴

**Avant:**

```svelte
<script lang="ts">
	import { calculatePlanAmortization, optimizePlan } from '$lib/services';

	let displayMode: 'standard' | 'optimized' = 'standard';
	let standardTable = calculatePlanAmortization(plan);
	let { table: optimizedTable, savings } = optimizePlan(plan);

	$: currentTable = displayMode === 'standard' ? standardTable : optimizedTable;
</script>
```

**Après:**

```svelte
<script lang="ts">
	import { createPlanAmortizationStore } from '$lib/composables';

	const amortization = createPlanAmortizationStore(plan);

	$: table = $amortization.currentTable;
	$: summary = $amortization.summary;
</script>

<button onclick={amortization.toggleMode}> Basculer Mode </button>
```

**Avantages:**

- ✅ Calculs en cache
- ✅ Toggle mode simplifié
- ✅ Résumé automatique

---

### Phase 3: Composants Avancés (Semaine 3)

#### 6. LoanCard.svelte

**Priorité: BASSE** 🟢

**Action:** Utiliser les helpers de loansStore si nécessaire

---

#### 7. ResultsCards.svelte

**Priorité: BASSE** 🟢

**Action:** Peut rester tel quel, utilise déjà les services refactorisés

---

#### 8. VariablePaymentPeriods.svelte

**Priorité: MOYENNE** 🟡

**Migration:** Utiliser paymentService directement

```svelte
<script lang="ts">
	import { addPaymentPeriod, deletePaymentPeriod, validatePaymentPeriods } from '$lib/services';
</script>
```

---

## 📋 Checklist par Composant

### Pour chaque migration:

1. **Préparation**
   - [ ] Identifier toutes les variables d'état locales
   - [ ] Lister les fonctions de manipulation d'état
   - [ ] Vérifier les dépendances avec d'autres composants

2. **Migration**
   - [ ] Importer le composable approprié
   - [ ] Créer le store
   - [ ] Remplacer les variables locales par le store
   - [ ] Remplacer les fonctions par les méthodes du store
   - [ ] Mettre à jour les bindings dans le template

3. **Test**
   - [ ] Tester toutes les fonctionnalités
   - [ ] Vérifier la synchronisation localStorage
   - [ ] Tester les cas limites
   - [ ] Vérifier qu'il n'y a pas de régression

4. **Nettoyage**
   - [ ] Supprimer le code mort
   - [ ] Simplifier la logique redondante
   - [ ] Mettre à jour les commentaires
   - [ ] Vérifier les imports inutilisés

---

## 🔧 Exemples de Migration

### Exemple 1: Formulaire Simple

**Avant:**

```svelte
<script lang="ts">
	let name = '';
	let amount = 0;
	let errors: string[] = [];

	function validate() {
		errors = [];
		if (!name) errors.push('Nom requis');
		if (amount <= 0) errors.push('Montant invalide');
	}

	function save() {
		validate();
		if (errors.length === 0) {
			// Save logic
		}
	}
</script>

<input bind:value={name} />
<input type="number" bind:value={amount} />
{#if errors.length > 0}
	<ul>
		{#each errors as error}
			<li>{error}</li>
		{/each}
	</ul>
{/if}
```

**Après:**

```svelte
<script lang="ts">
	import { createLoanFormStore, createLoanFormValidation } from '$lib/composables';

	const form = createLoanFormStore();
	const validation = createLoanFormValidation(form);

	$: formData = $form;
	$: validationData = $validation;
</script>

<input
	value={formData.loanName}
	on:input={(e) => form.updateField('loanName', e.currentTarget.value)}
/>
<input
	type="number"
	value={formData.amount}
	on:input={(e) => form.updateField('amount', Number(e.currentTarget.value))}
/>

{#if !validationData.isValid}
	<ul>
		{#each Object.values(validationData.errors).filter(Boolean) as error}
			<li>{error}</li>
		{/each}
	</ul>
{/if}
```

---

### Exemple 2: Liste avec CRUD

**Avant:**

```svelte
<script lang="ts">
	import { loadLoans, deleteLoan, cloneLoan } from '$lib/services';

	let loans = loadLoans();

	function refresh() {
		loans = loadLoans();
	}

	function handleDelete(id: string) {
		loans = deleteLoan(loans, id);
	}

	function handleClone(loan: SavedLoan) {
		const newName = prompt('Nouveau nom');
		if (newName) {
			loans = cloneLoan(loans, loan, newName);
		}
	}
</script>

{#each loans as loan}
	<div>
		{loan.name}
		<button onclick={() => handleDelete(loan.id)}>Delete</button>
		<button onclick={() => handleClone(loan)}>Clone</button>
	</div>
{/each}
```

**Après:**

```svelte
<script lang="ts">
	import { createLoansListStore } from '$lib/composables';

	const loansStore = createLoansListStore();

	$: loans = $loansStore;

	function handleClone(loan: SavedLoan) {
		const newName = prompt('Nouveau nom');
		if (newName) {
			loansStore.clone(loan, newName);
		}
	}
</script>

{#each loans as loan}
	<div>
		{loan.name}
		<button onclick={() => loansStore.remove(loan.id)}>Delete</button>
		<button onclick={() => handleClone(loan)}>Clone</button>
	</div>
{/each}
```

---

## 🚨 Points d'Attention

### 1. Réactivité Svelte

```svelte
<!-- ❌ Mauvais - ne déclenche pas la réactivité -->
<script>
  const form = createLoanFormStore();
  let amount = $form.amount; // Copie statique
</script>

<!-- ✅ Bon - réactif -->
<script>
  const form = createLoanFormStore();
  $: amount = $form.amount; // Réactif
</script>

<!-- ✅ Encore mieux - utiliser directement -->
<input value={$form.amount} />
```

### 2. Gestion du Cycle de Vie

```svelte
<script>
	import { onMount } from 'svelte';
	import { createLoansListStore } from '$lib/composables';

	const loans = createLoansListStore();

	// ✅ Rafraîchir au montage si nécessaire
	onMount(() => {
		loans.refresh();
	});
</script>
```

### 3. Props vs Store

```svelte
<script>
	// Si le composant reçoit des données en props,
	// ne pas dupliquer dans un store
	export let loan: SavedLoan;

	// ❌ Mauvais - duplication inutile
	const form = createLoanFormStore();
	form.loadFromLoan(loan);

	// ✅ Bon - utiliser directement la prop
	// Ou créer le store uniquement si édition
</script>
```

---

## 📊 Suivi de Migration

| Composant                     | Priorité   | Status     | Date |
| ----------------------------- | ---------- | ---------- | ---- |
| LoanForm.svelte               | 🔴 HAUTE   | ⏳ À faire | -    |
| SavedLoansList.svelte         | 🔴 HAUTE   | ⏳ À faire | -    |
| AmortizationTable.svelte      | 🔴 HAUTE   | ⏳ À faire | -    |
| FinancingPlanForm.svelte      | 🟡 MOYENNE | ⏳ À faire | -    |
| FinancingPlansList.svelte     | 🟡 MOYENNE | ⏳ À faire | -    |
| VariablePaymentPeriods.svelte | 🟡 MOYENNE | ⏳ À faire | -    |
| LoanCard.svelte               | 🟢 BASSE   | ⏳ À faire | -    |
| ResultsCards.svelte           | 🟢 BASSE   | ⏳ À faire | -    |

---

## ✅ Validation Finale

Après chaque migration, vérifier :

1. **Fonctionnel**
   - [ ] Toutes les features fonctionnent
   - [ ] Pas de régression
   - [ ] LocalStorage synchronisé

2. **Code**
   - [ ] Pas d'erreurs TypeScript
   - [ ] Pas de warnings
   - [ ] Code simplifié

3. **Performance**
   - [ ] Pas de ralentissement
   - [ ] Recalculs optimisés

4. **UX**
   - [ ] Interface identique
   - [ ] Transitions fluides
   - [ ] Feedbacks utilisateur

---

## 🎓 Ressources

- Voir [ExampleComposableUsage.svelte](../src/lib/components/ExampleComposableUsage.svelte) pour un exemple complet
- Lire [ARCHITECTURE.md](./ARCHITECTURE.md) pour comprendre la structure
- Consulter [REFACTORING.md](./REFACTORING.md) pour les détails techniques

---

## 💡 Conseils

1. **Migrer progressivement** - Un composant à la fois
2. **Tester immédiatement** - Après chaque migration
3. **Garder l'historique Git** - Commits atomiques
4. **Demander des reviews** - Code review par l'équipe
5. **Documenter** - Mettre à jour ce fichier avec les dates
