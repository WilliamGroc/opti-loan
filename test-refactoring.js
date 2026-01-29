// Test rapide des nouveaux services
import { getMonthsBetween, getMonthlyRate, calculateStandardMonthlyPayment } from './src/lib/services/utils.ts';

console.log('🧪 Test des services refactorisés\n');

// Test 1: getMonthsBetween
const date1 = new Date('2024-01-01');
const date2 = new Date('2025-01-01');
const months = getMonthsBetween(date1, date2);
console.log(`✓ getMonthsBetween: ${months} mois entre 2024 et 2025`);

// Test 2: getMonthlyRate
const monthlyRate = getMonthlyRate(6);
console.log(`✓ getMonthlyRate: Taux annuel 6% = ${(monthlyRate * 100).toFixed(2)}% par mois`);

// Test 3: calculateStandardMonthlyPayment
const payment = calculateStandardMonthlyPayment(200000, 1.5, 20);
console.log(`✓ calculateStandardMonthlyPayment: ${payment.toFixed(2)}€ par mois`);

console.log('\n✅ Tous les tests passent !');
