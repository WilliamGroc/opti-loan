/**
 * Service centralisé pour la gestion du localStorage
 */

const STORAGE_KEYS = {
  LOANS: 'opti-loan-prets',
  PLANS: 'opti-loan-plans'
} as const;

/**
 * Type générique pour la gestion du storage
 */
type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Charge des données depuis le localStorage
 */
export function loadFromStorage<T>(key: StorageKey): T[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const data = localStorage.getItem(STORAGE_KEYS[key]);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(`Erreur lors du chargement de ${key}:`, e);
      return [];
    }
  }
  return [];
}

/**
 * Sauvegarde des données dans le localStorage
 */
export function saveToStorage<T>(key: StorageKey, data: T[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  }
}

/**
 * Supprime des données du localStorage
 */
export function clearStorage(key: StorageKey): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS[key]);
  }
}

/**
 * Exporte des données au format JSON
 */
export function exportAsJSON(data: unknown, filename: string): void {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  downloadBlob(dataBlob, filename);
}

/**
 * Exporte des données au format CSV
 */
export function exportAsCSV(content: string, filename: string): void {
  const dataBlob = new Blob([content], { type: 'text/csv' });
  downloadBlob(dataBlob, filename);
}

/**
 * Télécharge un blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
