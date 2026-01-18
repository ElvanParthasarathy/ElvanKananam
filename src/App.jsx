import React, { useState, useEffect } from 'react';
import BillEditor from './components/BillEditor/BillEditor';
import BillPreview from './components/BillPreview/BillPreview';
import companyConfig from './config';
import { getTranslation, DEFAULT_LANGUAGE } from './config/translations';
import { getCurrentDate } from './utils/calculations';

/**
 * Main App Component
 * 
 * Manages view state (edit/preview), language, theme, and bill data
 */
function App() {
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

  return (
    <>
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
