import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // ── Printer API ──
  printer: {
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
  },

  // ── Tapo Lightbulb API ──
  tapo: {
    /** Blinkt grün (bei erfolgreichem Scan) */
    flashGreen: () => ipcRenderer.invoke('tapo:flashGreen'),
    /** Blinkt rot (bei Scan-Fehler) */
    flashRed: () => ipcRenderer.invoke('tapo:flashRed'),
    /** Setzt eine Farbe */
    setColor: (colour) => ipcRenderer.invoke('tapo:setColor', colour),
    /** Setzt eine HSL-Farbe */
    setHSL: (hue, saturation, luminance) =>
      ipcRenderer.invoke('tapo:setHSL', hue, saturation, luminance),
    /** Schaltet die Lampe ein */
    turnOn: () => ipcRenderer.invoke('tapo:turnOn'),
    /** Schaltet die Lampe aus */
    turnOff: () => ipcRenderer.invoke('tapo:turnOff'),
    /** Gibt den aktuellen Status der Lampe zurück */
    getStatus: () => ipcRenderer.invoke('tapo:getStatus')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
