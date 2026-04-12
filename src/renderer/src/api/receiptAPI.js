const API_BASE_URL = 'http://localhost:8000'

export const receiptApi = {
  /**
   * Erstellt einen Beleg (Kassiervorgang abschließen).
   * @param {Object} params
   * @param {Array<{produkt_id: number, menge: number}>} params.produkte
   * @param {number} params.gegebenesgeld
   * @param {string} params.zahlungsmethode - "bar" oder "karte"
   * @param {number|null} [params.kundeId] - Kunden-ID (optional)
   * @param {boolean} [params.alterskontrolleBestaetigt] - true wenn Alterskontrolle bestätigt
   * @param {string} [params.gutscheinCode] - Gutschein-Code (optional)
   * @returns {Promise<Object>} Erstellter Beleg
   */
  async createReceipt({
    produkte,
    gegebenesgeld,
    zahlungsmethode,
    kundeId,
    alterskontrolleBestaetigt,
    gutscheinCode
  }) {
    const body = {
      produkte,
      gegebenes_geld: gegebenesgeld,
      zahlungsmethode,
      ...(kundeId ? { kunde_id: kundeId } : {}),
      ...(alterskontrolleBestaetigt !== undefined
        ? { alterskontrolle_bestaetigt: alterskontrolleBestaetigt }
        : {}),
      ...(gutscheinCode ? { gutschein_code: gutscheinCode } : {})
    }

    const response = await fetch(`${API_BASE_URL}/api/beleg/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
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
