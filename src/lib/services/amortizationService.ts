/**
 * Service pour les calculs d'amortissement - Version refactorisée
 */

import { addMonths } from 'date-fns';
import type { FinancingPlan, AmortizationRow, SavedLoan, LoanData, MonthlyPaymentPeriod } from './types';
import { getDateBounds, getMonthlyRate, getMonthsBetween, roundToZeroIfNegligible } from './utils';
import { getMonthlyPaymentForMonth } from './paymentService';

/**
 * Interface pour le solde d'un prêt
 */
interface LoanBalance {
  loan: SavedLoan;
  remaining: number;
  startMonth: number;
  endMonth: number;
}

/**
 * Calcule le capital restant d'un prêt jusqu'à un mois donné
 */
function calculateLoanRemainingBalance(
  loan: SavedLoan,
  startMonth: number,
  currentMonth: number,
  initialBalance: number
): number {
  let remaining = initialBalance;
  const monthlyRate = getMonthlyRate(loan.annualRate);

  for (let m = startMonth + 1; m < currentMonth; m++) {
    const payment = getMonthlyPaymentForMonth(
      m - startMonth,
      loan.monthlyPayment,
      loan.calculationMode,
      loan.paymentPeriods || []
    );
    const interest = remaining * monthlyRate;
    const principal = payment - interest;
    remaining -= principal;
    if (remaining < 0) remaining = 0;
  }

  return remaining;
}

/**
 * Calcule les données de paiement pour un prêt dans un mois donné
 */
function calculateLoanMonthPayment(
  loan: SavedLoan,
  monthInLoan: number,
  remainingBalance: number
): { payment: number; principal: number; interest: number; remaining: number } {
  const monthlyRate = getMonthlyRate(loan.annualRate);
  const payment = getMonthlyPaymentForMonth(
    monthInLoan,
    loan.monthlyPayment,
    loan.calculationMode,
    loan.paymentPeriods || []
  );

  const interest = remainingBalance * monthlyRate;
  const principal = payment - interest;
  const remaining = roundToZeroIfNegligible(remainingBalance - principal);

  return { payment, principal, interest, remaining };
}

/**
 * Initialise les soldes des prêts
 */
function initializeLoanBalances(
  loans: SavedLoan[],
  minStartDate: Date
): LoanBalance[] {
  return loans.map(loan => {
    const start = new Date(loan.startDate);
    const startMonth = Math.round(getMonthsBetween(minStartDate, start));
    return {
      loan,
      remaining: loan.amount,
      startMonth,
      endMonth: startMonth + loan.durationYears * 12
    };
  });
}

/**
 * Calcule le tableau d'amortissement standard pour un plan de financement
 */
export function calculatePlanAmortization(plan: FinancingPlan): AmortizationRow[] {
  const amortizationTable: AmortizationRow[] = [];
  const { minStartDate, totalMonths } = getDateBounds(plan.selectedLoans);
  const loanBalances = initializeLoanBalances(plan.selectedLoans, minStartDate);

  for (let month = 1; month <= totalMonths; month++) {
    const currentDate = addMonths(minStartDate, month);
    const loansData: LoanData[] = [];
    let totalMonthlyPayment = 0;
    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalRemaining = 0;

    loanBalances.forEach(lb => {
      const monthInLoan = month - lb.startMonth;

      if (monthInLoan > 0 && monthInLoan <= lb.loan.durationYears * 12) {
        // Recalculer le solde restant jusqu'au mois courant
        if (monthInLoan > 1) {
          lb.remaining = calculateLoanRemainingBalance(
            lb.loan,
            lb.startMonth,
            month,
            lb.loan.amount
          );
        }

        const { payment, principal, interest, remaining } = calculateLoanMonthPayment(
          lb.loan,
          monthInLoan,
          lb.remaining
        );

        lb.remaining = remaining;

        totalMonthlyPayment += payment;
        totalPrincipal += principal;
        totalInterest += interest;
        totalRemaining += remaining;

        loansData.push({
          name: lb.loan.name,
          monthlyPayment: payment,
          principal,
          interest,
          remaining
        });
      }
    });

    if (loansData.length > 0) {
      amortizationTable.push({
        month,
        date: currentDate,
        loansData,
        totalMonthlyPayment,
        totalPrincipal,
        totalInterest,
        totalRemaining,
        remainingBalance: 0,
        loanDetails: []
      });
    }
  }

  return amortizationTable;
}

/**
 * Pré-calcule les soldes jusqu'à un mois donné
 */
function precalculateBalances(
  loanBalances: LoanBalance[],
  startMonth: number
): void {
  for (let month = 1; month < startMonth; month++) {
    loanBalances.forEach(lb => {
      if (month > lb.startMonth && month <= lb.endMonth) {
        const monthInLoan = month - lb.startMonth;
        const { remaining } = calculateLoanMonthPayment(lb.loan, monthInLoan, lb.remaining);
        lb.remaining = remaining;
      }
    });
  }
}

/**
 * Distribue le budget disponible selon la méthode avalanche
 */
function distributeAvalancheBudget(
  activeLoans: LoanBalance[],
  budgetRemaining: number
): Map<LoanBalance, { interest: number; principal: number }> {
  const payments = new Map<LoanBalance, { interest: number; principal: number }>();
  
  // Étape 1: Payer tous les intérêts
  activeLoans.forEach(lb => {
    const interest = lb.remaining * getMonthlyRate(lb.loan.annualRate);
    budgetRemaining -= interest;
    payments.set(lb, { interest, principal: 0 });
  });

  // Étape 2: Distribuer le capital sur les prêts avec les taux les plus élevés
  const sortedLoans = [...activeLoans].sort(
    (a, b) => b.loan.annualRate - a.loan.annualRate
  );

  for (const lb of sortedLoans) {
    if (budgetRemaining <= 0) break;

    const payment = payments.get(lb)!;
    const maxPrincipal = Math.min(budgetRemaining, lb.remaining);
    payment.principal = maxPrincipal;
    budgetRemaining -= maxPrincipal;
    lb.remaining = roundToZeroIfNegligible(lb.remaining - maxPrincipal);
  }

  return payments;
}

/**
 * Optimise un plan de financement en utilisant la méthode avalanche
 */
export function optimizePlan(plan: FinancingPlan): {
  table: AmortizationRow[];
  savings: number;
} {
  const optimizedTable: AmortizationRow[] = [];
  const { minStartDate, totalMonths } = getDateBounds(plan.selectedLoans);

  // Calculer le mois d'optimisation (aujourd'hui)
  const today = new Date();
  const currentMonth = Math.ceil(getMonthsBetween(minStartDate, today));
  const startOptimizationMonth = Math.max(1, currentMonth);

  // Budget mensuel total disponible
  const totalMonthlyBudget = plan.selectedLoans.reduce(
    (sum, loan) => sum + loan.monthlyPayment,
    0
  );

  // Initialiser les soldes
  const loanBalances = initializeLoanBalances(plan.selectedLoans, minStartDate);

  // Pré-calculer les soldes jusqu'au mois courant
  precalculateBalances(loanBalances, startOptimizationMonth);

  // Générer le tableau d'amortissement optimisé
  for (let month = startOptimizationMonth; month <= totalMonths; month++) {
    const currentDate = addMonths(minStartDate, month);
    
    const activeLoans = loanBalances.filter(
      lb => month > lb.startMonth && lb.remaining > 0.01
    );

    if (activeLoans.length === 0) {
      break;
    }

    const payments = distributeAvalancheBudget(activeLoans, totalMonthlyBudget);

    const loansData: LoanData[] = [];
    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalRemaining = 0;

    payments.forEach((payment, lb) => {
      totalPrincipal += payment.principal;
      totalInterest += payment.interest;
      totalRemaining += lb.remaining;

      loansData.push({
        name: lb.loan.name,
        monthlyPayment: payment.interest + payment.principal,
        principal: payment.principal,
        interest: payment.interest,
        remaining: lb.remaining
      });
    });

    optimizedTable.push({
      month,
      date: currentDate,
      loansData,
      totalMonthlyPayment: totalMonthlyBudget,
      totalPrincipal,
      totalInterest,
      totalRemaining,
      remainingBalance: 0,
      loanDetails: []
    });
  }

  // Calculer les économies
  const standardTable = calculatePlanAmortization(plan);
  const originalInterest = standardTable.reduce((sum, row) => sum + row.totalInterest, 0);
  const optimizedInterest = optimizedTable.reduce((sum, row) => sum + row.totalInterest, 0);
  const savings = originalInterest - optimizedInterest;

  return { table: optimizedTable, savings };
}
