// Category API - Model für Kategorieverwaltung

const API_BASE_URL = 'http://localhost:8000'

export const categoryApi = {
  // Alle Kategorien abrufen
  async getAllCategories() {
    const response = await fetch(`${API_BASE_URL}/api/kategorie/`)
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Kategorien')
    }
    return await response.json()
  },

  // Eine Kategorie anhand der ID abrufen
  async getCategoryById(id) {
    const response = await fetch(`${API_BASE_URL}/api/kategorie/${id}`)
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Kategorie')
    }
    return await response.json()
  }
}
