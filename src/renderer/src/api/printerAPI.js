// Wrapper für Printer-Funktionen via Preload-Script

export const printerApi = {
  async getAvailablePrinters() {
    return await window.api.printer.getAvailable()
  },

  async getCurrentPrinter() {
    return await window.api.printer.getCurrent()
  },

  async setPrinter(printerName) {
    return await window.api.printer.set(printerName)
  },

  // receiptData: { storeName, items[{name, price, quantity}], total, paymentMethod?, footer? }
  async printReceipt(receiptData) {
    return await window.api.printer.printReceipt(receiptData)
  },

  async printTestReceipt() {
    return await window.api.printer.printTest()
  }
}
