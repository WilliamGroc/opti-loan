export type PropertyType = 'new' | 'old';

export interface EstimationInputs {
  propertyValue: number;
  downPayment: number;
  propertyType: PropertyType;
  notaryFeesPercentNew: number;
  notaryFeesPercentOld: number;
  fileFeePercent: number;
  insurancePercent: number;
  guaranteePercent: number;
  loanRate: number;
  loanDuration: number;
  monthlySalary: number;
  otherIncome: number;
  otherLoans: number;
}

export interface EstimationResult {
  propertyValue: number;
  downPayment: number;
  loanAmount: number;
  notaryFees: number;
  fileFees: number;
  insuranceYearly: number;
  guarantee: number;
  totalInitialCost: number;
  totalToFinance: number;
  totalProjectCost: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCostWithInterest: number;
  insuranceTotal: number;
  totalMonthlyIncome: number;
  debtRatio: number;
  maxMonthlyPayment: number;
  maxLoanCapacity: number;
  maxPropertyValue: number;
}

export interface SavedProject extends EstimationInputs {
  id: string;
  name: string;
  saveDate: string;
}
