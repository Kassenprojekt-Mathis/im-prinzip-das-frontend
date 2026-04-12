// ─── Scanner API (Model) ───
// Sendet gescannte Barcodes ans Backend und gibt Produktdaten zurück.
// Der Barcode entspricht der Produkt-ID in der Datenbank.

const API_BASE_URL = 'http://localhost:8000'

export const scannerApi = {
  /**
   * Sendet einen gescannten Barcode ans Backend.
   * Der Barcode wird als Produkt-ID interpretiert (BigInteger in der DB).
   * @param {string} barcode – Der gescannte Barcode-String (= Produkt-ID)
   * @returns {Promise<object>} – Produkt-Daten vom Backend (gemappt auf Frontend-Format)
   */
  async sendBarcode(barcode) {
    const produktId = parseInt(barcode, 10)

    if (isNaN(produktId)) {
      throw new Error(`Ungültiger Barcode: "${barcode}" ist keine gültige Produkt-ID`)
    }

    const response = await fetch(`${API_BASE_URL}/api/produkt/${produktId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Produkt mit ID ${produktId} nicht gefunden`)
      }
      throw new Error(`Fehler beim Abrufen des Produkts: ${response.status}`)
    }

    const produkt = await response.json()

    // Backend-Format (preis, rabatt, ...) auf Frontend-Format (price, discount, ...) mappen
    return {
      id: produkt.id,
      name: produkt.name,
      price: produkt.preis,
      mwstSatz: produkt.mwst_satz,
      lagerbestand: produkt.lagerbestand,
      bild: produkt.bild,
      mindestalter: produkt.mindestalter,
      kategorieId: produkt.kategorie_id,
      discount:
        produkt.rabatt > 0
          ? { amount: produkt.preis * (produkt.rabatt / 100), label: `${produkt.rabatt}% Rabatt` }
          : null
    }
  }
}
