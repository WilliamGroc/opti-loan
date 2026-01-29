/**
 * Composable pour la gestion des listes de prêts
 */

import { writable } from 'svelte/store';
import type { SavedLoan } from '../services/types';
import {
  loadLoans,
  saveLoan,
  deleteLoan,
  cloneLoan,
  exportLoans
} from '../services';

export function createLoansListStore() {
  const { subscribe, set, update } = writable<SavedLoan[]>(loadLoans());

  return {
    subscribe,

    refresh: () => {
      set(loadLoans());
    },

    add: (loanData: Omit<SavedLoan, 'id' | 'saveDate'>) => {
      update(loans => {
        const updated = saveLoan(loans, loanData);
        return updated;
      });
    },

    remove: (id: string) => {
      update(loans => {
        const updated = deleteLoan(loans, id);
        return updated;
      });
    },

    clone: (loan: SavedLoan, newName: string) => {
      update(loans => {
        const updated = cloneLoan(loans, loan, newName);
        return updated;
      });
    },

    export: () => {
      const loans = loadLoans();
      exportLoans(loans);
    },

    getById: (loans: SavedLoan[], id: string): SavedLoan | undefined => {
      return loans.find(l => l.id === id);
    }
  };
}
