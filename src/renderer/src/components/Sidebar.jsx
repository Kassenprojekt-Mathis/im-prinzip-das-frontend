/**
 *   items           – Array von Produkten: { name, price, discount?: { label, amount } }
 *   customerAccount – Kundenkonto-Nummer als String
 *   total           – Gesamtsumme in Euro
 *   savings         – Gesparter Betrag in Euro
 */
export default function Sidebar({ items = [], customerAccount, total = 0, savings = 0 }) {
  const fmt = (n) => n.toFixed(2).replace('.', ',')

  return (
    <>
      <div className="flex-1 p-3 lg:p-5 overflow-y-auto text-[#1e1e38]">
        {items.map((item, i) => (
          <div key={i} className="mb-1">
            <div className="flex justify-between gap-2 text-sm md:text-base lg:text-lg font-semibold">
              <span className="truncate">{item.name}</span>
              <span className="whitespace-nowrap">{fmt(item.price)}€</span>
            </div>

            {item.discount && (
              <div className="flex justify-between gap-2 text-[#4338CA] pl-2 md:pl-4 text-xs md:text-sm lg:text-base">
                <span className="truncate">{item.discount.label}</span>
                <span className="whitespace-nowrap">-{fmt(item.discount.amount)}€</span>
              </div>
            )}
          </div>
        ))}

        {customerAccount && (
          <p className="text-[#4338CA] text-sm md:text-base lg:text-lg mt-1 font-semibold">
            Kundenkonto {customerAccount} erfasst!
          </p>
        )}
      </div>

      <div className="bg-[#EBECEF] border-t-[6px] border-[#D9DADD] p-3 md:p-4 lg:p-6 flex flex-col justify-center min-h-[5rem] lg:min-h-[8rem]">
        <div className="flex justify-between items-center">
          <span className="text-base md:text-xl lg:text-2xl font-black tracking-tight">SUMME:</span>
          <span className="text-lg md:text-2xl lg:text-3xl font-bold">{fmt(total)} €</span>
        </div>

        {savings > 0 && (
          <p className="text-center font-extrabold text-xs md:text-sm lg:text-lg mt-1 lg:mt-2 tracking-wide">
            SIE HABEN <span className="text-[#4338CA]">{fmt(savings)}€</span> GESPART!
          </p>
        )}
      </div>
    </>
  )
}
