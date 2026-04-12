const API_BASE_URL = 'http://localhost:8000'

export const receiptApi = {
  async createReceipt({ kundeId, gesamtbetrag, zahlungsmethode }) {
    const body = {
      gesamtbetrag,
      gegebenes_geld: gesamtbetrag,
      zahlungsmethode,
      ...(kundeId ? { kunde_id: kundeId } : {})
    }
    const response = await fetch(`${API_BASE_URL}/api/beleg/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || 'Fehler beim Erstellen des Belegs')
    }
    return result
  }
}
