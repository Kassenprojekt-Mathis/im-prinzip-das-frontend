// Das Model

const API_BASE_URL = 'http://localhost:8000'

export const userApi = {
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`)
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Benutzerdaten')
    }
    return await response.json()
  },

  async anmelden(benutzername, passwort) {
    const response = await fetch(`${API_BASE_URL}/api/anmeldung/anmelden`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ benutzername, passwort })
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Anmeldung fehlgeschlagen')
    }
    return data
  },

  async abmelden() {
    const response = await fetch(`${API_BASE_URL}/api/anmeldung/abmelden`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) {
      throw new Error('Abmeldung fehlgeschlagen')
    }
  }
}
