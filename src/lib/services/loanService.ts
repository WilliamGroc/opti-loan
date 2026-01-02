/**
 * Service pour la gestion des prêts individuels
 */

import { format } from 'date-fns';
import type { SavedLoan, MonthlyPaymentPeriod } from './types';

const LOCAL_STORAGE_KEY = 'opti-loan-prets';

/**
 * Charge les prêts depuis le localStorage
 */
export function loadLoans(): SavedLoan[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Erreur lors du chargement des prêts:', e);
        return [];
      }
    }
  }
  return [];
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
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLoans));
  return updatedLoans;
}

/**
 * Supprime un prêt
 */
export function deleteLoan(loans: SavedLoan[], id: string): SavedLoan[] {
  const updatedLoans = loans.filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLoans));
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
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLoans));
  return updatedLoans;
}

/**
 * Exporte tous les prêts en JSON
 */
export function exportLoans(loans: SavedLoan[]): void {
  const dataStr = JSON.stringify(loans, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `prets-opti-loan-${format(new Date(), 'yyyy-MM-dd')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Ajoute une période de paiement variable
 */
export function addPaymentPeriod(
  periods: MonthlyPaymentPeriod[],
  startMonth: number,
  endMonth: number,
  monthlyPayment: number
): MonthlyPaymentPeriod[] {
  const newPeriod: MonthlyPaymentPeriod = {
    id: Date.now().toString(),
    startMonth,
    endMonth,
    monthlyPayment
  };

  return [...periods, newPeriod].sort((a, b) => a.startMonth - b.startMonth);
}

/**
 * Supprime une période de paiement variable
 */
export function deletePaymentPeriod(
  periods: MonthlyPaymentPeriod[],
  id: string
): MonthlyPaymentPeriod[] {
  return periods.filter((p) => p.id !== id);
}

/**
 * Obtient la mensualité pour un mois donné (gestion des mensualités variables)
 */
export function getMonthlyPaymentForMonth(
  month: number,
  defaultPayment: number,
  calculationMode: 'payment' | 'duration' | 'variable',
  paymentPeriods: MonthlyPaymentPeriod[] = []
): number {
  if (calculationMode !== 'variable') return defaultPayment;

  const period = paymentPeriods.find((p) => month >= p.startMonth && month <= p.endMonth);
  return period ? period.monthlyPayment : defaultPayment;
}

/**
 * Calcule la mensualité d'un prêt
 */
export function calculateMonthlyPayment(
  amount: number,
  annualRate: number,
  durationYears: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = durationYears * 12;

  if (monthlyRate === 0) {
    return amount / totalMonths;
  }

  return (
    (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
}
