export function findLastIndex(arr, predicate) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i
  }
  return -1
}

export function getScannedItems(cartItemsList) {
  return cartItemsList.map((item) => {
    if (item.type === 'manual') {
      return { name: item.name, id: item.id, price: item.price || 0, quantity: 1 }
    }
    return {
      barcode: item.barcode,
      name: item.name,
      price: item.price || 0,
      discount: item.discount || null,
      quantity: 1
    }
  })
}

export function buildBarcodeCartItem(barcode, product) {
  return {
    type: 'barcode',
    barcode,
    id: product.id,
    name: product.name || `Unbekannt (${barcode})`,
    price: product.price || 0,
    discount: product.discount || null,
    mindestalter: product.mindestalter || 0
  }
}

export function buildManualCartItem(product) {
  return {
    type: 'manual',
    id: product.id,
    name: product.name,
    price: product.preis || 0,
    discount: product.rabatt || null,
    mindestalter: product.mindestalter || 0
  }
}

export function buildPendingAgeProduct(barcode, product) {
  return {
    ...product,
    barcode,
    type: 'barcode',
    price: product.price || 0,
    discount: product.discount || null
  }
}

// sessionStorage reads
export function readAgeControlActive() {
  return sessionStorage.getItem('ageControlActive') === 'true'
}

export function readPendingAgeProductFromStorage() {
  const stored = sessionStorage.getItem('pendingAgeProduct')
  return stored ? JSON.parse(stored) : null
}

export function readCartItemsListFromStorage() {
  const stored = sessionStorage.getItem('cartItemsList')
  return stored ? JSON.parse(stored) : []
}

export function isPendingCustomerCard() {
  return sessionStorage.getItem('pendingCustomerCard') === 'true'
}

export function readVerifiedAge() {
  return parseInt(sessionStorage.getItem('ageControlVerifiedAge') || '0')
}

// sessionStorage writes
export function setCustomerData(kunde) {
  sessionStorage.removeItem('pendingCustomerCard')
  sessionStorage.setItem('customerCard', String(kunde.id))
  sessionStorage.setItem('customerName', `${kunde.vorname} ${kunde.name}`)
  sessionStorage.setItem('customerEcopunkte', String(kunde.ecopunkte))
}

export function clearPendingCustomerCard() {
  sessionStorage.removeItem('pendingCustomerCard')
}

export function setPendingAgeControl(pending) {
  sessionStorage.setItem('ageControlActive', 'true')
  sessionStorage.setItem('pendingAgeProduct', JSON.stringify(pending))
}

export function syncCartToStorage(allItems, cartItemsList) {
  sessionStorage.setItem('cartItems', JSON.stringify(allItems))
  sessionStorage.setItem('cartItemsList', JSON.stringify(cartItemsList))
}

// pure calculation
export function calcMaxBirthDate(mindestalter) {
  if (!mindestalter) return null
  const today = new Date()
  const maxDate = new Date(today.getFullYear() - mindestalter, today.getMonth(), today.getDate())
  return maxDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
