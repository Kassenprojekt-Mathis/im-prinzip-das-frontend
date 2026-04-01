// Das Model – Produkt API

const API_BASE_URL = 'http://localhost:8000'

export const produktApi = {
  async getAlleProdukte() {
    const response = await fetch(`${API_BASE_URL}/api/produkt/`)
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Produkte')
    }
    return await response.json()
  },

  async getProdukt(produktId) {
    const response = await fetch(`${API_BASE_URL}/api/produkt/${produktId}`)
    if (!response.ok) {
      if (response.status === 404) throw new Error('Produkt nicht gefunden')
      throw new Error('Fehler beim Laden des Produkts')
    }
    return await response.json()
  },

  async updateProdukt(produktId, daten) {
    const response = await fetch(`${API_BASE_URL}/api/produkt/${produktId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(daten)
    })
    if (!response.ok) {
      if (response.status === 404) throw new Error('Produkt nicht gefunden')
      throw new Error('Fehler beim Aktualisieren des Produkts')
    }
    return await response.json()
  },

  async getProdukteNachKategorie(kategorieId) {
    const response = await fetch(`${API_BASE_URL}/api/produkt/kategorie/${kategorieId}`)
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Produkte nach Kategorie')
    }
    return await response.json()
  }
}
