export default function Sidebar({ items = [], customerCard }) {
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

  const total = totalBeforeDiscount - totalDiscount

  return (
    <>
      <div className="flex-1 p-4 overflow-y-auto text-[#1e1e38]">
        {grouped.length === 0 ? (
          <p className="text-gray-400 text-lg italic">Noch keine Artikel gescannt.</p>
        ) : (
          grouped.map((item, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between gap-2">
                <div className="flex gap-2 truncate">
                  {item.quantity > 1 && (
                    <span className="text-xl font-bold text-[#4338CA]">{item.quantity}×</span>
                  )}
                  <span className="text-xl font-semibold truncate">{item.name}</span>
                </div>
                <span className="text-xl font-semibold whitespace-nowrap">
                  {fmt((item.price || 0) * (item.quantity || 1))} €
                </span>
              </div>
              {item.discount && (
                <div className="flex justify-between gap-2 pl-4 text-[#4338CA]">
                  <span className="text-base truncate">{item.discount.label}</span>
                  <span className="text-base whitespace-nowrap">
                    -{fmt(item.discount.amount * (item.quantity || 1))} €
                  </span>
                </div>
              )}
            </div>
          ))
        )}

        {customerCard && (
          <p className="text-[#4338CA] text-lg font-semibold mt-3">
            Kundenkonto {customerCard} erfasst!
          </p>
        )}
      </div>

      <div className="bg-[#EBECEF] border-t-[6px] border-[#D9DADD] p-6 flex flex-col justify-center min-h-[5rem]">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-black tracking-tight">SUMME:</span>
          <span className="text-3xl font-bold">{fmt(total)} €</span>
        </div>
        {totalDiscount > 0 && (
          <p className="text-center font-extrabold text-lg mt-1 tracking-wide">
            SIE HABEN <span className="text-[#4338CA]">{fmt(totalDiscount)} €</span> GESPART!
          </p>
        )}
      </div>
    </>
  )
}
