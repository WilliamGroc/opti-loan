import type { EstimationInputs, EstimationResult } from './types';

/**
 * Calcule tous les frais et la capacité d'emprunt d'un projet immobilier
 */
export function calculateEstimation(inputs: EstimationInputs): EstimationResult {
  const {
    propertyValue,
    downPayment,
    propertyType,
    notaryFeesPercentNew,
    notaryFeesPercentOld,
    fileFeePercent,
    insurancePercent,
    guaranteePercent,
    loanRate,
    loanDuration,
    monthlySalary,
    otherIncome,
    otherLoans
  } = inputs;

  // Calcul du montant du prêt
  const loanAmount = Math.max(0, propertyValue - downPayment);

  // Calcul des frais de notaire
  const notaryPercent = propertyType === 'new' ? notaryFeesPercentNew : notaryFeesPercentOld;
  const notaryFees = (propertyValue * notaryPercent) / 100;

  // Calcul des frais de dossier (sur le montant du prêt)
  const fileFees = (loanAmount * fileFeePercent) / 100;

  // Calcul de l'assurance annuelle (sur le montant du prêt)
  const insuranceYearly = (loanAmount * insurancePercent) / 100;

  // Calcul de la garantie (sur le montant du prêt)
  const guarantee = (loanAmount * guaranteePercent) / 100;

  // Coût total initial (frais de notaire + frais de dossier + garantie)
  const totalInitialCost = notaryFees + fileFees + guarantee;

  // Montant total à financer (incluant les frais dans le prêt)
  const totalToFinance = loanAmount + fileFees + guarantee;

  // Calcul de la mensualité
  const monthlyRate = loanRate / 100 / 12;
  const totalMonths = loanDuration * 12;
  let monthlyPayment = 0;
  let totalInterest = 0;

  if (totalToFinance > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = totalToFinance / totalMonths;
      totalInterest = 0;
    } else {
      monthlyPayment =
        (totalToFinance * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
      totalInterest = monthlyPayment * totalMonths - totalToFinance;
    }
  }

  // Coût total de l'assurance sur la durée
  const insuranceTotal = insuranceYearly * loanDuration;

  // Coût total du projet avec intérêts
  const totalCostWithInterest = propertyValue + totalInitialCost + totalInterest + insuranceTotal;

  // Coût total du projet (sans intérêts)
  const totalProjectCost = propertyValue + totalInitialCost;

  // Calcul de la capacité d'emprunt et du taux d'endettement
  const totalMonthlyIncome = monthlySalary + otherIncome;
  const maxMonthlyPayment =
    totalMonthlyIncome > 0 ? (totalMonthlyIncome * 33) / 100 - otherLoans : 0;
  const debtRatio =
    totalMonthlyIncome > 0 ? ((monthlyPayment + otherLoans) / totalMonthlyIncome) * 100 : 0;

  // Calcul de la capacité d'emprunt maximale basée sur la mensualité max
  let maxLoanCapacity = 0;
  let maxPropertyValue = 0;

  if (maxMonthlyPayment > 0 && loanRate > 0) {
    const monthlyRate = loanRate / 100 / 12;
    const totalMonths = loanDuration * 12;

    // Capacité d'emprunt = capital qu'on peut emprunter avec la mensualité max
    if (monthlyRate === 0) {
      maxLoanCapacity = maxMonthlyPayment * totalMonths;
    } else {
      maxLoanCapacity =
        (maxMonthlyPayment * (Math.pow(1 + monthlyRate, totalMonths) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
    }

    // Calcul du prix maximum du bien en tenant compte de tous les frais
    const notaryPercent = propertyType === 'new' ? notaryFeesPercentNew : notaryFeesPercentOld;

    // Approximation par itération
    let estimatedPrice = maxLoanCapacity + downPayment;
    for (let i = 0; i < 10; i++) {
      const estimatedNotaryFees = (estimatedPrice * notaryPercent) / 100;
      const estimatedLoanAmount = estimatedPrice - downPayment;
      const estimatedFileFees = (estimatedLoanAmount * fileFeePercent) / 100;
      const estimatedGuarantee = (estimatedLoanAmount * guaranteePercent) / 100;
      const estimatedTotalFees = estimatedNotaryFees + estimatedFileFees + estimatedGuarantee;
      const estimatedTotalToFinance = estimatedPrice + estimatedTotalFees - downPayment;

      if (estimatedTotalToFinance > maxLoanCapacity) {
        estimatedPrice = estimatedPrice * (maxLoanCapacity / estimatedTotalToFinance);
      } else {
        break;
      }
    }
    maxPropertyValue = Math.floor(estimatedPrice);
  }

  return {
    propertyValue,
    downPayment,
    loanAmount,
    notaryFees,
    fileFees,
    insuranceYearly,
    guarantee,
    totalInitialCost,
    totalToFinance,
    totalProjectCost,
    monthlyPayment,
    totalInterest,
    totalCostWithInterest,
    insuranceTotal,
    totalMonthlyIncome,
    debtRatio,
    maxMonthlyPayment,
    maxLoanCapacity,
    maxPropertyValue
  };
}
