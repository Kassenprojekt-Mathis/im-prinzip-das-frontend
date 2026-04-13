import PropTypes from 'prop-types'
export default function Modal({ isOpen, children }) {
  if (!isOpen) return null
  return (
    <div data-modal="true" className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
      <div className="absolute inset-0" />
      <div className="relative z-10 bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-gray-300">
        {children}
      </div>
    </div>
  )
}
Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
}
