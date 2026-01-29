/**
 * Composable pour la gestion des formulaires de prêt
 */

import { writable, derived } from 'svelte/store';
import type { SavedLoan, MonthlyPaymentPeriod } from '../services/types';

export interface LoanFormState {
  amount: number;
  annualRate: number;
  durationYears: number;
  monthlyPayment: number;
  startDate: string;
  calculationMode: 'payment' | 'duration' | 'variable';
  paymentPeriods: MonthlyPaymentPeriod[];
  loanName: string;
}

export function createLoanFormStore(initialValues?: Partial<LoanFormState>) {
  const defaultValues: LoanFormState = {
    amount: 200000,
    annualRate: 1.5,
    durationYears: 20,
    monthlyPayment: 0,
    startDate: new Date().toISOString().split('T')[0],
    calculationMode: 'payment',
    paymentPeriods: [],
    loanName: '',
    ...initialValues
  };

  const store = writable<LoanFormState>(defaultValues);

  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,

    reset: () => store.set(defaultValues),

    updateField: <K extends keyof LoanFormState>(field: K, value: LoanFormState[K]) => {
      store.update(state => ({ ...state, [field]: value }));
    },

    loadFromLoan: (loan: SavedLoan) => {
      store.set({
        amount: loan.amount,
        annualRate: loan.annualRate,
        durationYears: loan.durationYears,
        monthlyPayment: loan.monthlyPayment,
        startDate: loan.startDate,
        calculationMode: loan.calculationMode,
        paymentPeriods: loan.paymentPeriods || [],
        loanName: loan.name
      });
    },

    toSavedLoan: (state: LoanFormState): Omit<SavedLoan, 'id' | 'saveDate'> => ({
      name: state.loanName,
      amount: state.amount,
      annualRate: state.annualRate,
      durationYears: state.durationYears,
      monthlyPayment: state.monthlyPayment,
      startDate: state.startDate,
      calculationMode: state.calculationMode,
      paymentPeriods: state.calculationMode === 'variable' ? state.paymentPeriods : undefined
    })
  };
}

/**
 * Store dérivé pour la validation du formulaire
 */
export function createLoanFormValidation(formStore: ReturnType<typeof createLoanFormStore>) {
  return derived(formStore, $form => ({
    isValid:
      $form.amount > 0 &&
      $form.annualRate >= 0 &&
      $form.durationYears > 0 &&
      $form.startDate !== '' &&
      ($form.calculationMode !== 'duration' || $form.monthlyPayment > 0) &&
      ($form.calculationMode !== 'variable' || $form.paymentPeriods.length > 0),

    canSave: $form.loanName.trim() !== '',

    errors: {
      amount: $form.amount <= 0 ? 'Le montant doit être positif' : null,
      annualRate: $form.annualRate < 0 ? 'Le taux ne peut pas être négatif' : null,
      durationYears: $form.durationYears <= 0 ? 'La durée doit être positive' : null,
      startDate: $form.startDate === '' ? 'La date de début est requise' : null,
      monthlyPayment:
        $form.calculationMode === 'duration' && $form.monthlyPayment <= 0
          ? 'La mensualité doit être positive'
          : null,
      loanName: $form.loanName.trim() === '' ? 'Le nom est requis pour sauvegarder' : null
    }
  }));
}
