import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { productApi } from '../api/productAPI'
import { categoryApi } from '../api/categoryAPI'

const TABS = {
  SCAN: 'scan',
  MANUAL: 'manual'
}

const INITIAL_MANUAL_INPUT = {
  name: '',
  preis: '',
  mwst_satz: '',
  lagerbestand: '',
  kategorie_id: '',
  rabatt: '0',
  mindestalter: '0',
  bild: ''
}

function validatePflichtfelder(manualInput) {
  return (
    manualInput.name &&
    manualInput.preis &&
    manualInput.mwst_satz &&
    manualInput.lagerbestand &&
    manualInput.kategorie_id
  )
}

function buildProduktDaten(manualInput) {
  return {
    name: manualInput.name,
    preis: parseFloat(manualInput.preis),
    mwst_satz: parseFloat(manualInput.mwst_satz),
    lagerbestand: parseInt(manualInput.lagerbestand),
    kategorie_id: parseInt(manualInput.kategorie_id),
    rabatt: parseFloat(manualInput.rabatt || '0'),
    mindestalter: parseInt(manualInput.mindestalter || '0'),
    bild: manualInput.bild || null
  }
}

export function useProductManagement() {
  const navigate = useNavigate()
  const barcodeRef = useRef(null)

  const [barcodeInput, setBarcodeInput] = useState('')
  const [manualInput, setManualInput] = useState(INITIAL_MANUAL_INPUT)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState(TABS.SCAN)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchProduct, setSearchProduct] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const showMessage = useCallback((type, text, duration = 3000) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), duration)
  }, [])

  const resetManualInput = useCallback(() => {
    setManualInput(INITIAL_MANUAL_INPUT)
  }, [])

  const loadProducts = useCallback(async () => {
    try {
      const data = await productApi.getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('Fehler beim Laden der Produkte:', error)
    }
  }, [])

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
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (activeTab === TABS.SCAN && !editingProduct && barcodeRef.current) {
      barcodeRef.current.focus()
    }
  }, [activeTab, editingProduct])

  const handleBarcodeScan = useCallback(async () => {
    if (!barcodeInput.trim()) return
    const barcode = barcodeInput.trim()
    try {
      await productApi.createProduct({ barcode })
      await loadProducts()
      showMessage('success', `Produkt ${barcode} hinzugefügt`)
      setBarcodeInput('')
    } catch (error) {
      showMessage('error', error.message || 'Fehler beim Hinzufügen')
    }
  }, [barcodeInput, loadProducts, showMessage])

  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!validatePflichtfelder(manualInput)) {
        showMessage('error', 'Bitte alle Pflichtfelder ausfüllen')
        return
      }
      const produktDaten = buildProduktDaten(manualInput)
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
    },
    [manualInput, editingProduct, loadProducts, showMessage, resetManualInput]
  )

  const handleDelete = useCallback(
    async (produktId) => {
      if (!window.confirm('Möchten Sie dieses Produkt wirklich löschen?')) return
      try {
        await productApi.deleteProduct(produktId)
        await loadProducts()
        showMessage('success', 'Produkt gelöscht')
      } catch (error) {
        showMessage('error', error.message || 'Fehler beim Löschen')
      }
    },
    [loadProducts, showMessage]
  )

  const handleEdit = useCallback((product) => {
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
    setActiveTab(TABS.MANUAL)
  }, [])

  const handleToggleAktiv = useCallback(
    async (product) => {
      try {
        await productApi.toggleProductActive(product.id, !product.aktiv)
        await loadProducts()
        showMessage('success', product.aktiv ? 'Produkt deaktiviert' : 'Produkt aktiviert')
      } catch (error) {
        showMessage('error', error.message || 'Fehler beim Aktualisieren')
      }
    },
    [loadProducts, showMessage]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingProduct(null)
    resetManualInput()
  }, [resetManualInput])

  const filteredProducts = useMemo(
    () =>
      products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
            (filterCategory === '' || p.kategorie_id.toString() === filterCategory)
        )
        .sort((a, b) => b.id - a.id),
    [products, searchProduct, filterCategory]
  )

  return {
    // Refs
    barcodeRef,
    // State
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
    filteredProducts,
    // Handler
    handleBarcodeScan,
    handleFormSubmit,
    handleDelete,
    handleEdit,
    handleToggleAktiv,
    handleCancelEdit,
    navigate
  }
}
