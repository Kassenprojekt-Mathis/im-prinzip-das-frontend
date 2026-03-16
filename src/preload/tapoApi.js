import { ipcRenderer } from 'electron'

// ── Tapo Lightbulb API ──
export const tapoApi = {
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
