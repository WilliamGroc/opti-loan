/**
 * Service pour l'export des plans de financement
 */

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FinancingPlan, AmortizationRow } from './types';

/**
 * Exporte un plan de financement en format CSV
 */
export function exportPlanAsCSV(plan: FinancingPlan, amortizationData: AmortizationRow[]): void {
  let csv = `Plan de Financement: ${plan.name}\n`;
  csv += `Créé le: ${format(new Date(plan.createdDate), 'dd/MM/yyyy HH:mm', { locale: fr })}\n`;
  csv += `\nPrêts inclus:\n`;

  plan.selectedLoans.forEach(loan => {
    csv += `- ${loan.name}: ${loan.amount.toLocaleString('fr-FR')} € (${loan.durationYears} ans, ${loan.annualRate}%)\n`;
  });

  csv += `\nMois,Date,Mensualité Totale,Capital Total,Intérêts Totaux,Restant Dû\n`;

  amortizationData.forEach(row => {
    csv += `${row.month},${format(row.date, 'MMM yyyy', { locale: fr })},${row.totalMonthlyPayment.toFixed(2)},${row.totalPrincipal.toFixed(2)},${row.totalInterest.toFixed(2)},${row.totalRemaining.toFixed(2)}\n`;
  });

  const dataBlob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `plan-${plan.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Exporte un plan de financement en format JSON
 */
export function exportPlanAsJSON(plan: FinancingPlan, amortizationData: AmortizationRow[]): void {
  const exportData = {
    plan,
    amortization: amortizationData,
    exportDate: new Date().toISOString()
  };

  const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `plan-${plan.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Génère un résumé textuel du plan de financement
 */
export function generatePlanSummary(plan: FinancingPlan, amortizationData: AmortizationRow[]): string {
  let summary = `=== RÉSUMÉ DU PLAN DE FINANCEMENT ===\n\n`;
  summary += `Nom: ${plan.name}\n`;
  summary += `Créé le: ${format(new Date(plan.createdDate), 'dd/MM/yyyy HH:mm', { locale: fr })}\n\n`;

  summary += `--- PRÊTS INCLUS ---\n`;
  plan.selectedLoans.forEach((loan, index) => {
    summary += `${index + 1}. ${loan.name}\n`;
    summary += `   Montant: ${loan.amount.toLocaleString('fr-FR')} €\n`;
    summary += `   Taux: ${loan.annualRate}%\n`;
    summary += `   Durée: ${loan.durationYears} ans\n`;
    summary += `   Mensualité: ${loan.monthlyPayment.toFixed(2)} €\n`;
    summary += `   Date de départ: ${format(new Date(loan.startDate), 'dd/MM/yyyy', { locale: fr })}\n\n`;
  });

  if (amortizationData.length > 0) {
    const lastRow = amortizationData[amortizationData.length - 1];
    const totalInterest = amortizationData.reduce((sum, row) => sum + row.totalInterest, 0);
    const totalPrincipal = amortizationData.reduce((sum, row) => sum + row.totalPrincipal, 0);

    summary += `--- RÉSUMÉ FINANCIER ---\n`;
    summary += `Montant total emprunté: ${totalPrincipal.toLocaleString('fr-FR')} €\n`;
    summary += `Intérêts totaux: ${totalInterest.toLocaleString('fr-FR')} €\n`;
    summary += `Montant total remboursé: ${(totalPrincipal + totalInterest).toLocaleString('fr-FR')} €\n`;
    summary += `Durée du plan: ${Math.ceil(lastRow.month / 12)} ans (${lastRow.month} mois)\n`;
  }

  return summary;
}

/**
 * Copie le résumé dans le presse-papiers
 */
export async function copyPlanSummaryToClipboard(plan: FinancingPlan, amortizationData: AmortizationRow[]): Promise<void> {
  const summary = generatePlanSummary(plan, amortizationData);
  try {
    await navigator.clipboard.writeText(summary);
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    throw err;
  }
}
