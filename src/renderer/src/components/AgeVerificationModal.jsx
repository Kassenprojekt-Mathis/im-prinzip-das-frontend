import Modal from './Modal'
import PropTypes from 'prop-types'

export default function AgeVerificationModal({ isOpen, onYes, onNo }) {
  return (
    <Modal isOpen={isOpen}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Hat der Kunde das erforderliche Mindestalter erreicht?
        </h2>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onNo}
            className="px-8 py-3 text-gray-700 font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: '#E1E1F2' }}
          >
            Nein
          </button>
          <button
            onClick={onYes}
            className="px-8 py-3 text-white font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: '#948BB8' }}
          >
            Ja
          </button>
        </div>
      </div>
    </Modal>
  )
}

AgeVerificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onYes: PropTypes.func.isRequired,
  onNo: PropTypes.func.isRequired
}
