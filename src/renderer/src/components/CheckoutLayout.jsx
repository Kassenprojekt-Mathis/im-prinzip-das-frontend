import { Outlet } from 'react-router-dom'
import { useCheckoutLayout } from '../hooks/useCheckoutLayout'
import logoPrinzip from '../assets/Prinzip_Logo.png'
import RandomInspectionVerificationModal from './RandomInspectionModal'
import InspectionFailedModal from './InspectionFailedModal'
import AgeVerificationModal from './AgeVerificationModal'
import Login from './Login'
import EmployeeMenuModal from './EmployeeMenuModal'
import HelpModal from './HelpModal'
import Sidebar from './Sidebar'

const NAV_DISABLED_STYLE = 'opacity-50'
const NAV_ACTIVE_STYLE = 'text-white'
const NAV_INACTIVE_STYLE = 'text-[#4A4A68]'

export default function CheckoutLayout() {
  const vm = useCheckoutLayout()
  const navDisabled = vm.inspectionActive || vm.ageControlActive

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6 flex flex-col font-sans text-[#1e1e38] relative">
      {vm.devMode && (
        <div className="fixed top-2 right-2 z-50 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          DEV MODE
        </div>
      )}

      <header className="flex justify-between items-center mb-4">
        <button
          onClick={vm.handleLogoClick}
          className="h-16 w-48 bg-[#1E1B4B] rounded-lg flex items-center justify-center overflow-hidden shadow-md hover:opacity-90 transition-opacity"
        >
          <img src={logoPrinzip} alt="Prinzip Logo" />
        </button>
        <button
          onClick={vm.handleHelp}
          className="text-[#1E1B4B] font-extrabold text-2xl tracking-wide border-4 border-gray-300 bg-white px-10 py-3 rounded-md shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
        >
          HILFE
        </button>
      </header>

      <div className="flex w-full h-10 mb-4 text-lg font-bold">
        <button
          onClick={() => vm.handleNavigateTo('/scan')}
          disabled={navDisabled}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-10 transition-colors ${vm.isActive('/scan') ? NAV_ACTIVE_STYLE : NAV_INACTIVE_STYLE} ${navDisabled ? NAV_DISABLED_STYLE : ''}`}
          style={{ clipPath: 'polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)' }}
        >
          EINSCANNEN
        </button>
        <button
          onClick={vm.handleNavigateToSummary}
          disabled={navDisabled}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-20 -ml-[2%] transition-colors ${vm.isActive('/summary') ? NAV_ACTIVE_STYLE : NAV_INACTIVE_STYLE} ${navDisabled ? NAV_DISABLED_STYLE : ''}`}
          style={{ clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)' }}
        >
          ZUSAMMENFASSUNG
        </button>
        <button
          onClick={() => vm.handleNavigateTo('/payment')}
          disabled={navDisabled}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-30 -ml-[2%] transition-colors ${vm.isActive('/payment') ? NAV_ACTIVE_STYLE : NAV_INACTIVE_STYLE} ${navDisabled ? NAV_DISABLED_STYLE : ''}`}
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)' }}
        >
          ZAHLUNG
        </button>
      </div>

      <main
        className="flex-1 grid gap-6"
        style={{
          gridTemplateColumns: vm.isSummary ? '3fr 2fr' : '2fr 1fr',
          transition: 'grid-template-columns 300ms ease'
        }}
      >
        <section className="bg-white border-[6px] border-[#D9DADD] rounded-xl flex flex-col relative overflow-hidden shadow-sm">
          <div className="p-4 flex-1 overflow-y-auto">
            <Outlet />
          </div>

          <RandomInspectionVerificationModal
            isOpen={vm.showInspectionVerification}
            onYes={vm.handleInspectionVerificationYes}
            onNo={vm.handleInspectionVerificationNo}
          />
          <AgeVerificationModal
            isOpen={vm.showAgeVerification}
            onYes={vm.handleAgeVerified}
            onNo={vm.handleAgeRejected}
            productName={vm.pendingAgeProduct.name}
            mindestalter={vm.pendingAgeProduct.mindestalter}
            maxBirthDate={vm.pendingAgeProductMaxBirthDate}
          />
          <InspectionFailedModal
            isOpen={vm.showInspectionFailed}
            onAnpassen={vm.handleInspectionAnpassen}
            onBeenden={vm.handleInspectionBeenden}
          />
          <Login
            isOpen={vm.showLogin}
            selectedUsername={vm.loginAuth.selectedUsername}
            setSelectedUsername={vm.loginAuth.setSelectedUsername}
            password={vm.loginAuth.password}
            setPassword={vm.loginAuth.setPassword}
            employeeList={vm.loginAuth.employeeList}
            isLoading={vm.loginAuth.isLoading}
            error={vm.loginAuth.error}
            onAuth={() => vm.loginAuth.login(vm.handleLoginSuccess)}
            onCancel={() => vm.loginAuth.cancelLogin(vm.handleLoginCancel)}
          />
          <EmployeeMenuModal
            isOpen={vm.showEmployeeMenu}
            onInspectionClick={vm.handleInspectionClick}
            onProductsClick={vm.handleProductsClick}
            onResetClick={vm.handleResetClick}
            onClose={vm.handleEmployeeMenuClose}
          />
          <HelpModal isOpen={vm.showHelpModal} onClose={vm.handleHelpClose} />
        </section>

        <aside className="bg-white border-[6px] border-[#D9DADD] rounded-xl flex flex-col shadow-sm overflow-hidden">
          <Sidebar
            items={vm.cartItems}
            customerCard={vm.customerCard}
            customerName={vm.customerName}
            appliedVoucher={vm.appliedVoucher}
            editable={vm.isSummary}
            onUpdateQuantity={vm.handleUpdateQuantity}
            onRemoveItem={vm.handleRemoveItem}
          />
        </aside>
      </main>
    </div>
  )
}
