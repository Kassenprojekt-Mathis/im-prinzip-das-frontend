import Modal from './Modal'
import PropTypes from 'prop-types'
import WarningIcon from '../assets/Icons/Warning.png'

export default function AgeControlModal({ isOpen, productName }) {
  return (
    <Modal isOpen={isOpen}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img src={WarningIcon} alt="Warning" className="w-16 h-16 object-contain" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Altersprüfung erforderlich</h2>
        {productName && (
          <p className="text-lg text-gray-700 mb-2">
            <strong>{productName}</strong>
          </p>
        )}
        <p className="text-lg text-gray-700 mb-4">
          Ein Mitarbeiter muss Ihren gescannten Artikel kontrollieren.
        </p>
        <p className="text-base text-gray-600 italic">
          Bitte warten Sie auf die Freigabe durch einen Mitarbeiter.
        </p>
      </div>
    </Modal>
  )
}

AgeControlModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  productName: PropTypes.string
}
