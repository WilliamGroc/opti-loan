/**
 * Service pour la gestion des plans de financement
 */

import type { FinancingPlan, SavedLoan } from './types';
import { loadFromStorage, saveToStorage } from './storageService';

/**
 * Charge les plans de financement depuis le localStorage
 */
export function loadFinancingPlans(): FinancingPlan[] {
  return loadFromStorage<FinancingPlan>('PLANS');
}

/**
 * Sauvegarde les plans de financement dans le localStorage
 */
function saveFinancingPlans(plans: FinancingPlan[]): void {
  saveToStorage('PLANS', plans);
}

/**
 * Supprime un plan de financement
 */
export function deleteFinancingPlan(plans: FinancingPlan[], index: number): FinancingPlan[] {
  const updated = [...plans];
  updated.splice(index, 1);
  saveFinancingPlans(updated);
  return updated;
}

/**
 * Clone un plan de financement
 */
export function clonePlan(plan: FinancingPlan, newName: string): FinancingPlan {
  return {
    id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: newName.trim(),
    selectedLoans: [...plan.selectedLoans],
    createdDate: new Date().toISOString()
  };
}

/**
 * Ajoute un plan de financement
 */
export function addFinancingPlan(plans: FinancingPlan[], newPlan: FinancingPlan): FinancingPlan[] {
  const updated = [newPlan, ...plans];
  saveFinancingPlans(updated);
  return updated;
}

/**
 * Met à jour un plan de financement
 */
export function updateFinancingPlan(
  plans: FinancingPlan[],
  index: number,
  updatedPlan: FinancingPlan
): FinancingPlan[] {
  const updated = [...plans];
  updated[index] = updatedPlan;
  saveFinancingPlans(updated);
  return updated;
}

/**
 * Crée un nouveau plan de financement
 */
export function createFinancingPlan(
  plans: FinancingPlan[],
  planName: string,
  selectedLoans: SavedLoan[]
): FinancingPlan[] {
  const plan: FinancingPlan = {
    id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: planName,
    selectedLoans: selectedLoans,
    createdDate: new Date().toISOString()
  };

  return addFinancingPlan(plans, plan);
}

/**
 * Trouve un plan de financement par ID
 */
export function getFinancingPlanById(id: string): FinancingPlan | undefined {
  const plans = loadFinancingPlans();
  return plans.find(plan => plan.id === id);
}

/**
 * Supprime un plan de financement par ID
 */
export function deleteFinancingPlanById(id: string): void {
  const plans = loadFinancingPlans();
  const updated = plans.filter(plan => plan.id !== id);
  saveFinancingPlans(updated);
}
