import {
  POSPrinter,
  POSReceiptBuilder,
  POSTextBuilder,
  POSPrintStyle,
  POSTextAlignment
} from 'escpos-javascript'
import { exec } from 'child_process'

let currentPrinterName = 'GEZHI_micro_printer'

function sanitize(text) {
  return text
    .replace(/ä/g, 'ae')
    .replace(/Ä/g, 'Ae')
    .replace(/ö/g, 'oe')
    .replace(/Ö/g, 'Oe')
    .replace(/ü/g, 'ue')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')
}

function getAvailablePrinters() {
  return new Promise((resolve) => {
    const command =
      process.platform === 'win32'
        ? 'powershell -Command "Get-Printer | Select-Object -ExpandProperty Name"'
        : 'lpstat -a 2>/dev/null'

    exec(command, (error, stdout) => {
      if (error) {
        console.error('[Printer] Fehler beim Auflisten der Drucker:', error.message)
        resolve([])
        return
      }

      const printers = stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          return line.split(/\s+/)[0]
        })
        .filter(Boolean)

      console.log('[Printer] Gefundene Drucker:', printers)
      resolve(printers)
    })
  })
}

function setPrinter(printerName) {
  currentPrinterName = printerName
  console.log(`[Printer] Drucker gewechselt zu: ${printerName}`)
}

function getCurrentPrinter() {
  return currentPrinterName
}

/**
 * @param {object} receiptData
 * @param {string} receiptData.storeName
 * @param {Array<{name: string, price: number, quantity?: number}>} receiptData.items
 * @param {number} receiptData.total
 * @param {string} [receiptData.paymentMethod]
 * @param {string} [receiptData.footer]
 */

function printReceipt(receiptData) {
  return new Promise((resolve, reject) => {
    try {
      const printer = new POSPrinter(currentPrinterName)

      const builder = new POSReceiptBuilder()

      const catLines = ['  /\\_/\\ ', ' ( o . o )']
      for (const catLine of catLines) {
        builder.addComponent(
          new POSTextBuilder(catLine).setAlignment(POSTextAlignment.CENTER).build()
        )
      }
      builder.addFeed()

      builder.setTitle(receiptData.storeName || 'Im Prinzip')
      builder.addFeed()

      const now = new Date()
      const dateStr = now.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      const timeStr = now.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      })
      builder.addComponent(
        new POSTextBuilder(`Datum: ${dateStr}  ${timeStr}`)
          .setAlignment(POSTextAlignment.LEFT)
          .build()
      )

      builder.addComponent(new POSTextBuilder('--------------------------------').build())
      builder.addFeed()

      const LINE_WIDTH = 32

      function wrapText(text, maxWidth) {
        if (text.length <= maxWidth) return [text]
        const lines = []
        let remaining = text
        while (remaining.length > maxWidth) {
          let breakAt = remaining.lastIndexOf(' ', maxWidth)
          if (breakAt <= 0) breakAt = maxWidth
          lines.push(remaining.substring(0, breakAt))
          remaining = remaining.substring(breakAt).trimStart()
        }
        if (remaining.length > 0) lines.push(remaining)
        return lines
      }

      if (receiptData.items && receiptData.items.length > 0) {
        for (const item of receiptData.items) {
          const qty = item.quantity || 1
          const rawName = qty > 1 ? `${qty}x ${item.name}` : item.name
          const name = sanitize(rawName)
          const itemTotal = (item.price || 0) * qty
          const priceStr = itemTotal.toFixed(2) + ' EUR'

          if (name.length + priceStr.length + 2 <= LINE_WIDTH) {
            const padding = LINE_WIDTH - name.length - priceStr.length
            const line = name + ' '.repeat(Math.max(padding, 1)) + priceStr
            builder.addComponent(new POSTextBuilder(line).build())
          } else {
            const maxNameWidth = LINE_WIDTH - priceStr.length - 1
            const nameLines = wrapText(name, maxNameWidth)

            for (let i = 0; i < nameLines.length - 1; i++) {
              builder.addComponent(
                new POSTextBuilder(nameLines[i]).setAlignment(POSTextAlignment.LEFT).build()
              )
            }

            const lastNamePart = nameLines[nameLines.length - 1]
            const lastPadding = LINE_WIDTH - lastNamePart.length - priceStr.length
            const lastLine = lastNamePart + ' '.repeat(Math.max(lastPadding, 1)) + priceStr
            builder.addComponent(new POSTextBuilder(lastLine).build())
          }
        }
      }

      builder.addFeed()
      builder.addComponent(new POSTextBuilder('--------------------------------').build())

      if (receiptData.appliedCoupon) {
        const coupon = receiptData.appliedCoupon
        const subtotal = receiptData.subtotal || receiptData.total
        const subtotalStr = `Zwischensumme: ${subtotal.toFixed(2)} EUR`
        builder.addComponent(
          new POSTextBuilder(subtotalStr)
            .setAlignment(POSTextAlignment.RIGHT)
            .build()
        )

        const discountLabel = coupon.ist_prozentual
          ? `Gutschein ${sanitize(coupon.code)} (${parseFloat(coupon.wert)}%)`
          : `Gutschein ${sanitize(coupon.code)}`
        const discountAmt = parseFloat(coupon.discountAmount || coupon.wert).toFixed(2)
        const discountStr = `-${discountAmt} EUR`
        const discountPadding = LINE_WIDTH - discountLabel.length - discountStr.length
        const discountLine = discountLabel + ' '.repeat(Math.max(discountPadding, 1)) + discountStr
        builder.addComponent(new POSTextBuilder(discountLine).build())
        builder.addFeed()
        builder.addComponent(new POSTextBuilder('--------------------------------').build())
      }

      builder.addComponent(
        new POSTextBuilder(`SUMME: ${receiptData.total.toFixed(2)} EUR`)
          .setStyle(POSPrintStyle.BOLD, POSPrintStyle.DOUBLE_HEIGHT)
          .setAlignment(POSTextAlignment.RIGHT)
          .build()
      )
      builder.addFeed()

      if (receiptData.paymentMethod) {
        builder.addComponent(
          new POSTextBuilder(`Bezahlt mit: ${receiptData.paymentMethod}`)
            .setAlignment(POSTextAlignment.LEFT)
            .build()
        )
        builder.addFeed()
      }

      if (receiptData.voucher) {
        builder.addComponent(new POSTextBuilder('================================').build())
        builder.addFeed()
        builder.addComponent(
          new POSTextBuilder('*** ECO-GUTSCHEIN ***')
            .setStyle(POSPrintStyle.BOLD)
            .setAlignment(POSTextAlignment.CENTER)
            .build()
        )
        builder.addComponent(
          new POSTextBuilder(sanitize(`Code: ${receiptData.voucher.code}`))
            .setStyle(POSPrintStyle.BOLD)
            .setAlignment(POSTextAlignment.CENTER)
            .build()
        )
        builder.addComponent(
          new POSTextBuilder(`Wert: ${parseFloat(receiptData.voucher.wert).toFixed(2)} EUR`)
            .setAlignment(POSTextAlignment.CENTER)
            .build()
        )
        builder.addFeed()
        builder.addComponent(
          new POSTextBuilder('Gueltig 3 Monate ab Ausstellung')
            .setAlignment(POSTextAlignment.CENTER)
            .build()
        )
        builder.addFeed()
        builder.addComponent(
          new POSTextBuilder('Einmalig einzuloesen.')
            .setAlignment(POSTextAlignment.CENTER)
            .build()
        )
        builder.addComponent(
          new POSTextBuilder('Kein Restwert.')
            .setAlignment(POSTextAlignment.CENTER)
            .build()
        )
        builder.addFeed()
        builder.addComponent(new POSTextBuilder('================================').build())
        builder.addFeed()
      }

      builder.addComponent(new POSTextBuilder('--------------------------------').build())

      builder.addFeed()
      builder.addComponent(
        new POSTextBuilder('Noch keine Kundenkarte?')
          .setStyle(POSPrintStyle.BOLD)
          .setAlignment(POSTextAlignment.CENTER)
          .build()
      )
      builder.addComponent(
        new POSTextBuilder('Gleich hier am Service-Punkt')
          .setAlignment(POSTextAlignment.CENTER)
          .build()
      )
      builder.addComponent(
        new POSTextBuilder('im Markt anmelden oder auf')
          .setAlignment(POSTextAlignment.CENTER)
          .build()
      )
      builder.addComponent(
        new POSTextBuilder('www.kunde-im-prinzip.de')
          .setStyle(POSPrintStyle.BOLD)
          .setAlignment(POSTextAlignment.CENTER)
          .build()
      )
      builder.addFeed()

      builder.addComponent(new POSTextBuilder('--------------------------------').build())

      builder.addFeed()
      builder.addComponent(
        new POSTextBuilder('Oeffnungszeiten:')
          .setStyle(POSPrintStyle.BOLD)
          .setAlignment(POSTextAlignment.CENTER)
          .build()
      )
      builder.addComponent(
        new POSTextBuilder('Mo-Sa: 06:00 - 22:00 Uhr').setAlignment(POSTextAlignment.CENTER).build()
      )
      builder.addFeed()
      builder.addComponent(
        new POSTextBuilder('Sie haben Fragen?').setAlignment(POSTextAlignment.CENTER).build()
      )
      builder.addComponent(
        new POSTextBuilder('Antworten gibt es unter').setAlignment(POSTextAlignment.CENTER).build()
      )
      builder.addComponent(
        new POSTextBuilder('www.q&a-im-prinzip.de')
          .setStyle(POSPrintStyle.BOLD)
          .setAlignment(POSTextAlignment.CENTER)
          .build()
      )
      builder.addFeed()

      builder.addComponent(new POSTextBuilder('--------------------------------').build())

      builder.setFooter(receiptData.footer || 'Vielen Dank fuer Ihren Einkauf!')

      const receipt = builder.build()
      printer.print(receipt)

      console.log(`[Printer] Bon gedruckt auf: ${currentPrinterName}`)
      resolve({ success: true, printer: currentPrinterName })
    } catch (error) {
      console.error('[Printer] Druckfehler:', error.message)
      reject(error)
    }
  })
}

function printTestReceipt() {
  return printReceipt({
    storeName: 'Im Prinzip',
    items: [
      { name: 'Test-Artikel 1', price: 1.5, quantity: 2 },
      { name: 'Test-Artikel 2', price: 3.99, quantity: 1 }
    ],
    total: 6.99,
    paymentMethod: 'Bar',
    footer: '--- TEST-BON ---'
  })
}

export { getAvailablePrinters, setPrinter, getCurrentPrinter, printReceipt, printTestReceipt }
