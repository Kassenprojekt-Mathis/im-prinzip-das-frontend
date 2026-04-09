import { useEffect } from 'react'
import Modal from './Modal'
import PropTypes from 'prop-types'
import PersonIcon from '../assets/Icons/Person.png'

export default function Login({
  isOpen,
  selectedUsername,
  setSelectedUsername,
  password,
  setPassword,
  employeeList,
  isLoading,
  error,
  onLoadEmployees,
  onAuth,
  onCancel
}) {
  useEffect(() => {
    if (isOpen) {
      onLoadEmployees()
    }
  }, [isOpen, onLoadEmployees])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      onAuth()
    }
  }

  return (
    <Modal isOpen={isOpen}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img src={PersonIcon} alt="Person" className="w-20 h-20 object-contain" />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-gray-800">Mitarbeiter-Anmeldung</h2>
        <p className="text-sm text-gray-600 mb-6">Bitte melden Sie sich an</p>

        <div className="space-y-4 mb-6">
          <div className="text-left">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mitarbeiter</label>
            <select
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#948BB8] focus:border-transparent text-gray-800 disabled:opacity-50"
            >
              <option value="">-- Bitte auswählen --</option>
              {employeeList.map((employee) => (
                <option key={employee.id} value={employee.benutzername}>
                  {employee.benutzername}
                </option>
              ))}
            </select>
          </div>

          <div className="text-left">
            <label
              htmlFor="password-input"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Passwort
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Passwort eingeben"
              disabled={isLoading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#948BB8] focus:border-transparent text-gray-800 disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-8 py-3 text-gray-700 font-semibold rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#E1E1F2' }}
          >
            Abbrechen
          </button>
          <button
            onClick={onAuth}
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

Login.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  selectedUsername: PropTypes.string.isRequired,
  setSelectedUsername: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  employeeList: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  onLoadEmployees: PropTypes.func.isRequired,
  onAuth: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}
