import PropTypes from 'prop-types'
export function PrimaryButton({ onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 bg-primary text-white font-semibold rounded-lg transition-colors hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  )
}
PrimaryButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}
export function SecondaryButton({ onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 bg-secondary text-gray-700 font-semibold rounded-lg transition-colors hover:bg-gray-200 ${className}`}
    >
      {children}
    </button>
  )
}
SecondaryButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}
