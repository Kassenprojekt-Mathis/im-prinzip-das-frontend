// ─── Scanner API (Model) ───
// Ruft das Produkt anhand der Barcode-Nummer (= Produkt-ID) vom Backend ab.

const API_BASE_URL = 'http://localhost:8000'

export const scannerApi = {
  /**
   * Sucht ein Produkt anhand des gescannten Barcodes (= Produkt-ID im Backend).
   * @param {string} barcode – Der gescannte Barcode-String
   * @returns {Promise<object>} – Produkt-Daten vom Backend
   */
  async sendBarcode(barcode) {
    const response = await fetch(`${API_BASE_URL}/api/produkt/${barcode}`)

    if (!response.ok) {
      throw new Error(`Produkt mit Barcode ${barcode} nicht gefunden (${response.status})`)
    }

    return await response.json()
  }
}
