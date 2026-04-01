// Das Model – Kategorie API

const API_BASE_URL = 'http://localhost:8000'

export const kategorieApi = {
  async getAlleKategorien() {
    const response = await fetch(`${API_BASE_URL}/api/kategorie/`)
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Kategorien')
    }
    return await response.json()
  }
}
