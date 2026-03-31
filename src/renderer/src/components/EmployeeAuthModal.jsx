import { useState } from 'react'
import Modal from './Modal'
import PropTypes from 'prop-types'
import PersonIcon from '../assets/Icons/Person.png'

// Mockdaten für Mitarbeiter
const MOCK_USERS = [
  {
    id: 1,
    name: 'ImPrinzipDerMitarbeiter',
    pin: 'Tommy123'
  }
]

export default function EmployeeAuthModal({ isOpen, onSuccess, onCancel }) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [pin, setPin] = useState('')
  const [authError, setAuthError] = useState('')

  const resetForm = () => {
    setSelectedUserId('')
    setPin('')
    setAuthError('')
  }

  const handleAuth = () => {
    setAuthError('')

    if (!selectedUserId) {
      setAuthError('Bitte wählen Sie einen Mitarbeiter aus')
      return
    }

    if (!pin.trim()) {
      setAuthError('Bitte geben Sie Ihre PIN ein')
      return
    }

    // PIN überprüfen
    const selectedUser = MOCK_USERS.find((u) => u.id === parseInt(selectedUserId))
    
    if (!selectedUser) {
      setAuthError('Ungültiger Mitarbeiter')
      return
    }

    if (pin !== selectedUser.pin) {
      setAuthError('Falsche PIN')
      return
    }

    // Authentifizierung erfolgreich
    resetForm()
    onSuccess({
      userId: selectedUserId,
      userName: selectedUser.name
    })
  }

  const handleCancel = () => {
    resetForm()
    onCancel()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth()
    }
  }

  return (
    <Modal isOpen={isOpen}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img src={PersonIcon} alt="Person" className="w-20 h-20 object-contain" />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-gray-800">Mitarbeiter-Anmeldung</h2>
        <p className="text-sm text-gray-600 mb-6">
          Bitte melden Sie sich an, um die Kontrolle durchzuführen
        </p>

        <div className="space-y-4 mb-6">
          {/* Mitarbeiter Drop Down Menü */}
          <div className="text-left">
              <label htmlFor="employee-select" className="block text-sm font-semibold text-gray-700 mb-2">
              Mitarbeiter
            </label>
            <select
              id="employee-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#948BB8] focus:border-transparent text-gray-800"
            >
              <option value="">-- Bitte auswählen --</option>
              {MOCK_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* PIN-Eingabe */}
          <div className="text-left">
            <label htmlFor="pin-input" className="block text-sm font-semibold text-gray-700 mb-2">
              PIN
            </label>
            <input
              id="pin-input"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="PIN eingeben"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#948BB8] focus:border-transparent text-gray-800 text-center text-xl tracking-wide"
            />
          </div>

          {/* Fehleranzeige */}
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {authError}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCancel}
            className="px-8 py-3 text-gray-700 font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#E1E1F2' }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleAuth}
            className="px-8 py-3 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#948BB8' }}
          >
            Anmelden
          </button>
        </div>
      </div>
    </Modal>
  )
}

EmployeeAuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}
