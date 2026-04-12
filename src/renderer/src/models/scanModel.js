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
