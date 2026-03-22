import { ipcRenderer } from 'electron'

// ── Printer API ──
export const printerApi = {
  /** Gibt eine Liste aller verfügbaren Drucker zurück */
  getAvailable: () => ipcRenderer.invoke('printer:getAvailable'),
  /** Gibt den aktuellen Druckernamen zurück */
  getCurrent: () => ipcRenderer.invoke('printer:getCurrent'),
  /** Setzt den zu verwendenden Drucker */
  set: (printerName) => ipcRenderer.invoke('printer:set', printerName),
  /** Druckt einen Kassenbon mit den gegebenen Daten */
  printReceipt: (receiptData) => ipcRenderer.invoke('printer:printReceipt', receiptData),
  /** Druckt einen Test-Bon */
  printTest: () => ipcRenderer.invoke('printer:printTest')
}
