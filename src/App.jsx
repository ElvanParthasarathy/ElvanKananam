import React, { useState, useEffect } from 'react';
import BillEditor from './components/BillEditor/BillEditor';
import BillPreview from './components/BillPreview/BillPreview';
import Login from './components/Login/Login';
import companyConfig from './config';
import { getTranslation, DEFAULT_LANGUAGE } from './config/translations';
import { isAuthenticated, login, logout } from './config/auth';
import { getCurrentDate } from './utils/calculations';

/**
 * Logout Icon Component
 */
const IconLogout = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

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

  // View Mode
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'

  // Language
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE); // 'ta' | 'en'
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

  // Show login if not authenticated
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} t={t} />;
  }

  return (
    <>
      {/* Logout Button */}
      <button
        className="logout-btn"
        onClick={handleLogout}
        aria-label="Logout"
        title="Logout"
      >
        <IconLogout size={18} />
      </button>

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
          onPreview={() => setViewMode('preview')}
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
          onEdit={() => setViewMode('edit')}
        />
      )}
    </>
  );
}

export default App;
