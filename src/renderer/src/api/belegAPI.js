// Beleg API - POST /api/beleg/

const API_BASE_URL = 'http://localhost:8000'

export const belegApi = {
  /**
   * Beleg erstellen (Kassiervorgang abschließen)
   * @param {Object} data
   * @param {Array<{produkt_id: number, menge: number}>} data.produkte
   * @param {number} data.gegebenes_geld
   * @param {string} data.zahlungsmethode - "bar" oder "karte"
   * @param {boolean} [data.alterskontrolle_bestaetigt] - true wenn Alterskontrolle bestätigt
   * @param {number} [data.kunde_id] - Kunden-ID (optional)
   * @param {string} [data.gutschein_code] - Gutschein-Code (optional)
   * @returns {Promise<Object>} Erstellter Beleg
   */
  async createBeleg(data) {
    const response = await fetch(`${API_BASE_URL}/api/beleg/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    if (!response.ok) {
      const error = new Error(result.error || 'Fehler beim Erstellen des Belegs')
      error.status = response.status
      throw error
    }
    return result
  }
}
