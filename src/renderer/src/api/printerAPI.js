// ─── Printer API (Renderer) ───
// Wrapper für die Printer-Funktionen, die über den Preload-Script bereitgestellt werden.

export const printerApi = {
  /**
   * Gibt eine Liste aller verfügbaren Drucker zurück.
   * @returns {Promise<string[]>}
   */
  async getAvailablePrinters() {
    return await window.api.printer.getAvailable()
  },

  /**
   * Gibt den aktuell ausgewählten Druckernamen zurück.
   * @returns {Promise<string>}
   */
  async getCurrentPrinter() {
    return await window.api.printer.getCurrent()
  },

  /**
   * Setzt den zu verwendenden Drucker.
   * @param {string} printerName
   * @returns {Promise<{success: boolean, printer: string}>}
   */
  async setPrinter(printerName) {
    return await window.api.printer.set(printerName)
  },

  /**
   * Druckt einen Kassenbon.
   * @param {object} receiptData
   * @param {string} receiptData.storeName - Name des Geschäfts
   * @param {Array<{name: string, price: number, quantity?: number}>} receiptData.items - Artikel
   * @param {number} receiptData.total - Gesamtsumme
   * @param {string} [receiptData.paymentMethod] - Zahlungsmethode
   * @param {string} [receiptData.footer] - Fußzeile
   * @returns {Promise<{success: boolean, printer: string}>}
   */
  async printReceipt(receiptData) {
    return await window.api.printer.printReceipt(receiptData)
  },

  /**
   * Druckt einen Test-Bon.
   * @returns {Promise<{success: boolean, printer: string}>}
   */
  async printTestReceipt() {
    return await window.api.printer.printTest()
  }
}
