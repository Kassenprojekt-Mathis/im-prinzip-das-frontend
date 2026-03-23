export default function Sidebar({ items = [] }) {
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

  const total = grouped.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  )

  return (
    <>
      <div className="flex-1 p-4 overflow-y-auto text-[#1e1e38]">
        {grouped.length === 0 ? (
          <p className="text-gray-400 text-sm italic">Noch keine Artikel gescannt.</p>
        ) : (
          grouped.map((item, i) => (
            <div key={i} className="flex justify-between gap-2 mb-2">
              <div className="flex gap-2 truncate">
                {item.quantity > 1 && (
                  <span className="text-sm font-bold text-[#4338CA]">{item.quantity}×</span>
                )}
                <span className="text-sm font-semibold truncate">{item.name}</span>
              </div>
              <span className="text-sm font-semibold whitespace-nowrap">
                {fmt((item.price || 0) * (item.quantity || 1))} €
              </span>
            </div>
          ))
        )}
      </div>

      <div className="bg-[#EBECEF] border-t-[6px] border-[#D9DADD] p-6 flex justify-between items-center min-h-[5rem]">
        <span className="text-2xl font-black tracking-tight">SUMME:</span>
        <span className="text-3xl font-bold">{fmt(total)} €</span>
      </div>
    </>
  )
}
