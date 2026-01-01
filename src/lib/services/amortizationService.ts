/**
 * Service pour les calculs d'amortissement et d'optimisation de plans de financement
 */

import { addMonths } from 'date-fns';
import type { FinancingPlan, AmortizationRow, LoanBalance } from './types';

/**
 * Calcule le tableau d'amortissement standard pour un plan de financement
 */
export function calculatePlanAmortization(plan: FinancingPlan): AmortizationRow[] {
  const amortizationTable: AmortizationRow[] = [];

  // Trouver la date de début la plus ancienne et la fin la plus récente
  let minStartDate = new Date(plan.selectedLoans[0].startDate);
  let maxEndDate = new Date(plan.selectedLoans[0].startDate);

  plan.selectedLoans.forEach(loan => {
    const start = new Date(loan.startDate);
    const end = addMonths(start, loan.durationYears * 12);
    if (start < minStartDate) minStartDate = start;
    if (end > maxEndDate) maxEndDate = end;
  });

  // Calculer le nombre de mois entre min et max
  const totalMonths = Math.ceil((maxEndDate.getTime() - minStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

  // Créer le tableau d'amortissement
  for (let month = 1; month <= totalMonths; month++) {
    const currentDate = addMonths(minStartDate, month);
    let totalMonthlyPayment = 0;
    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalRemaining = 0;
    const loansData: Array<{ name: string, monthlyPayment: number, principal: number, interest: number, remaining: number }> = [];

    plan.selectedLoans.forEach(loan => {
      const loanStartDate = new Date(loan.startDate);
      const loanStartMonth = Math.round((loanStartDate.getTime() - minStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      const monthInLoan = month - loanStartMonth;

      if (monthInLoan > 0 && monthInLoan <= loan.durationYears * 12) {
        const monthlyRate = loan.annualRate / 100 / 12;

        // Calculer le solde restant à ce mois
        let remaining = loan.amount;

        // Calculer l'amortissement pour chaque mois jusqu'au mois courant
        for (let m = 1; m < monthInLoan; m++) {
          let paymentForMonth = loan.monthlyPayment;
          if (loan.calculationMode === 'variable' && loan.paymentPeriods) {
            const period = loan.paymentPeriods.find(p => m >= p.startMonth && m <= p.endMonth);
            paymentForMonth = period ? period.monthlyPayment : loan.monthlyPayment;
          }

          const monthInterest = remaining * monthlyRate;
          const monthPrincipal = paymentForMonth - monthInterest;
          remaining -= monthPrincipal;
        }

        // Calculer maintenant le mois courant
        let currentMonthPayment = loan.monthlyPayment;
        if (loan.calculationMode === 'variable' && loan.paymentPeriods) {
          const period = loan.paymentPeriods.find(p => monthInLoan >= p.startMonth && monthInLoan <= p.endMonth);
          currentMonthPayment = period ? period.monthlyPayment : loan.monthlyPayment;
        }

        const interest = remaining * monthlyRate;
        const principal = currentMonthPayment - interest;
        remaining -= principal;

        if (remaining < 0) remaining = 0;

        totalMonthlyPayment += currentMonthPayment;
        totalPrincipal += principal;
        totalInterest += interest;
        totalRemaining += remaining;

        loansData.push({
          name: loan.name,
          monthlyPayment: currentMonthPayment,
          principal: principal,
          interest: interest,
          remaining: remaining
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
        totalRemaining
      });
    }
  }

  return amortizationTable;
}

/**
 * Optimise un plan de financement en utilisant la méthode avalanche
 * Les intérêts totaux payés sont minimisés en prioritarisant les prêts à taux élevé
 */
export function optimizePlan(plan: FinancingPlan): {
  table: AmortizationRow[];
  savings: number;
} {
  const optimizedTable: AmortizationRow[] = [];

  // Trouver la date de début la plus ancienne et la fin la plus récente
  let minStartDate = new Date(plan.selectedLoans[0].startDate);
  let maxEndDate = new Date(plan.selectedLoans[0].startDate);

  plan.selectedLoans.forEach(loan => {
    const start = new Date(loan.startDate);
    const end = addMonths(start, loan.durationYears * 12);
    if (start < minStartDate) minStartDate = start;
    if (end > maxEndDate) maxEndDate = end;
  });

  const totalMonths = Math.ceil((maxEndDate.getTime() - minStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

  // Calculer le mois courant (l'optimisation commence à partir d'aujourd'hui)
  const today = new Date();
  const currentMonth = Math.ceil((today.getTime() - minStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  const startOptimizationMonth = Math.max(1, currentMonth);

  // Calculer la mensualité totale disponible
  const totalMonthlyBudget = plan.selectedLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);

  // Initialiser les soldes des prêts
  const loanBalances: LoanBalance[] = plan.selectedLoans.map(loan => {
    const start = new Date(loan.startDate);
    const startMonth = Math.round((start.getTime() - minStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return {
      loan,
      remaining: loan.amount,
      startMonth,
      endMonth: startMonth + loan.durationYears * 12
    };
  });

  // Pré-calculer les soldes des prêts jusqu'au mois courant
  for (let month = 1; month < startOptimizationMonth; month++) {
    loanBalances.forEach(lb => {
      if (month > lb.startMonth && month <= lb.endMonth) {
        const monthlyRate = lb.loan.annualRate / 100 / 12;
        let paymentForMonth = lb.loan.monthlyPayment;
        if (lb.loan.calculationMode === 'variable' && lb.loan.paymentPeriods) {
          const period = lb.loan.paymentPeriods.find(p => month >= p.startMonth && month <= p.endMonth);
          paymentForMonth = period ? period.monthlyPayment : lb.loan.monthlyPayment;
        }
        const interest = lb.remaining * monthlyRate;
        const principal = paymentForMonth - interest;
        lb.remaining -= principal;
        if (lb.remaining < 0) lb.remaining = 0;
      }
    });
  }

  // Créer le tableau d'amortissement optimisé à partir du mois courant
  for (let month = startOptimizationMonth; month <= totalMonths; month++) {
    const currentDate = addMonths(minStartDate, month);
    let budgetRemaining = totalMonthlyBudget;
    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalRemaining = 0;
    const loansData: Array<{ name: string, monthlyPayment: number, principal: number, interest: number, remaining: number }> = [];

    // Obtenir les prêts actifs pour ce mois
    const activeLoans = loanBalances.filter(
      lb => month > lb.startMonth && lb.remaining > 0.01
    );

    if (activeLoans.length === 0) {
      continue;
    }

    // Étape 1: Calculer et payer tous les intérêts
    const loanPayments = activeLoans.map(lb => {
      const monthlyRate = lb.loan.annualRate / 100 / 12;
      const interest = lb.remaining * monthlyRate;
      budgetRemaining -= interest;

      return {
        loanBalance: lb,
        interest,
        principal: 0
      };
    });

    // Étape 2: Trier les prêts par taux d'intérêt (décroissant)
    const sortedPayments = [...loanPayments].sort(
      (a, b) => b.loanBalance.loan.annualRate - a.loanBalance.loan.annualRate
    );

    // Étape 3: Distribuer le budget restant pour rembourser le capital
    // en priorité sur les prêts avec les taux les plus élevés (méthode avalanche)
    for (const payment of sortedPayments) {
      if (budgetRemaining <= 0) break;

      // Montant maximum qu'on peut rembourser sur ce prêt
      const maxPrincipal = Math.min(budgetRemaining, payment.loanBalance.remaining);
      payment.principal = maxPrincipal;
      budgetRemaining -= maxPrincipal;

      // Mettre à jour le capital restant
      payment.loanBalance.remaining -= maxPrincipal;

      if (payment.loanBalance.remaining < 0.01) {
        payment.loanBalance.remaining = 0;
      }
    }

    // Étape 4: Enregistrer les données pour l'affichage
    loanPayments.forEach(payment => {
      totalPrincipal += payment.principal;
      totalInterest += payment.interest;
      totalRemaining += payment.loanBalance.remaining;

      loansData.push({
        name: payment.loanBalance.loan.name,
        monthlyPayment: payment.interest + payment.principal,
        principal: payment.principal,
        interest: payment.interest,
        remaining: payment.loanBalance.remaining
      });
    });

    optimizedTable.push({
      month,
      date: currentDate,
      loansData,
      totalMonthlyPayment: totalMonthlyBudget,
      totalPrincipal,
      totalInterest,
      totalRemaining
    });
  }

  // Calculer les économies
  const standardTable = calculatePlanAmortization(plan);
  const originalInterest = standardTable.reduce((sum, row) => sum + row.totalInterest, 0);
  const optimizedInterest = optimizedTable.reduce((sum, row) => sum + row.totalInterest, 0);
  const savings = originalInterest - optimizedInterest;

  return {
    table: optimizedTable,
    savings
  };
}
