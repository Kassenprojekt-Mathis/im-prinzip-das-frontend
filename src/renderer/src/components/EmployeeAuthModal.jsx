import Modal from './Modal'
import PropTypes from 'prop-types'
import PersonIcon from '../assets/Icons/Person.png'

export default function EmployeeAuthModal({
  isOpen,
  benutzername,
  setBenutzername,
  passwort,
  setPasswort,
  isLoading,
  error,
  onAnmelden,
  onAbbrechen
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onAnmelden()
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
          {/* Benutzername-Eingabe */}
          <div className="text-left">
            <label htmlFor="username-input" className="block text-sm font-semibold text-gray-700 mb-2">
              Benutzername
            </label>
            <input
              id="username-input"
              type="text"
              value={benutzername}
              onChange={(e) => setBenutzername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Benutzername eingeben"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#948BB8] focus:border-transparent text-gray-800"
            />
          </div>

          {/* PIN-Eingabe */}
          <div className="text-left">
            <label htmlFor="pin-input" className="block text-sm font-semibold text-gray-700 mb-2">
              PIN
            </label>
            <input
              id="pin-input"
              type="password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="PIN eingeben"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#948BB8] focus:border-transparent text-gray-800 text-center text-xl tracking-wide"
            />
          </div>

          {/* Fehleranzeige */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onAbbrechen}
            disabled={isLoading}
            className="px-8 py-3 text-gray-700 font-semibold rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#E1E1F2' }}
          >
            Abbrechen
          </button>
          <button
            onClick={onAnmelden}
            disabled={isLoading}
            className="px-8 py-3 text-white font-semibold rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#948BB8' }}
          >
            {isLoading ? 'Wird geprüft...' : 'Anmelden'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

EmployeeAuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  benutzername: PropTypes.string.isRequired,
  setBenutzername: PropTypes.func.isRequired,
  passwort: PropTypes.string.isRequired,
  setPasswort: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  onAnmelden: PropTypes.func.isRequired,
  onAbbrechen: PropTypes.func.isRequired
}
