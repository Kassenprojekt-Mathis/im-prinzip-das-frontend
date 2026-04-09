import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  getAvailablePrinters,
  setPrinter,
  getCurrentPrinter,
  printReceipt,
  printTestReceipt
} from './printerService'
import { flashGreen, flashRed, setColor, setHSL, turnOn, turnOff, getStatus } from './tapoService'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // ── Printer IPC Handlers ──
  ipcMain.handle('printer:getAvailable', async () => {
    return await getAvailablePrinters()
  })

  ipcMain.handle('printer:getCurrent', () => {
    return getCurrentPrinter()
  })

  ipcMain.handle('printer:set', (_event, printerName) => {
    setPrinter(printerName)
    return { success: true, printer: printerName }
  })

  ipcMain.handle('printer:printReceipt', async (_event, receiptData) => {
    return await printReceipt(receiptData)
  })

  ipcMain.handle('printer:printTest', async () => {
    return await printTestReceipt()
  })

  // ── Tapo Lightbulb IPC Handlers ──
  ipcMain.handle('tapo:flashGreen', async () => {
    return await flashGreen()
  })

  ipcMain.handle('tapo:flashRed', async () => {
    return await flashRed()
  })

  ipcMain.handle('tapo:setColor', async (_event, colour) => {
    try {
      await setColor(colour)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('tapo:setHSL', async (_event, hue, saturation, luminance) => {
    try {
      await setHSL(hue, saturation, luminance)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('tapo:turnOn', async () => {
    return await turnOn()
  })

  ipcMain.handle('tapo:turnOff', async () => {
    return await turnOff()
  })

  ipcMain.handle('tapo:getStatus', async () => {
    return await getStatus()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
