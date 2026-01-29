/**
 * Service pour la gestion des prêts individuels
 */

import { format } from 'date-fns';
import type { SavedLoan, MonthlyPaymentPeriod } from './types';
import { loadFromStorage, saveToStorage, exportAsJSON } from './storageService';
import { calculateStandardMonthlyPayment } from './utils';
import { getMonthlyPaymentForMonth } from './paymentService';

/**
 * Charge les prêts depuis le localStorage
 */
export function loadLoans(): SavedLoan[] {
  return loadFromStorage<SavedLoan>('LOANS');
}

/**
 * Sauvegarde un nouveau prêt
 */
export function saveLoan(
  loans: SavedLoan[],
  loanData: {
    name: string;
    amount: number;
    annualRate: number;
    durationYears: number;
    monthlyPayment: number;
    startDate: string;
    calculationMode: 'payment' | 'duration' | 'variable';
    paymentPeriods?: MonthlyPaymentPeriod[];
  }
): SavedLoan[] {
  const newLoan: SavedLoan = {
    id: Date.now().toString(),
    name: loanData.name,
    amount: loanData.amount,
    annualRate: loanData.annualRate,
    durationYears: loanData.durationYears,
    monthlyPayment: loanData.monthlyPayment,
    startDate: loanData.startDate,
    calculationMode: loanData.calculationMode,
    saveDate: new Date().toISOString(),
    paymentPeriods: loanData.calculationMode === 'variable' ? loanData.paymentPeriods : undefined
  };

  const updatedLoans = [newLoan, ...loans];
  saveToStorage('LOANS', updatedLoans);
  return updatedLoans;
}

/**
 * Supprime un prêt
 */
export function deleteLoan(loans: SavedLoan[], id: string): SavedLoan[] {
  const updatedLoans = loans.filter((p) => p.id !== id);
  saveToStorage('LOANS', updatedLoans);
  return updatedLoans;
}

/**
 * Clone un prêt avec un nouveau nom
 */
export function cloneLoan(loans: SavedLoan[], loan: SavedLoan, newName: string): SavedLoan[] {
  const clonedLoan: SavedLoan = {
    ...loan,
    id: Date.now().toString(),
    name: newName.trim(),
    saveDate: new Date().toISOString()
  };

  const updatedLoans = [clonedLoan, ...loans];
  saveToStorage('LOANS', updatedLoans);
  return updatedLoans;
}

/**
 * Exporte tous les prêts en JSON
 */
export function exportLoans(loans: SavedLoan[]): void {
  const filename = `prets-opti-loan-${format(new Date(), 'yyyy-MM-dd')}.json`;
  exportAsJSON(loans, filename);
}

/**
 * Calcule la mensualité d'un prêt
 */
export function calculateMonthlyPayment(
  amount: number,
  annualRate: number,
  durationYears: number
): number {
  return calculateStandardMonthlyPayment(amount, annualRate, durationYears);
}

// Ré-exporter les fonctions de paymentService pour la compatibilité
export {
  getMonthlyPaymentForMonth,
  addPaymentPeriod,
  deletePaymentPeriod
} from './paymentService';
