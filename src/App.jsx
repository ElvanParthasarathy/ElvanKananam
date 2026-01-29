import React, { useState, useEffect } from 'react';
import BillEditor from './components/BillEditor/BillEditor';
import BillPreview from './components/BillPreview/BillPreview';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import SilksEditor from './components/Silks/SilksEditor';
import SilksPreview from './components/Silks/SilksPreview';
import ElvanInvoice from './components/Silks/ElvanInvoice';
import ElvanEditor from './components/Silks/ElvanEditor';
import SilksDashboard from './components/Silks/SilksDashboard';
import { getCompanyConfig, getCompanyOptions, DEFAULT_COMPANY_ID } from './config';
import { getTranslation, DEFAULT_LANGUAGE } from './config/translations';
import { isAuthenticated, login, logout } from './config/auth';
import { getCurrentDate } from './utils/calculations';

// ... (Rest of imports unchanged)

/**
 * Main App Component
 * 
 * Manages authentication, view state, language, theme, and bill data
 */
function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // Handle login
  const handleLogin = (email, password) => {
    const result = login(email, password);
    if (result.success) {
      setIsLoggedIn(true);
    }
    return result;
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  // View State
  const [viewMode, setViewMode] = useState('home'); // 'home' | 'edit' | 'preview'
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  // Company State
  const [companyId, setCompanyId] = useState(DEFAULT_COMPANY_ID);
  const companyConfig = getCompanyConfig(companyId);
  const companyOptions = getCompanyOptions();

  // Translation
  const t = getTranslation(language);

  // Theme - 'light' | 'auto' | 'dark'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('elvan-theme');
    return saved || 'auto'; // Default to auto
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('elvan-theme', theme);
  }, [theme]);

  // Bill Data State
  const [billNo, setBillNo] = useState(companyConfig.defaultBillNo);
  const [date, setDate] = useState(getCurrentDate());
  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('');
  const [items, setItems] = useState([{ porul: '', coolie: '', kg: '' }]);
  const [setharamGrams, setSetharamGrams] = useState('');
  const [courierRs, setCourierRs] = useState('');
  const [ahimsaSilkRs, setAhimsaSilkRs] = useState('');
  const [customChargeName, setCustomChargeName] = useState('');
  const [customChargeRs, setCustomChargeRs] = useState('');

  // State for Silks Bill
  const [silksData, setSilksData] = useState(null);

  // Load Test Data Helper
  const loadTestData = () => {
    setBillNo('13');
    setDate('15/12/2025');
    setCustomerName('சுந்தரி சில்க்ஸ் இந்தியா');
    setCity('திருச்சேறை, கும்பகோனம்');
    setItems([
      { porul: 'ஒண்டி தடை செய்ய கூலி', kg: '13.850', coolie: '660' },
      { porul: 'மூன்று இழை சப்புரி செய்ய கூலி', kg: '21.720', coolie: '430' }
    ]);
    setSetharamGrams('1680');
    setCourierRs('760');
    setAhimsaSilkRs(''); // Default empty for test
    setCustomChargeName('');
    setCustomChargeRs('');
  };

  // Reset Data Helper
  const resetData = () => {
    setBillNo(companyConfig.defaultBillNo);
    setDate(getCurrentDate());
    setCustomerName('');
    setCity('');
    setItems([{ porul: '', coolie: '', kg: '' }]);
    setSetharamGrams('');
    setCourierRs('');
    setAhimsaSilkRs('');
    setCustomChargeName('');
    setCustomChargeRs('');
  };

  // Show login if not authenticated
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} t={t} />;
  }

  return (
    <>
      {/* Logout Button */}
      {viewMode === 'home' && (
        <Home
          t={t}
          onNavigate={setViewMode}
          onLogout={handleLogout}
        />
      )}

      {viewMode === 'edit' && (
        <BillEditor
          config={companyConfig}
          t={t}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          billNo={billNo}
          setBillNo={setBillNo}
          date={date}
          setDate={setDate}
          customerName={customerName}
          setCustomerName={setCustomerName}
          city={city}
          setCity={setCity}
          items={items}
          setItems={setItems}
          setharamGrams={setharamGrams}
          setSetharamGrams={setSetharamGrams}
          courierRs={courierRs}
          setCourierRs={setCourierRs}
          ahimsaSilkRs={ahimsaSilkRs}
          setAhimsaSilkRs={setAhimsaSilkRs}
          customChargeName={customChargeName}
          setCustomChargeName={setCustomChargeName}
          customChargeRs={customChargeRs}
          setCustomChargeRs={setCustomChargeRs}
          onPreview={() => setViewMode('preview')}
          onHome={() => setViewMode('home')} // Add onHome prop
          onLoadTestData={loadTestData}
          onResetData={resetData}
          companyId={companyId}
          setCompanyId={setCompanyId}
          companyOptions={companyOptions}
        />
      )}

      {viewMode === 'preview' && (
        <BillPreview
          config={companyConfig}
          t={t}
          billNo={billNo}
          date={date}
          customerName={customerName}
          city={city}
          items={items}
          setharamGrams={setharamGrams}
          courierRs={courierRs}
          ahimsaSilkRs={ahimsaSilkRs}
          customChargeName={customChargeName}
          customChargeRs={customChargeRs}
          onEdit={() => setViewMode('edit')}
        />
      )}

      {viewMode === 'silks-dashboard' && (
        <SilksDashboard
          onHome={() => setViewMode('home')}
          onNewInvoice={() => {
            setSilksData(null);
            setViewMode('elvan-editor'); // Direct to New Elvan Editor
          }}
          onSelectInvoice={(invoice) => {
            setSilksData(invoice);
            // setViewMode('elvan-editor'); // Old: Direct to Edit
            setViewMode('invoice-viewer'); // New: View Preview first
          }}
        />
      )}

      {viewMode === 'silks-editor' && (
        <SilksEditor
          onHome={() => setViewMode('silks-dashboard')}
          onPreview={() => setViewMode('silks-preview')}
          setData={setSilksData}
          initialData={silksData}
        />
      )}

      {viewMode === 'elvan-editor' && (
        <ElvanEditor
          onHome={() => setViewMode('silks-dashboard')}
          onPreview={() => setViewMode('silks-preview')}
          setData={setSilksData}
          initialData={silksData}
        />
      )}

      {/* Preview from Editor (Back goes to Editor) */}
      {viewMode === 'silks-preview' && (
        silksData?.template === 'elvan' ? (
          <ElvanInvoice
            data={silksData}
            onEdit={() => setViewMode('elvan-editor')} // Back to Elvan Editor
            onBack={() => setViewMode('elvan-editor')}
          />
        ) : (
          <SilksPreview
            data={silksData}
            onEdit={() => setViewMode('silks-editor')} // Back to Classic Editor
          />
        )
      )}

      {/* Viewer from Dashboard (Back goes to Dashboard) */}
      {viewMode === 'invoice-viewer' && (
        silksData?.template === 'elvan' || !silksData?.template ? ( // Default to Elvan if template missing
          <ElvanInvoice
            data={silksData}
            onEdit={() => setViewMode('elvan-editor')}
            onBack={() => setViewMode('silks-dashboard')}
          />
        ) : (
          <SilksPreview
            data={silksData}
            onEdit={() => setViewMode('silks-editor')}
          />
        )
      )}
    </>
  );
}

export default App;
