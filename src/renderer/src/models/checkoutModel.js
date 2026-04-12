// Model für CheckoutLayout — sessionStorage-Zugriffe und Datenlogik

function replaceItemsByKey(items, key, newQuantity) {
  const firstIndex = items.findIndex((item) => (item.barcode || item.name) === key)
  if (firstIndex === -1) return items
  if (newQuantity === 0) return items.filter((item) => (item.barcode || item.name) !== key)

  const template = items[firstIndex]
  const before = items.slice(0, firstIndex)
  const after = items.slice(firstIndex).filter((item) => (item.barcode || item.name) !== key)
  return [...before, ...Array.from({ length: newQuantity }, () => ({ ...template })), ...after]
}

export function readCartFromStorage() {
  const stored = sessionStorage.getItem('cartItems')
  return stored ? JSON.parse(stored) : []
}

export function readCustomerFromStorage() {
  return {
    customerCard: sessionStorage.getItem('customerCard') || '',
    customerName: sessionStorage.getItem('customerName') || ''
  }
}

export function readAppliedVoucher() {
  const stored = sessionStorage.getItem('appliedVoucher')
  return stored ? JSON.parse(stored) : null
}

export function readPendingAgeProduct() {
  const stored = sessionStorage.getItem('pendingAgeProduct')
  return stored ? JSON.parse(stored) : {}
}

export function updateCartInStorage(key, newQuantity) {
  const items = readCartFromStorage().map((item) => ({ ...item, quantity: 1 }))
  sessionStorage.setItem('cartItems', JSON.stringify(replaceItemsByKey(items, key, newQuantity)))
}

export function updateCartListInStorage(key, newQuantity) {
  const stored = sessionStorage.getItem('cartItemsList')
  if (!stored) return
  const list = JSON.parse(stored)
  sessionStorage.setItem('cartItemsList', JSON.stringify(replaceItemsByKey(list, key, newQuantity)))
}

export function appendToCartList(product) {
  const stored = sessionStorage.getItem('cartItemsList')
  const list = stored ? JSON.parse(stored) : []

  const item =
    product.type === 'barcode'
      ? {
          type: 'barcode',
          barcode: product.barcode,
          id: product.id,
          name: product.name,
          price: product.price || 0,
          discount: product.discount || null,
          mindestalter: product.mindestalter
        }
      : {
          type: 'manual',
          id: product.id,
          name: product.name,
          price: product.price || product.preis || 0,
          discount: product.rabatt || null,
          mindestalter: product.mindestalter
        }

  sessionStorage.setItem('cartItemsList', JSON.stringify([...list, item]))
}

export function updateVerifiedAge(mindestalter) {
  const current = parseInt(sessionStorage.getItem('ageControlVerifiedAge') || '0')
  sessionStorage.setItem('ageControlVerifiedAge', Math.max(current, mindestalter || 0).toString())
}
