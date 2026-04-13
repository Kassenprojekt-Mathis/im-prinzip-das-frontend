import { ipcRenderer } from 'electron'

export const printerApi = {
  /** Gibt eine Liste aller verfügbaren Drucker zurück */
  getAvailable: () => ipcRenderer.invoke('printer:getAvailable'),
  /** Gibt den aktuellen Druckernamen zurück */
  getCurrent: () => ipcRenderer.invoke('printer:getCurrent'),

  set: (printerName) => ipcRenderer.invoke('printer:set', printerName),
  printReceipt: (receiptData) => ipcRenderer.invoke('printer:printReceipt', receiptData),
  printTest: () => ipcRenderer.invoke('printer:printTest')
}
