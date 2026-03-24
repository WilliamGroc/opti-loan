# Composants de la Page Principale

Composants spécifiques à la page de calcul de prêt (`/`).

## Composants

### 🧮 LoanCalculator

Composant principal intégrant le formulaire, les résultats et les analyses.

- **Imports** : LoanForm, ResultsCards, ParameterImpactAnalysis
- **Usage** : Interface complète de calcul de prêt

### 📝 LoanForm

Formulaire de saisie des paramètres du prêt.

- **Props** : amount, annualRate, durationYears, etc.
- **Features** : Modes de calcul (payment/duration/variable), périodes de paiement variables
- **Imports** : VariablePaymentPeriods

### 📊 ResultsCards

Affichage des résultats du calcul sous forme de cartes.

- **Props** : monthlyPayment, totalCost, totalInterest, durationYears
- **Usage** : Visualisation claire des résultats principaux

### 📈 ParameterImpactAnalysis

Analyse d'impact des variations de paramètres.

- **Props** : amount, annualRate, durationYears
- **Usage** : Simulation des variations de +/- 10%

### 💾 SavedLoansList

Liste des prêts sauvegardés.

- **Props** : onLoad (callback)
- **Imports** : LoanCard
- **Usage** : Gestion et chargement des prêts sauvegardés

### 🃏 LoanCard

Carte d'affichage d'un prêt individuel.

- **Props** : loan, onLoad, onDelete
- **Usage** : Affichage détaillé d'un prêt sauvegardé

### 🔢 VariablePaymentPeriods

Gestion des périodes de mensualités variables.

- **Props** : durationYears, paymentPeriods, onChange
- **Usage** : Configuration avancée des paiements variables
