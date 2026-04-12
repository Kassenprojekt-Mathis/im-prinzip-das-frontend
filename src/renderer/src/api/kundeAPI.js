// Kunde API - Kundenkarten und Ecopunkte

const API_BASE_URL = 'http://localhost:8000'

export const kundeApi = {
  // Einzelnen Kunden abrufen (zur Validierung der Kundenkarte)
  async getKundeById(id) {
    const response = await fetch(`${API_BASE_URL}/api/kunde/${id}`)
    if (!response.ok) {
      throw new Error('Kunde nicht gefunden')
    }
    return await response.json()
  },

  // Ecopunkte eines Kunden abrufen
  async getEcopunkte(id) {
    const response = await fetch(`${API_BASE_URL}/api/kunde/${id}/ecopunkte`)
    if (!response.ok) {
      throw new Error('Ecopunkte konnten nicht geladen werden')
    }
    return await response.json()
  }
}
