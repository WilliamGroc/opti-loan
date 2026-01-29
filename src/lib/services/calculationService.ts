/**
 * Service pour les calculs d'amortissement de prêt individuel
 */

import { addMonths, parse } from 'date-fns';
import type { MonthlyPaymentPeriod } from './types';
import { getMonthlyPaymentForMonth } from './paymentService';
import { getMonthlyRate, calculateStandardMonthlyPayment } from './utils';

export interface SingleLoanAmortizationRow {
  month: number;
  date: Date;
  monthlyPayment: number;
  principal: number;
  interest: number;
  remaining: number;
}

export interface LoanCalculationResult {
  monthlyPayment: number;
  totalCost: number;
  totalInterest: number;
  amortizationTable: SingleLoanAmortizationRow[];
}

/**
 * Calcule l'amortissement complet d'un prêt
 */
export function calculateLoan(
  amount: number,
  annualRate: number,
  durationYears: number,
  monthlyPayment: number,
  startDate: string,
  calculationMode: 'payment' | 'duration' | 'variable',
  paymentPeriods: MonthlyPaymentPeriod[] = []
): LoanCalculationResult {
  const monthlyRate = getMonthlyRate(annualRate);
  const totalMonths = durationYears * 12;

  // Calculer la mensualité si en mode "payment"
  let finalMonthlyPayment = monthlyPayment;
  if (calculationMode === 'payment') {
    finalMonthlyPayment = calculateStandardMonthlyPayment(amount, annualRate, durationYears);
  }

  // Générer le tableau d'amortissement
  const amortizationTable: SingleLoanAmortizationRow[] = [];
  let remainingPrincipal = amount;
  let sumPayments = 0;

  for (let month = 1; month <= totalMonths; month++) {
    const monthPayment = getMonthlyPaymentForMonth(
      month,
      finalMonthlyPayment,
      calculationMode,
      paymentPeriods
    );
    const monthInterest = remainingPrincipal * monthlyRate;
    const principalRepaid = monthPayment - monthInterest;
    remainingPrincipal -= principalRepaid;

    if (remainingPrincipal < 0) remainingPrincipal = 0;

    const dueDate = addMonths(parse(startDate, 'yyyy-MM-dd', new Date()), month);

    amortizationTable.push({
      month,
      date: dueDate,
      monthlyPayment: monthPayment,
      principal: principalRepaid,
      interest: monthInterest,
      remaining: remainingPrincipal
    });

    sumPayments += monthPayment;
  }

  const totalCost = sumPayments;
  const totalInterest = totalCost - amount;

  return {
    monthlyPayment: finalMonthlyPayment,
    totalCost,
    totalInterest,
    amortizationTable
  };
}
