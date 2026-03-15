import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layout
import CheckoutLayout from './components/CheckoutLayout'

// Pages
import ScanPage from './pages/ScanPage'
import SummaryPage from './pages/SummaryPage'
import PaymentPage from './pages/PaymentPage'
import PaymentFinishedPage from './pages/PaymentFinishedPage'

//Routen
export default function App() {
  return (
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
          <Route path="reminder" element={<PaymentFinishedPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
