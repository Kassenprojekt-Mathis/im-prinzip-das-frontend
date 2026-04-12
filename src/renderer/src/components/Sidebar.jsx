export default function Sidebar({
  items = [],
  customerCard,
  customerName,
  appliedVoucher,
  editable = false,
  onUpdateQuantity,
  onRemoveItem
}) {
  const fmt = (n) => n.toFixed(2).replace('.', ',')

  const grouped = items.reduce((acc, item) => {
    const key = item.barcode || item.name
    const existing = acc.find((i) => (i.barcode || i.name) === key)
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1
    } else {
      acc.push({ ...item, quantity: item.quantity || 1 })
    }
    return acc
  }, [])

  const totalBeforeDiscount = grouped.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  )

  const totalDiscount = grouped.reduce(
    (sum, item) => sum + (item.discount?.amount || 0) * (item.quantity || 1),
    0
  )

  const voucherDiscount = appliedVoucher ? parseFloat(appliedVoucher.discountAmount) : 0
  const total = totalBeforeDiscount - totalDiscount - voucherDiscount

  const handleIncrease = (item) => {
    const key = item.barcode || item.name
    onUpdateQuantity?.(key, item.quantity + 1)
  }

  const handleDecrease = (item) => {
    const key = item.barcode || item.name
    if (item.quantity <= 1) {
      onRemoveItem?.(key)
    } else {
      onUpdateQuantity?.(key, item.quantity - 1)
    }
  }

  const handleRemove = (item) => {
    const key = item.barcode || item.name
    onRemoveItem?.(key)
  }

  return (
    <>
      <div className="flex-1 p-4 overflow-y-auto text-[#1e1e38]">
        {grouped.length === 0 ? (
          <p className="text-gray-400 text-lg italic">Noch keine Artikel gescannt.</p>
        ) : (
          grouped.map((item, i) => (
            <div key={i} className="mb-3">
              {/* Artikelzeile */}
              <div className="flex justify-between items-center gap-2">
                <div className="flex gap-2 truncate items-center">
                  {!editable && item.quantity > 1 && (
                    <span className="text-xl font-bold text-[#4338CA]">{item.quantity}×</span>
                  )}
                  <span className="text-xl font-semibold truncate">{item.name}</span>
                </div>
                <span className="text-xl font-semibold whitespace-nowrap">
                  {fmt((item.price || 0) * (item.quantity || 1))} €
                </span>
              </div>

              {/* Rabatt-Zeile */}
              {item.discount && (
                <div className="flex justify-between gap-2 pl-4 text-[#4338CA]">
                  <span className="text-base truncate">{item.discount.label}</span>
                  <span className="text-base whitespace-nowrap">
                    -{fmt(item.discount.amount * (item.quantity || 1))} €
                  </span>
                </div>
              )}

              {/* Bearbeitungs-Buttons (nur im editable-Modus) */}
              {editable && (
                <div className="flex items-center justify-between mt-1 pl-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDecrease(item)}
                      className="w-8 h-8 flex items-center justify-center bg-[#E1E1F2] rounded-lg text-lg font-bold text-[#1e1e38] hover:bg-[#d0d0e8] active:scale-95 transition-transform"
                    >
                      −
                    </button>
                    <span className="text-lg font-bold min-w-[1.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrease(item)}
                      className="w-8 h-8 flex items-center justify-center bg-[#E1E1F2] rounded-lg text-lg font-bold text-[#1e1e38] hover:bg-[#d0d0e8] active:scale-95 transition-transform"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-lg text-red-600 hover:bg-red-200 active:scale-95 transition-transform"
                    title="Artikel entfernen"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {customerCard && (
          <p className="text-[#4338CA] text-lg font-semibold mt-3">
            Hallo, {customerName || `Kunde ${customerCard}`}!
          </p>
        )}
        {appliedVoucher && (
          <div className="flex justify-between gap-2 mt-3 text-green-700">
            <span className="text-base font-semibold truncate">
              Gutschein {appliedVoucher.code}
            </span>
            <span className="text-base font-semibold whitespace-nowrap">
              -{fmt(voucherDiscount)} €
            </span>
          </div>
        )}
      </div>

      <div className="bg-[#EBECEF] border-t-[6px] border-[#D9DADD] p-6 flex flex-col justify-center min-h-[5rem]">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-black tracking-tight">SUMME:</span>
          <span className="text-3xl font-bold">{fmt(total)} €</span>
        </div>
        {(totalDiscount > 0 || voucherDiscount > 0) && (
          <p className="text-center font-extrabold text-lg mt-1 tracking-wide">
            SIE HABEN <span className="text-[#4338CA]">{fmt(totalDiscount + voucherDiscount)} €</span> GESPART!
          </p>
        )}
      </div>
    </>
  )
}
