// ViewModel für ProductManagementPage
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productApi } from '../api/productAPI'
import { categoryApi } from '../api/categoryAPI'

const INITIAL_MANUAL_INPUT = {
  id: '',
  name: '',
  preis: '',
  mwst_satz: '',
  lagerbestand: '',
  kategorie_id: '',
  rabatt: '0',
  mindestalter: '0',
  bild: ''
}

export function useProductManagement() {
  const navigate = useNavigate()

  const [barcodeInput, setBarcodeInput] = useState('')
  const [manualInput, setManualInput] = useState(INITIAL_MANUAL_INPUT)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('scan')
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchProduct, setSearchProduct] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [idFromScan, setIdFromScan] = useState(false)

  const showMessage = (type, text, duration = 3000) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), duration)
  }

  const resetManualInput = () => {
    setManualInput(INITIAL_MANUAL_INPUT)
    setIdFromScan(false)
  }

  const loadProducts = async () => {
    try {
      const data = await productApi.getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('Fehler beim Laden der Produkte:', error)
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAllCategories()
        setCategories(data)
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error)
      }
    }
    fetchCategories()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts()
  }, [])

  const handleBarcodeScan = () => {
    if (!barcodeInput.trim()) return
    const barcode = barcodeInput.trim()
    setManualInput({ ...INITIAL_MANUAL_INPUT, id: barcode })
    setActiveTab('manual')
    setBarcodeInput('')
    setIdFromScan(true)
    showMessage(
      'success',
      `Barcode ${barcode} als ID übernommen – bitte restliche Felder ausfüllen`
    )
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (
      !manualInput.name ||
      !manualInput.preis ||
      !manualInput.mwst_satz ||
      !manualInput.lagerbestand ||
      !manualInput.kategorie_id
    ) {
      showMessage('error', 'Bitte alle Pflichtfelder ausfüllen')
      return
    }

    if (!editingProduct && !manualInput.id) {
      showMessage('error', 'Bitte zuerst einen Barcode scannen oder eine ID eingeben')
      return
    }

    const produktDaten = {
      name: manualInput.name,
      preis: parseFloat(manualInput.preis),
      mwst_satz: parseFloat(manualInput.mwst_satz),
      lagerbestand: parseInt(manualInput.lagerbestand),
      kategorie_id: parseInt(manualInput.kategorie_id),
      rabatt: parseFloat(manualInput.rabatt || '0'),
      mindestalter: parseInt(manualInput.mindestalter || '0'),
      bild: manualInput.bild || null,
      ...(!editingProduct && manualInput.id && { id: parseInt(manualInput.id) })
    }

    try {
      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, produktDaten)
      } else {
        await productApi.createProduct(produktDaten)
      }
      await loadProducts()
      showMessage('success', editingProduct ? 'Produkt aktualisiert' : 'Produkt hinzugefügt')
      setEditingProduct(null)
      resetManualInput()
    } catch (error) {
      showMessage('error', error.message || 'Fehler')
    }
  }

  const handleDelete = async (produktId) => {
    if (!window.confirm('Möchten Sie dieses Produkt wirklich löschen?')) return
    try {
      await productApi.deleteProduct(produktId)
      await loadProducts()
      showMessage('success', 'Produkt gelöscht')
    } catch (error) {
      showMessage('error', error.message || 'Fehler beim Löschen')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setManualInput({
      name: product.name,
      preis: product.preis.toString(),
      mwst_satz: product.mwst_satz.toString(),
      lagerbestand: product.lagerbestand.toString(),
      kategorie_id: product.kategorie_id.toString(),
      rabatt: product.rabatt.toString(),
      mindestalter: product.mindestalter.toString(),
      bild: product.bild || ''
    })
    setActiveTab('manual')
  }

  const handleToggleAktiv = async (product) => {
    try {
      await productApi.toggleProductActive(product.id, !product.aktiv)
      await loadProducts()
      showMessage('success', product.aktiv ? 'Produkt deaktiviert' : 'Produkt aktiviert')
    } catch (error) {
      showMessage('error', error.message || 'Fehler beim Aktualisieren')
    }
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    resetManualInput()
  }

  const handleBack = () => navigate('/scan')

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
        (filterCategory === '' || p.kategorie_id.toString() === filterCategory)
    )
    .sort((a, b) => b.id - a.id)

  return {
    barcodeInput,
    setBarcodeInput,
    manualInput,
    setManualInput,
    categories,
    products,
    message,
    activeTab,
    setActiveTab,
    editingProduct,
    searchProduct,
    setSearchProduct,
    filterCategory,
    setFilterCategory,
    idFromScan,
    filteredProducts,
    handleBarcodeScan,
    handleFormSubmit,
    handleDelete,
    handleEdit,
    handleToggleAktiv,
    handleCancelEdit,
    handleBack
  }
}
