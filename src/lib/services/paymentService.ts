/**
 * Service pour la gestion des paiements mensuels
 */

import type { MonthlyPaymentPeriod } from './types';

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
 * Valide les périodes de paiement (pas de chevauchement)
 */
export function validatePaymentPeriods(
  periods: MonthlyPaymentPeriod[],
  totalMonths: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Vérifier que les périodes sont dans la durée du prêt
  periods.forEach(period => {
    if (period.startMonth < 1 || period.endMonth > totalMonths) {
      errors.push(`La période ${period.id} dépasse la durée du prêt`);
    }
    if (period.startMonth > period.endMonth) {
      errors.push(`La période ${period.id} a une fin avant son début`);
    }
  });

  // Vérifier les chevauchements
  for (let i = 0; i < periods.length; i++) {
    for (let j = i + 1; j < periods.length; j++) {
      const p1 = periods[i];
      const p2 = periods[j];

      if (
        (p1.startMonth <= p2.endMonth && p1.endMonth >= p2.startMonth) ||
        (p2.startMonth <= p1.endMonth && p2.endMonth >= p1.startMonth)
      ) {
        errors.push(`Chevauchement entre les périodes ${p1.id} et ${p2.id}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
