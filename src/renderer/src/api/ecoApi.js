const API_BASE_URL = 'http://localhost:8000'

export const ecoApi = {
  async getEcopunkte(kundeId) {
    const response = await fetch(`${API_BASE_URL}/api/kunde/${kundeId}/ecopunkte`)
    if (!response.ok) throw new Error('Ecopunkte konnten nicht geladen werden')
    const data = await response.json()
    return data.ecopunkte
  },

  async createGutschein() {
    const code = 'ECO-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const gueltigBis = new Date()
    gueltigBis.setMonth(gueltigBis.getMonth() + 3)

    const response = await fetch(`${API_BASE_URL}/api/gutschein/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        wert: '5.00',
        ist_prozentual: false,
        aktiv: true,
        gueltig_bis: gueltigBis.toISOString()
      })
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || 'Fehler beim Erstellen des Gutscheins')
    }
    return result
  },

  async getGutscheinByCode(code) {
    const response = await fetch(`${API_BASE_URL}/api/gutschein/code/${encodeURIComponent(code)}`)
    if (!response.ok) throw new Error('Gutschein nicht gefunden')
    return await response.json()
  },

  async validateGutschein(code, bestellbetrag) {
    const response = await fetch(`${API_BASE_URL}/api/gutschein/validieren`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, bestellbetrag })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Gutschein ungültig')
    return result
  },

  async einloesenGutschein(code, bestellbetrag) {
    const response = await fetch(`${API_BASE_URL}/api/gutschein/einloesen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, bestellbetrag })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Fehler beim Einlösen des Gutscheins')
    return result
  }
}
