/**
 * Composable pour la gestion des plans de financement
 */

import { writable, derived } from 'svelte/store';
import type { FinancingPlan, SavedLoan } from '../services/types';
import {
  loadFinancingPlans,
  deleteFinancingPlan,
  clonePlan,
  createFinancingPlan,
  updateFinancingPlan
} from '../services';
import { calculatePlanAmortization, optimizePlan } from '../services';

export function createPlansListStore() {
  const { subscribe, set, update } = writable<FinancingPlan[]>(loadFinancingPlans());

  return {
    subscribe,

    refresh: () => {
      set(loadFinancingPlans());
    },

    create: (planName: string, selectedLoans: SavedLoan[]) => {
      update(plans => {
        const updated = createFinancingPlan(plans, planName, selectedLoans);
        return updated;
      });
    },

    remove: (index: number) => {
      update(plans => {
        const updated = deleteFinancingPlan(plans, index);
        return updated;
      });
    },

    clone: (plan: FinancingPlan, newName: string) => {
      update(plans => {
        const cloned = clonePlan(plan, newName);
        plans.unshift(cloned);
        return plans;
      });
    },

    updatePlan: (index: number, updatedPlan: FinancingPlan) => {
      update(plans => {
        const updated = updateFinancingPlan(plans, index, updatedPlan);
        return updated;
      });
    }
  };
}

/**
 * Store pour les calculs d'amortissement d'un plan
 */
export function createPlanAmortizationStore(plan: FinancingPlan) {
  const standardTable = calculatePlanAmortization(plan);
  const { table: optimizedTable, savings } = optimizePlan(plan);

  const displayMode = writable<'standard' | 'optimized'>('standard');

  const currentTable = derived(displayMode, $mode =>
    $mode === 'standard' ? standardTable : optimizedTable
  );

  const summary = derived(currentTable, $table => {
    const totalInterest = $table.reduce((sum, row) => sum + row.totalInterest, 0);
    const totalPrincipal = $table.reduce((sum, row) => sum + row.totalPrincipal, 0);
    const totalCost = totalPrincipal + totalInterest;
    const durationMonths = $table.length;

    return {
      totalPrincipal,
      totalInterest,
      totalCost,
      durationMonths,
      durationYears: Math.ceil(durationMonths / 12)
    };
  });

  return {
    standardTable,
    optimizedTable,
    savings,
    displayMode,
    currentTable,
    summary,

    toggleMode: () => {
      displayMode.update(mode => mode === 'standard' ? 'optimized' : 'standard');
    }
  };
}
