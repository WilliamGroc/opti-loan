# Services Métier - Opti-Loan

Ce document décrit la structure et l'organisation des services métier de l'application Opti-Loan.

## Architecture

Les fonctions métier ont été extraites des composants Svelte et organisées dans des modules TypeScript dédiés dans le dossier `src/lib/services/`.

## Structure des Services

### 1. **types.ts**
Définit toutes les interfaces TypeScript utilisées dans l'application :
- `MonthlyPaymentPeriod` : Période de mensualité variable
- `SavedLoan` : Prêt sauvegardé
- `FinancingPlan` : Plan de financement
- `LoanData` : Données de prêt dans un tableau d'amortissement
- `AmortizationRow` : Ligne de tableau d'amortissement
- `LoanBalance` : Solde de prêt

### 2. **loanService.ts**
Gestion des prêts individuels et du localStorage :
- `loadLoans()` : Charge les prêts depuis le localStorage
- `saveLoan(loans, loanData)` : Sauvegarde un nouveau prêt
- `deleteLoan(loans, id)` : Supprime un prêt
- `cloneLoan(loans, loan, newName)` : Clone un prêt
- `exportLoans(loans)` : Exporte les prêts en JSON
- `addPaymentPeriod(periods, ...)` : Ajoute une période de paiement variable
- `deletePaymentPeriod(periods, id)` : Supprime une période
- `getMonthlyPaymentForMonth(month, ...)` : Obtient la mensualité pour un mois donné
- `calculateMonthlyPayment(amount, rate, duration)` : Calcule la mensualité

### 3. **calculationService.ts**
Calculs d'amortissement pour un prêt unique :
- `calculateLoan(amount, rate, duration, ...)` : Calcule le tableau d'amortissement complet d'un prêt
- Interface `SingleLoanAmortizationRow` : Ligne du tableau d'amortissement
- Interface `LoanCalculationResult` : Résultat du calcul

### 4. **planService.ts**
Gestion des plans de financement :
- `loadFinancingPlans()` : Charge les plans depuis le localStorage
- `saveFinancingPlans(plans)` : Sauvegarde les plans
- `deleteFinancingPlan(plans, index)` : Supprime un plan
- `clonePlan(plan, newName)` : Clone un plan
- `addFinancingPlan(plans, newPlan)` : Ajoute un plan
- `updateFinancingPlan(plans, index, updatedPlan)` : Met à jour un plan
- `createFinancingPlan(plans, planName, selectedLoans)` : Crée un nouveau plan

### 5. **amortizationService.ts**
Calculs d'amortissement pour les plans multi-prêts :
- `calculatePlanAmortization(plan)` : Calcule le tableau d'amortissement combiné
- `optimizePlan(plan)` : Optimise un plan avec la méthode avalanche
- Interface `OptimizationResult` : Résultat de l'optimisation

### 6. **exportService.ts**
Export de données :
- `exportPlanAsCSV(plan, amortization)` : Exporte un plan en CSV

### 7. **index.ts**
Point d'entrée centralisé qui réexporte tous les services

## Utilisation dans les Composants

### Exemple d'import
```typescript
import {
  loadLoans,
  saveLoan,
  deleteLoan,
  calculateLoan,
  loadFinancingPlans,
  createFinancingPlan
} from '$lib/services';
```

### Exemple d'utilisation
```typescript
// Charger les prêts
onMount(() => {
  savedLoans = loadLoans();
  financingPlans = loadFinancingPlans();
});

// Sauvegarder un prêt
function handleSaveLoan() {
  savedLoans = saveLoan(savedLoans, {
    name: loanName,
    amount,
    annualRate,
    durationYears,
    monthlyPayment,
    startDate,
    calculationMode,
    paymentPeriods
  });
}

// Calculer l'amortissement
function handleCalculate() {
  const result = calculateLoan(
    amount,
    annualRate,
    durationYears,
    monthlyPayment,
    startDate,
    calculationMode,
    paymentPeriods
  );
  
  monthlyPayment = result.monthlyPayment;
  totalCost = result.totalCost;
  totalInterest = result.totalInterest;
  amortizationTable = result.amortizationTable;
}
```

## Avantages de cette Architecture

1. **Séparation des préoccupations** : La logique métier est séparée des composants UI
2. **Réutilisabilité** : Les services peuvent être utilisés par n'importe quel composant
3. **Testabilité** : Les fonctions pures sont faciles à tester unitairement
4. **Maintenabilité** : Code organisé et facile à naviguer
5. **Type Safety** : TypeScript assure la cohérence des types à travers l'application

## Convention de Nommage

- **Services** : Suffixe `Service` (ex: `loanService.ts`)
- **Fonctions** : Verbe descriptif (ex: `loadLoans`, `calculateMonthlyPayment`)
- **Interfaces** : PascalCase (ex: `SavedLoan`, `FinancingPlan`)
- **Constantes** : UPPER_SNAKE_CASE (ex: `LOCAL_STORAGE_KEY`)
