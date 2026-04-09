import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DevModeProvider } from './context/DevModeContext'
import CheckoutLayout from './components/CheckoutLayout'
import ScanPage from './pages/ScanPage'
import SummaryPage from './pages/SummaryPage'
import PaymentPage from './pages/PaymentPage'
import ProductManagementPage from './pages/ProductManagementPage'

export default function App() {
  return (
    <DevModeProvider>
      <HashRouter>
        <Routes>
          {/* Layout, dass sich nicht verändert */}
          <Route path="/" element={<CheckoutLayout />}>
            {/*  Default-Route */}
            <Route index element={<Navigate to="/scan" replace />} />
            {/* Die drei Kassen-Pages */}

            <Route path="scan" element={<ScanPage />} />
            <Route path="summary" element={<SummaryPage />} />
            <Route path="payment" element={<PaymentPage />} />
          </Route>

          {/* Mitarbeiter-Seite */}
          <Route path="/products" element={<ProductManagementPage />} />
        </Routes>
      </HashRouter>
    </DevModeProvider>
  )
}
