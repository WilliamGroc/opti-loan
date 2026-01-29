/**
 * Utilitaires communs pour les services
 */

import { addMonths } from 'date-fns';
import type { SavedLoan } from './types';

/**
 * Calcule le nombre de mois entre deux dates
 */
export function getMonthsBetween(startDate: Date, endDate: Date): number {
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
}

/**
 * Obtient la date de fin d'un prêt
 */
export function getLoanEndDate(loan: SavedLoan): Date {
  return addMonths(new Date(loan.startDate), loan.durationYears * 12);
}

/**
 * Calcule les bornes temporelles d'un ensemble de prêts
 */
export function getDateBounds(loans: SavedLoan[]): { minStartDate: Date; maxEndDate: Date; totalMonths: number } {
  let minStartDate = new Date(loans[0].startDate);
  let maxEndDate = getLoanEndDate(loans[0]);

  loans.forEach(loan => {
    const start = new Date(loan.startDate);
    const end = getLoanEndDate(loan);
    if (start < minStartDate) minStartDate = start;
    if (end > maxEndDate) maxEndDate = end;
  });

  const totalMonths = getMonthsBetween(minStartDate, maxEndDate);

  return { minStartDate, maxEndDate, totalMonths };
}

/**
 * Calcule le taux mensuel à partir du taux annuel
 */
export function getMonthlyRate(annualRate: number): number {
  return annualRate / 100 / 12;
}

/**
 * Calcule la mensualité constante d'un prêt (formule standard)
 */
export function calculateStandardMonthlyPayment(
  amount: number,
  annualRate: number,
  durationYears: number
): number {
  const monthlyRate = getMonthlyRate(annualRate);
  const totalMonths = durationYears * 12;

  if (monthlyRate === 0) {
    return amount / totalMonths;
  }

  return (
    (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
}

/**
 * Arrondit une valeur proche de zéro à zéro
 */
export function roundToZeroIfNegligible(value: number, threshold = 0.01): number {
  return Math.abs(value) < threshold ? 0 : value;
}

/**
 * Calcule le mois relatif d'un prêt par rapport à une date de référence
 */
export function getLoanRelativeMonth(
  loanStartDate: Date,
  referenceDate: Date,
  currentMonth: number
): number {
  const monthsFromReference = getMonthsBetween(referenceDate, loanStartDate);
  return currentMonth - monthsFromReference;
}

/**
 * Vérifie si un prêt est actif pour un mois donné
 */
export function isLoanActiveInMonth(
  loan: SavedLoan,
  month: number,
  referenceDate: Date
): boolean {
  const startMonth = getMonthsBetween(referenceDate, new Date(loan.startDate));
  const endMonth = startMonth + loan.durationYears * 12;
  return month > startMonth && month <= endMonth;
}
