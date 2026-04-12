export function groupCartItems(scannedItems) {
  return scannedItems.reduce((acc, item) => {
    const key = item.barcode || item.name
    const existing = acc.find((i) => (i.barcode || i.name) === key)
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1
    } else {
      acc.push({ ...item, quantity: item.quantity || 1 })
    }
    return acc
  }, [])
}

export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
}

export function mapItemsToApiFormat(items) {
  const produkteMap = {}
  for (const item of items) {
    if (!item.id) continue
    if (produkteMap[item.id]) {
      produkteMap[item.id].menge += item.quantity || 1
    } else {
      produkteMap[item.id] = { produkt_id: item.id, menge: item.quantity || 1 }
    }
  }
  return Object.values(produkteMap)
}

export function getCustomerId() {
  const raw = sessionStorage.getItem('customerCard')
  const id = raw ? parseInt(raw, 10) : null
  return id && !isNaN(id) ? id : null
}
