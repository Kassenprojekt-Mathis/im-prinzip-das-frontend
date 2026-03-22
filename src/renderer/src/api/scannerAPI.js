// ─── Scanner API (Model) ───
// Platzhalter – Endpoint und Methode anpassen, sobald das Backend steht.

const API_BASE_URL = 'http://localhost:8000'

export const scannerApi = {
  /**
   * Sendet einen gescannten Barcode ans Backend.
   * @param {string} barcode – Der gescannte Barcode-String
   * @returns {Promise<object>} – Produkt-Daten vom Backend
   */
  async sendBarcode(barcode) {
    // TODO: Endpoint und Methode an das echte Backend anpassen
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode })
    })

    if (!response.ok) {
      throw new Error(`Fehler beim Senden des Barcodes: ${response.status}`)
    }

    return await response.json()
  }
}
