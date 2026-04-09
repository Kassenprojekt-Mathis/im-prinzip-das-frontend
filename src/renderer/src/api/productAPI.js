// Product API - Model für Produktverwaltung

const API_BASE_URL = 'http://localhost:8000'

export const productApi = {
  // Alle Produkte abrufen
  async getAllProducts() {
    const response = await fetch(`${API_BASE_URL}/api/produkt/`)
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Produkte')
    }
    return await response.json()
  },

  // Ein Produkt anhand der ID abrufen
  async getProductById(id) {
    const response = await fetch(`${API_BASE_URL}/api/produkt/${id}`)
    if (!response.ok) {
      throw new Error('Fehler beim Laden des Produkts')
    }
    return await response.json()
  },

  // Neues Produkt erstellen (Barcode oder manuell)
  async createProduct(data) {
    const response = await fetch(`${API_BASE_URL}/api/produkt/erstellen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || 'Fehler beim Erstellen des Produkts')
    }
    return result
  },

  // Produkt aktualisieren
  async updateProduct(id, data) {
    const response = await fetch(`${API_BASE_URL}/api/produkt/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || 'Fehler beim Aktualisieren des Produkts')
    }
    return result
  },

  // Produkt löschen
  async deleteProduct(id) {
    const response = await fetch(`${API_BASE_URL}/api/produkt/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || 'Fehler beim Löschen des Produkts')
    }
    return true
  },

  // Produkt aktiv/inaktiv schalten
  async toggleProductActive(id, aktiv) {
    const response = await fetch(`${API_BASE_URL}/api/produkt/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aktiv })
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || 'Fehler beim Aktualisieren des Produkts')
    }
    return result
  },

  async getProductsByCategory(categoryId) {
    const response = await fetch(`${API_BASE_URL}/api/produkt/kategorie/${categoryId}`)
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Produkte nach Kategorie')
    }
    return await response.json()
  }
}
