/**
 * Service pour la gestion des plans de financement
 */

import type { FinancingPlan } from './types';

const FINANCING_PLANS_KEY = 'opti-loan-plans';

/**
 * Charge les plans de financement depuis le localStorage
 */
export function loadFinancingPlans(): FinancingPlan[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const data = localStorage.getItem(FINANCING_PLANS_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Erreur lors du chargement des plans:', e);
      return [];
    }
  }
  return [];
}

/**
 * Sauvegarde les plans de financement dans le localStorage
 */
export function saveFinancingPlans(plans: FinancingPlan[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FINANCING_PLANS_KEY, JSON.stringify(plans));
  }
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
