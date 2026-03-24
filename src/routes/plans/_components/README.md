# Composants de la Page Plans

Composants spécifiques à la page de gestion des plans de financement (`/plans`).

## Composants

### 📋 FinancingPlanForm

Formulaire de création d'un plan de financement.

- **Props** : Aucune (utilise le store)
- **Features** : Sélection multiple de prêts, création de plan
- **Usage** : Interface de création de nouveaux plans

### 📑 FinancingPlansList

Liste des plans de financement sauvegardés.

- **Imports** : FinancingPlanCard
- **Features** : Affichage, gestion des plans existants
- **Usage** : Visualisation de tous les plans

### 🗂️ FinancingPlanCard

Carte d'affichage d'un plan de financement individuel.

- **Props** : plan, onLoad, onDelete
- **Features** : Affichage des détails, actions (charger, supprimer)
- **Usage** : Affichage détaillé d'un plan avec ses prêts
