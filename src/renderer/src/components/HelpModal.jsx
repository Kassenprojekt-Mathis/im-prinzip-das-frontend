import Modal from './Modal'
import PropTypes from 'prop-types'
export default function HelpModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Hilfe angefordert</h2>
        <p className="text-lg text-gray-700 mb-6">
          Ein Mitarbeiter ist auf dem Weg und wird Ihnen gleich helfen.
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 text-white font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: '#948BB8' }}
        >
          OK
        </button>
      </div>
    </Modal>
  )
}
HelpModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}
