/**
 * Types et interfaces pour la gestion des plans de financement
 */

export interface MonthlyPaymentPeriod {
  id: string;
  startMonth: number;
  endMonth: number;
  monthlyPayment: number;
}

export interface SavedLoan {
  id: string;
  name: string;
  amount: number;
  annualRate: number;
  durationYears: number;
  monthlyPayment: number;
  startDate: string;
  calculationMode: 'payment' | 'duration' | 'variable';
  saveDate: string;
  paymentPeriods?: MonthlyPaymentPeriod[];
}

export interface FinancingPlan {
  name: string;
  selectedLoans: SavedLoan[];
  createdDate: string;
}

export interface LoanData {
  name: string;
  monthlyPayment: number;
  principal: number;
  interest: number;
  remaining: number;
}

export interface AmortizationRow {
  month: number;
  date: Date;
  loansData: LoanData[];
  totalMonthlyPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalRemaining: number;
}

export interface LoanBalance {
  loan: SavedLoan;
  remaining: number;
  startMonth: number;
  endMonth: number;
}
