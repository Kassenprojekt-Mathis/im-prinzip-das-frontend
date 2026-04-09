import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DevModeProvider } from './context/DevModeContext'
import CheckoutLayout from './components/CheckoutLayout'
import ScanPageHome from './pages/ScanPageHome'
import ScanPage from './pages/ScanPage'
import SummaryPage from './pages/SummaryPage'
import PaymentPage from './pages/PaymentPage'

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
            <Route path="scanhome" element={<ScanPageHome />} />
            <Route path="scan" element={<ScanPage />} />
            <Route path="summary" element={<SummaryPage />} />
            <Route path="payment" element={<PaymentPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </DevModeProvider>
  )
}
