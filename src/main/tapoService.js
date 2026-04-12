// ── Tapo L530E Lightbulb Service ──
import { resolve } from 'path'
import { config } from 'dotenv'

config({ path: resolve(__dirname, '../../.env') })

let bulbDevice = null
let isConnecting = false

const TAPO_EMAIL = process.env.TAPO_EMAIL
const TAPO_PASSWORD = process.env.TAPO_PASSWORD
const TAPO_BULB_IP = process.env.TAPO_BULB_IP

async function connectBulb() {
  if (bulbDevice) return bulbDevice
  if (isConnecting) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isConnecting) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })
    return bulbDevice
  }

  if (!TAPO_EMAIL || !TAPO_PASSWORD || !TAPO_BULB_IP) {
    throw new Error(
      'Tapo-Konfiguration fehlt! Bitte TAPO_EMAIL, TAPO_PASSWORD und TAPO_BULB_IP in der .env-Datei setzen.'
    )
  }

  isConnecting = true
  try {
    const { cloudLogin, loginDeviceByIp } = await import('tp-link-tapo-connect')

    const cloudToken = await cloudLogin(TAPO_EMAIL, TAPO_PASSWORD)

    bulbDevice = await loginDeviceByIp(TAPO_EMAIL, TAPO_PASSWORD, TAPO_BULB_IP)

    console.log('Tapo L530E verbunden:', TAPO_BULB_IP)
    return bulbDevice
  } catch (err) {
    console.error('Tapo-Verbindung fehlgeschlagen:', err.message)
    bulbDevice = null
    throw err
  } finally {
    isConnecting = false
  }
}

/**
 * Set the bulb to a named color
 * @param {string} colour
 */
async function setColor(colour) {
  const device = await connectBulb()
  await device.turnOn()
  await device.setColour(colour)
}

/**
 * Set the bulb to a specific HSL color.
 * @param {number} hue
 * @param {number} saturation
 * @param {number} luminance
 */
async function setHSL(hue, saturation, luminance) {
  const device = await connectBulb()
  await device.turnOn()
  await device.setHSL(hue, saturation, luminance)
}

/**
 * Set the bulb to white with while nothing is scanned
 * @param {number} brightness
 */
async function setWhite(brightness = 100) {
  const device = await connectBulb()
  await device.turnOn()
  await device.setColour('white')
  await device.setBrightness(brightness)
}

/**
 * for successful scan -> flash the bulb green for a duration, then return to white
 * @param {number} duration
 */
async function flashGreen(duration = 2000) {
  try {
    await setColor('green')
    setTimeout(async () => {
      try {
        await setColor('white')
      } catch (err) {
        console.error('Tapo: Fehler beim Zurücksetzen auf Weiß:', err.message)
      }
    }, duration)
    return { success: true }
  } catch (err) {
    console.error('Tapo flashGreen Fehler:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * for unsuccessful scan -> flash the bulb red for a duration, then return to white
 * @param {number} duration
 */
async function flashRed(duration = 2000) {
  try {
    await setColor('red')
    setTimeout(async () => {
      try {
        await setColor('white')
      } catch (err) {
        console.error('Tapo: Fehler beim Zurücksetzen auf Weiß:', err.message)
      }
    }, duration)
    return { success: true }
  } catch (err) {
    console.error('Tapo flashRed Fehler:', err.message)
    return { success: false, error: err.message }
  }
}

async function turnOn() {
  try {
    const device = await connectBulb()
    await device.turnOn()
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function turnOff() {
  try {
    const device = await connectBulb()
    await device.turnOff()
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function getStatus() {
  try {
    const device = await connectBulb()
    const info = await device.getDeviceInfo()
    return { success: true, info }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Set the bulb to blue – used when a customer is waiting for an employee
 * (help button, unknown barcode, random inspection, age verification).
 * The bulb stays blue until the employee logs in and it is reset to white.
 */
async function setBlue() {
  try {
    await setColor('blue')
    return { success: true }
  } catch (err) {
    console.error('Tapo setBlue Fehler:', err.message)
    return { success: false, error: err.message }
  }
}

export { flashGreen, flashRed, setBlue, setColor, setHSL, setWhite, turnOn, turnOff, getStatus, connectBulb }
