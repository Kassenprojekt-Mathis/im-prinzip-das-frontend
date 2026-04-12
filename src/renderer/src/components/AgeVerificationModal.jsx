import Modal from './Modal'
import PropTypes from 'prop-types'

export default function AgeVerificationModal({
  isOpen,
  onYes,
  onNo,
  productName,
  mindestalter,
  maxBirthDate
}) {
  return (
    <Modal isOpen={isOpen}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Alterskontrolle erforderlich</h2>

        {productName && <p className="text-lg text-gray-700 mb-2">Produkt: {productName}</p>}

        {mindestalter && (
          <div className="mb-4">
            <p>
              Erforderliches Mindestalter: <strong>{mindestalter} Jahre</strong>
            </p>
            <p className="text-lg text-gray-600 mt-1">
              Geboren am oder vor: <strong>{maxBirthDate}</strong>
            </p>
          </div>
        )}

        <p className="text-lg text-gray-700 mb-6">
          Hat der Kunde das erforderliche Mindestalter erreicht?
        </p>

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
  onNo: PropTypes.func.isRequired,
  productName: PropTypes.string,
  mindestalter: PropTypes.number,
  maxBirthDate: PropTypes.string
}
