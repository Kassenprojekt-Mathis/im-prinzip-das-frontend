import { ipcRenderer } from 'electron'

export const tapoApi = {
  /** Blinkt grün (bei erfolgreichem Scan) */
  flashGreen: () => ipcRenderer.invoke('tapo:flashGreen'),
  /** Blinkt rot (bei Scan-Fehler) */
  flashRed: () => ipcRenderer.invoke('tapo:flashRed'),
  /** Setzt die Lampe auf Blau (Kunde wartet auf Mitarbeiter) */
  setBlue: () => ipcRenderer.invoke('tapo:setBlue'),
  /** Setzt die Lampe auf Weiß (Normalbetrieb / Mitarbeiter angemeldet) */
  setWhite: (brightness) => ipcRenderer.invoke('tapo:setWhite', brightness),
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
