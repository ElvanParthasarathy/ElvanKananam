import React, { useState, useEffect } from 'react';
import BillEditor from './components/BillEditor/BillEditor';
import BillPreview from './components/BillPreview/BillPreview';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import SilksEditor from './components/Silks/SilksEditor';
import SilksPreview from './components/Silks/SilksPreview';
import SilksDashboard from './components/Silks/SilksDashboard';
import CoolieDashboard from './components/Coolie/CoolieDashboard';
import Layout from './components/common/Layout';
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

  // View State - Load from URL hash or localStorage or default
  const [viewMode, setViewMode] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    return localStorage.getItem('elvan-viewMode') || 'home';
  });

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

  // Bill Data State - Load from localStorage if available
  const [billNo, setBillNo] = useState(() => localStorage.getItem('elvan-billNo') || companyConfig.defaultBillNo);
  const [date, setDate] = useState(() => localStorage.getItem('elvan-date') || getCurrentDate());
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('elvan-customerName') || '');
  const [city, setCity] = useState(() => localStorage.getItem('elvan-city') || '');
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('elvan-items');
    return saved ? JSON.parse(saved) : [{ porul: '', coolie: '', kg: '' }];
  });
  const [setharamGrams, setSetharamGrams] = useState(() => localStorage.getItem('elvan-setharamGrams') || '');
  const [courierRs, setCourierRs] = useState(() => localStorage.getItem('elvan-courierRs') || '');
  const [ahimsaSilkRs, setAhimsaSilkRs] = useState(() => localStorage.getItem('elvan-ahimsaSilkRs') || '');
  const [customChargeName, setCustomChargeName] = useState(() => localStorage.getItem('elvan-customChargeName') || '');
  const [customChargeRs, setCustomChargeRs] = useState(() => localStorage.getItem('elvan-customChargeRs') || '');
  const [bankDetails, setBankDetails] = useState(() => localStorage.getItem('elvan-bankDetails') || '');
  const [accountNo, setAccountNo] = useState(() => localStorage.getItem('elvan-accountNo') || '');

  // State for Silks Bill
  const [silksData, setSilksData] = useState(() => {
    const saved = localStorage.getItem('elvan-silksData');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist State to localStorage on Change
  useEffect(() => {
    localStorage.setItem('elvan-viewMode', viewMode);
    localStorage.setItem('elvan-billNo', billNo);
    localStorage.setItem('elvan-date', date);
    localStorage.setItem('elvan-customerName', customerName);
    localStorage.setItem('elvan-city', city);
    localStorage.setItem('elvan-items', JSON.stringify(items));
    localStorage.setItem('elvan-setharamGrams', setharamGrams);
    localStorage.setItem('elvan-courierRs', courierRs);
    localStorage.setItem('elvan-ahimsaSilkRs', ahimsaSilkRs);
    localStorage.setItem('elvan-customChargeName', customChargeName);
    localStorage.setItem('elvan-customChargeRs', customChargeRs);
    localStorage.setItem('elvan-bankDetails', bankDetails);
    localStorage.setItem('elvan-accountNo', accountNo);
    localStorage.setItem('elvan-silksData', JSON.stringify(silksData));

    // Update URL Hash for back button support
    if (window.location.hash !== `#${viewMode}`) {
      window.history.pushState({ viewMode }, '', `#${viewMode}`);
    }
  }, [viewMode, billNo, date, customerName, city, items, setharamGrams, courierRs, ahimsaSilkRs, customChargeName, customChargeRs, silksData]);

  // Handle Browser Back Button (popstate)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.viewMode) {
        setViewMode(event.state.viewMode);
      } else {
        // Fallback to hash if state is missing
        const hash = window.location.hash.replace('#', '');
        if (hash) setViewMode(hash);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Prevent accidental data loss on refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasData = customerName || (items.length > 0 && items[0].porul);
      if (hasData && (viewMode === 'edit' || viewMode === 'coolie-new' || viewMode === 'silks-new')) {
        e.preventDefault();
        e.returnValue = ''; // Standard way to show confirmation
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [customerName, items, viewMode]);

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
    setBankDetails('Indian Bank, Arni');
    setAccountNo('1234567890');
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
    setBankDetails('');
    setAccountNo('');
  };

  // Show login if not authenticated
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} t={t} />;
  }

  return (
    <>
      {/* Layout Wrapper */}
      <Layout
        viewMode={viewMode}
        setViewMode={setViewMode}
        onLogout={handleLogout}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        t={t}
      >

        {/* VIEW: HOME */}
        {viewMode === 'home' && (
          <Home
            t={t}
            onNavigate={setViewMode}
          />
        )}

        {/* VIEW: COOLIE BILL (Dashboard) */}
        {viewMode === 'coolie-dashboard' && (
          <CoolieDashboard
            onNewBill={() => setViewMode('coolie-new')}
            onHome={() => setViewMode('home')}
          />
        )}

        {/* VIEW: COOLIE BILL (New/Edit) */}
        {(viewMode === 'coolie-new' || viewMode === 'edit') && (
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
            bankDetails={bankDetails}
            setBankDetails={setBankDetails}
            accountNo={accountNo}
            setAccountNo={setAccountNo}
            onPreview={() => setViewMode('coolie-preview')}
            onHome={() => setViewMode('home')}
            onLoadTestData={loadTestData}
            onResetData={resetData}
            companyId={companyId}
            setCompanyId={setCompanyId}
            companyOptions={companyOptions}
          />
        )}

        {/* VIEW: COOLIE BILL (Preview) */}
        {(viewMode === 'coolie-preview' || viewMode === 'preview') && (
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
            bankDetails={bankDetails}
            accountNo={accountNo}
            onEdit={() => setViewMode('coolie-new')}
          />
        )}

        {/* VIEW: SILKS (Dashboard/List) */}
        {(viewMode === 'silks-dashboard' || viewMode === 'silks-items' || viewMode === 'silks-customers' || viewMode === 'silks-business') && (
          <SilksDashboard
            activeTab={viewMode.split('-')[1] || 'home'}
            onHome={() => setViewMode('home')}
            onNewInvoice={() => {
              setSilksData(null);
              setViewMode('silks-new');
            }}
            onSelectInvoice={(invoice) => {
              setSilksData(invoice);
              setViewMode('silks-viewer');
            }}
          />
        )}

        {/* VIEW: SILKS (New/Edit) */}
        {(viewMode === 'silks-new' || viewMode === 'elvan-editor' || viewMode === 'silks-editor') && (
          <SilksEditor
            onHome={() => setViewMode('silks-dashboard')}
            onPreview={() => setViewMode('silks-preview')}
            setData={setSilksData}
            initialData={silksData}
          />
        )}

        {/* VIEW: SILKS (Preview/Viewer) */}
        {(viewMode === 'silks-preview' || viewMode === 'silks-viewer' || viewMode === 'invoice-viewer') && (
          <SilksPreview
            data={silksData}
            onEdit={() => setViewMode('silks-new')}
            onBack={() => setViewMode('silks-dashboard')}
          />
        )}

      </Layout>
    </>
  );
}

export default App;
