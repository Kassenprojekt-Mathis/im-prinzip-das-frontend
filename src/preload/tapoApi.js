import { ipcRenderer } from 'electron'

export const tapoApi = {
  /** Blinkt grün (bei erfolgreichem Scan) */
  flashGreen: () => ipcRenderer.invoke('tapo:flashGreen'),
  /** Blinkt rot (bei Scan-Fehler) */
  flashRed: () => ipcRenderer.invoke('tapo:flashRed'),
  /** Setzt eine Farbe */
  setColor: (colour) => ipcRenderer.invoke('tapo:setColor', colour),
  setHSL: (hue, saturation, luminance) =>
    ipcRenderer.invoke('tapo:setHSL', hue, saturation, luminance),
  /** Schaltet die Lampe ein/ aus */
  turnOn: () => ipcRenderer.invoke('tapo:turnOn'),
  turnOff: () => ipcRenderer.invoke('tapo:turnOff'),
  /** Gibt den aktuellen Status der Lampe zurück */
  getStatus: () => ipcRenderer.invoke('tapo:getStatus')
}
