import React, { useState, useEffect } from 'react';
import BillEditor from './components/BillEditor/BillEditor';
import BillPreview from './components/BillPreview/BillPreview';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import SilksEditor from './components/Silks/SilksEditor';
import SilksPreview from './components/Silks/SilksPreview';
import SilksDashboard from './components/Silks/SilksDashboard';
import CoolieDashboard from './components/Coolie/CoolieDashboard';
import Settings from './components/Settings/Settings';
import Layout from './components/common/Layout';
import { DEFAULT_COMPANY_ID } from './config';
import { getTranslation, DEFAULT_LANGUAGE, showSubtitles } from './config/translations';
import { isAuthenticated, login, logout } from './config/auth';
import { getCurrentDate } from './utils/calculations';
import { useToast } from './context/ToastContext';
import { useConfirm } from './context/ConfirmContext';

// ... (Rest of imports unchanged)

/**
 * Main App Component
 * 
 * Manages authentication, view state, language, theme, and bill data
 */
function App() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
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

  // View State - Load from URL hash or default to home
  const [viewMode, setViewMode] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    return 'home';
  });

  const [language, setLanguage] = useState(() => {
    let saved = localStorage.getItem('elvan-language');
    // Migrate legacy keys to new modular modes
    if (saved === 'ta') saved = 'ta_mixed';
    if (saved === 'tg') saved = 'tg_mixed';
    if (saved === 'en') saved = 'en_only';

    return saved || DEFAULT_LANGUAGE;
  });

  const t = getTranslation(language);

  // Persist language change
  useEffect(() => {
    localStorage.setItem('elvan-language', language);
  }, [language]);

  // Update Document Title based on language
  useEffect(() => {
    document.title = t.appName || 'Kananam';
  }, [t.appName]);

  // Company State
  const [companyId, setCompanyId] = useState(DEFAULT_COMPANY_ID);
  const [companyConfig, setCompanyConfig] = useState(null);
  const [companyOptions, setCompanyOptions] = useState([]);

  // Fetch Company Function (can be called manually to refresh)
  const fetchCompany = async () => {
    const { supabase } = await import('./config/supabaseClient');

    let orgs = [];
    try {
      const { data, error } = await supabase.from('coolie_settings').select('*');
      if (error) {
        console.warn("Could not fetch organizations. Tables might be missing.", error);
      } else {
        orgs = data;
      }

      if (orgs && orgs.length > 0) {
        // Map to options
        const options = orgs.map(org => ({
          id: org.id,
          name: org.organization_name,
          nameTamil: org.marketing_title,
          type: org.type || 'coolie' // Default to coolie if null
        }));
        setCompanyOptions(options);
      }
    } catch (err) {
      console.warn("Supabase fetch failed", err);
    }

    // Find selected company
    let selected;
    if (orgs && orgs.length > 0) {
      selected = orgs.find(o => o.organization_name.includes('P.V.S.'));
      if (companyId && companyId !== DEFAULT_COMPANY_ID && companyId.length > 20) {
        selected = orgs.find(o => o.id === companyId);
      }
      if (!selected) selected = orgs[0]; // Fallback
    }

    // Default mock if DB is empty to prevent crash
    if (!selected) {
      selected = {
        id: DEFAULT_COMPANY_ID,
        organization_name: 'Default Organization',
        marketing_title: 'Marketing Title',
        address_line1: 'Address',
        address_line2: '',
        city: 'City',
        pincode: '000000',
        phone: '0000000000',
        email: 'email@example.com',
        cgst_rate: 2.5,
        sgst_rate: 2.5
      };
    }

    // Parse Bank Data from New Columns
    let bankInfo = {
      bankName: selected.bank_name || '',
      bankNameTamil: selected.bank_name_tamil || '',
      accountNo: selected.account_no || '',
      ifsc: selected.ifsc_code || '',
      place: selected.branch || '',
      placeTamil: selected.branch_tamil || '',
      cityTamil: selected.city_tamil || ''
    };

    // Legacy fallback
    if (!bankInfo.bankName && selected.website) {
      try {
        const json = JSON.parse(selected.website);
        if (typeof json === 'object') {
          bankInfo = { ...bankInfo, ...json };
        }
      } catch (e) { }
    }

    const bankParts = [];
    const displayBankName = bankInfo.bankNameTamil || bankInfo.bankName;
    const displayBranch = bankInfo.placeTamil || bankInfo.place;
    if (displayBankName) bankParts.push(displayBankName);
    if (displayBranch) bankParts.push(displayBranch);
    const bankDetailsString = bankParts.join(', ');

    const themeColor = selected.theme_color || '#388e3c';

    // Theme mapping for professional look
    const themeMap = {
      '#388e3c': { // Green
        primary: '#388e3c',
        headerBg: '#e8f5e9'
      },
      '#6a1b9a': { // Violet
        primary: '#6a1b9a',
        headerBg: '#f3e5f5'
      }
    };

    const currentTheme = themeMap[themeColor] || { primary: themeColor, headerBg: `${themeColor}15` };

    const config = {
      id: selected.id,
      name: {
        english: selected.organization_name,
        tamil: selected.marketing_title || 'பி.வி.எஸ். சில்க் டுவிஸ்டிங்'
      },
      greeting: 'வாழ்க வளமுடன்',
      billType: 'கூலி பில்',
      address: {
        line1: selected.address_line1 || '',
        line2: selected.address_line2 ? `${selected.address_line2}, ${selected.city_tamil || bankInfo.cityTamil} - ${selected.pincode}` : '',
        line3: selected.district_tamil || ''
      },
      phone: selected.phone ? selected.phone.split(',') : [],
      email: selected.email,
      bankDetails: bankDetailsString,
      accountNo: bankInfo.accountNo || '',
      ifscCode: bankInfo.ifsc || '',
      labels: {
        billNo: 'பில் எண்',
        date: 'நாள்',
        customerPrefix: 'திரு:',
        cityPrefix: 'ஊர்:',
        rate: 'கூலி',
        itemName: 'பொருள் பெயர்',
        weight: 'எடை (Kg)',
        amount: 'ரூபாய்',
        total: 'மொத்தம்',
        inWords: 'எழுத்தில் மொத்தத் தொகை',
        setharam: 'சேதாரம்',
        courier: 'கொரியர் கட்டணம்',
        ahimsaSilk: 'அகிம்சா பட்டு',
        signature: 'கையொப்பம்',
        forCompany: selected.organization_name
      },
      colors: {
        primary: currentTheme.primary,
        accent: currentTheme.primary,
        headerBg: currentTheme.headerBg,
        text: currentTheme.primary,
        textDark: currentTheme.primary,
        border: currentTheme.primary,
        inputBg: '#f9f9f9',
        inputFocus: currentTheme.primary
      },
      defaultBillNo: '1',
      cgst_rate: selected.cgst_rate || 0,
      sgst_rate: selected.sgst_rate || 0
    };
    setCompanyConfig(config);
    setCompanyId(selected.id);
  };

  // Load Company from DB on mount or ID change
  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  // Wait for config
  // MOVED TO BOTTOM TO PREVENT HOOK ERRORS
  // if (!companyConfig) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading Configuration...</div>;

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
  const [billNo, setBillNo] = useState(''); // Initialize empty, update when config loads
  const [date, setDate] = useState(getCurrentDate());
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState(''); // Secondary name for 'Both' mode
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Store full customer object
  const [nameDisplayMode, setNameDisplayMode] = useState('both');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [items, setItems] = useState([{ porul: '', coolie: '', kg: '' }]);
  const [setharamGrams, setSetharamGrams] = useState('');
  const [courierRs, setCourierRs] = useState('');
  const [ahimsaSilkRs, setAhimsaSilkRs] = useState('');
  const [customChargeName, setCustomChargeName] = useState('');
  const [customChargeRs, setCustomChargeRs] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [accountNo, setAccountNo] = useState('');

  // State for Silks Bill
  const [silksData, setSilksData] = useState(null);

  // Coolie Bill ID (for editing)
  const [currentBillId, setCurrentBillId] = useState(null);

  // State for IFSC Visibility in Preview (Persisted)
  const [showIFSC, setShowIFSC] = useState(() => {
    const saved = localStorage.getItem('elvan-show-ifsc');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('elvan-show-ifsc', JSON.stringify(showIFSC));
  }, [showIFSC]);

  // State for Bank Details Visibility in Preview (Persisted)
  const [showBankDetails, setShowBankDetails] = useState(() => {
    const saved = localStorage.getItem('elvan-show-bank-details');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('elvan-show-bank-details', JSON.stringify(showBankDetails));
  }, [showBankDetails]);

  // Update defaults when config loads (or company changes)
  useEffect(() => {
    if (companyConfig) {
      // For general defaults, only set if empty (prevents overwriting during manual edit)
      setBillNo(prev => prev || companyConfig.defaultBillNo);

      // FOR BANK DETAILS: If we are not editing an existing bill (no currentBillId), 
      // ALWAYS update bank details to match the selected organization
      if (!currentBillId) {
        setBankDetails(companyConfig.bankDetails);
        setAccountNo(companyConfig.accountNo || '');
      } else {
        // If editing an existing bill, only set if current state is empty
        setBankDetails(prev => prev || companyConfig.bankDetails);
        setAccountNo(prev => prev || companyConfig.accountNo || '');
      }
    }
  }, [companyConfig, currentBillId]);

  // ... (rest of code)

  {/* VIEW: COOLIE BILL (New/Edit) */ }
  {
    (viewMode === 'coolie-new' || viewMode === 'edit') && (
      <BillEditor
        config={companyConfig}
        t={t}
        language={language}
        // ... (other props)
        accountNo={accountNo}
        setAccountNo={setAccountNo}
        showIFSC={showIFSC}
        setShowIFSC={setShowIFSC}
        onPreview={() => setViewMode('coolie-preview')}
      // ...
      />
    )
  }

  {/* VIEW: COOLIE BILL (Preview) */ }
  {
    (viewMode === 'coolie-preview' || viewMode === 'preview') && (
      <BillPreview
        config={companyConfig}
        // ...
        accountNo={accountNo}
        showIFSC={showIFSC}

        onEdit={() => setViewMode('coolie-new')}
      />
    )
  }


  // Update URL Hash for back button support
  useEffect(() => {
    if (window.location.hash !== `#${viewMode}`) {
      window.history.pushState({ viewMode }, '', `#${viewMode}`);
    }
  }, [viewMode]);

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

  // View Transition Cleanup: Clear data when "going out" of editor
  const prevViewMode = React.useRef(viewMode);
  useEffect(() => {
    const prev = prevViewMode.current;
    const curr = viewMode;

    const isEditor = (mode) => mode === 'coolie-new' || mode === 'edit';
    const isPreview = (mode) => mode === 'coolie-preview' || mode === 'preview';

    // If we were in Editor, and we are NOT going to Preview (and not staying in Editor e.g. mode switch)
    if (isEditor(prev) && !isPreview(curr) && !isEditor(curr)) {
      resetData();
    }

    prevViewMode.current = curr;
  }, [viewMode]);



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
    // Keep existing bank details from config
    // setBankDetails('Indian Bank, Arni'); 
    // setAccountNo('1234567890');
  };

  const resetData = () => {
    setCurrentBillId(null);
    setBillNo(companyConfig?.defaultBillNo || '1');
    setDate(getCurrentDate());
    setCustomerName('');
    setContactPerson('');
    setNameDisplayMode('both');
    setAddress('');
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

  // Load Coolie Bill
  const loadCoolieBill = (bill) => {
    setCurrentBillId(bill.id);
    setBillNo(bill.bill_no);
    setDate(bill.date);
    setCustomerName(bill.customer_name);
    setContactPerson(bill.contact_person || '');
    setAddress(bill.address || '');
    setCity(bill.city);
    setItems(bill.items || []);
    setSetharamGrams(bill.setharam_grams || '');
    setCourierRs(bill.courier_rs || '');
    setAhimsaSilkRs(bill.ahimsa_silk_rs || '');
    setCustomChargeName(bill.custom_charge_name || '');
    setCustomChargeRs(bill.custom_charge_rs || '');
    setAccountNo(bill.account_no || '');
    setBankDetails(bill.bank_details || '');
  };

  // Local Storage Auto-Save (Crash Safety)
  useEffect(() => {
    if (viewMode === 'coolie-new' || viewMode === 'edit') {
      const draft = {
        billNo, customerName, contactPerson, nameDisplayMode, address, city, items, setharamGrams, courierRs,
        ahimsaSilkRs, customChargeName, customChargeRs, bankDetails, accountNo
      };
      localStorage.setItem('coolie-draft', JSON.stringify(draft));
    }
  }, [billNo, customerName, contactPerson, nameDisplayMode, address, city, items, setharamGrams, courierRs, ahimsaSilkRs, customChargeName, customChargeRs, bankDetails, accountNo, viewMode]);

  // Draft restoration disabled per user request
  // useEffect(() => {
  //   if (viewMode === 'coolie-new' && !currentBillId) {
  //     const saved = localStorage.getItem('coolie-draft');
  //     if (saved) { ... }
  //   }
  // }, [viewMode, currentBillId]);


  // Auto-Save Effect (Coolie Bill)
  useEffect(() => {
    // Only auto-save if we are in an editor view
    if (viewMode !== 'coolie-new' && viewMode !== 'edit') return;

    const timer = setTimeout(() => {
      if (billNo && customerName) {
        saveCoolieBill(true); // Silent save
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    billNo, customerName, contactPerson, address, city, items, setharamGrams, courierRs,
    ahimsaSilkRs, customChargeName, customChargeRs, bankDetails, accountNo,
    viewMode // vital: only save when editing
  ]);

  // Save Coolie Bill
  const saveCoolieBill = async (silent = false) => {
    const { supabase } = await import('./config/supabaseClient');

    // Validation
    if (!billNo || !customerName) {
      if (!silent) showToast('Please enter at least a Bill Number and Customer Name to save.', 'warning');
      return;
    }

    const billData = {
      bill_no: billNo,
      date,
      customer_name: customerName,
      contact_person: contactPerson,
      address,
      city,
      items,
      setharam_grams: setharamGrams,
      courier_rs: courierRs,
      ahimsa_silk_rs: ahimsaSilkRs,
      custom_charge_name: customChargeName,
      custom_charge_rs: customChargeRs,
      bank_details: bankDetails,
      account_no: accountNo,
    };

    // If editing an existing bill, just update it
    if (currentBillId) {
      const { error } = await supabase.from('coolie_bills').update(billData).eq('id', currentBillId);
      if (error) {
        if (!silent) showToast('Error saving: ' + error.message, 'error');
      } else if (!silent) {
        showToast('Bill Updated Successfully!', 'success');
      }
      return;
    }

    // New bill - Check for existing bill with same bill number
    const { data: existing } = await supabase
      .from('coolie_bills')
      .select('id')
      .eq('bill_no', billNo)
      .maybeSingle();

    if (existing) {
      // Bill with same number already exists
      if (silent) {
        // Auto-save: Silently update the existing bill instead of creating duplicate
        const { error } = await supabase.from('coolie_bills').update(billData).eq('id', existing.id);
        if (!error) {
          setCurrentBillId(existing.id); // Track this as the current bill
          localStorage.removeItem('coolie-draft');
        }
        return;
      }

      // Manual save: Ask user if they want to overwrite
      const shouldOverwrite = await confirm({
        title: 'நகல் பில் கண்டறியப்பட்டது',
        message: `Bill No ${billNo} ஏற்கனவே உள்ளது. அதை மேலெழுத விரும்புகிறீர்களா? \n(Bill No ${billNo} already exists. Do you want to overwrite it?)`,
        confirmText: 'மேலெழுத / Overwrite',
        cancelText: 'ரத்து / Cancel',
        type: 'danger'
      });

      if (shouldOverwrite) {
        const { error } = await supabase.from('coolie_bills').update(billData).eq('id', existing.id);
        if (error) showToast('Error saving: ' + error.message, 'error');
        else {
          showToast('Bill Overwritten Successfully!', 'success');
          setCurrentBillId(existing.id);
          localStorage.removeItem('coolie-draft');
        }
      }
      return; // Exit regardless of user's choice
    }

    // No duplicate - Insert new bill
    const { data, error } = await supabase.from('coolie_bills').insert([billData]).select().single();
    if (error) {
      if (!silent) showToast('Error saving: ' + error.message, 'error');
    } else {
      if (!silent) showToast('Bill Saved Successfully!', 'success');
      setCurrentBillId(data.id);
      localStorage.removeItem('coolie-draft');
    }
  };

  // Show login if not authenticated
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} t={t} />;
  }

  if (!companyConfig) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading Configuration...</div>;

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
            language={language}
            onNavigate={setViewMode}
          />
        )}

        {/* VIEW: COOLIE BILL (Dashboard) */}
        {(viewMode === 'coolie-dashboard' || viewMode === 'coolie-bills' || viewMode === 'coolie-items' || viewMode === 'coolie-customers' || viewMode === 'coolie-business') && (
          <CoolieDashboard
            activeTab={viewMode.split('-')[1] || 'dashboard'}
            t={t}
            language={language}
            onNewBill={() => {
              resetData();
              setViewMode('coolie-new');
            }}
            onHome={() => setViewMode('home')}
            onSelectBill={(bill) => {
              loadCoolieBill(bill);
              setViewMode('coolie-new'); // Go straight to editor
            }}
            onRefreshConfig={fetchCompany}
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
            contactPerson={contactPerson}
            setContactPerson={setContactPerson}
            nameDisplayMode={nameDisplayMode}
            setNameDisplayMode={setNameDisplayMode}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            address={address}
            setAddress={setAddress}
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
            showIFSC={showIFSC}
            setShowIFSC={setShowIFSC}
            showBankDetails={showBankDetails}
            setShowBankDetails={setShowBankDetails}
            onPreview={() => setViewMode('coolie-preview')}
            onHome={() => setViewMode('home')}
            onLoadTestData={loadTestData}
            onResetData={resetData}
            companyId={companyId}
            setCompanyId={setCompanyId}
            companyOptions={companyOptions.filter(opt => opt.type === 'coolie')}
            onSave={() => saveCoolieBill(false)}
          />
        )}

        {/* VIEW: COOLIE BILL (Preview) */}
        {(viewMode === 'coolie-preview' || viewMode === 'preview') && (
          <BillPreview
            config={companyConfig}
            t={t}
            language={language}
            billNo={billNo}
            date={date}
            customerName={customerName}
            contactPerson={contactPerson}
            address={address}
            city={city}
            items={items}
            setharamGrams={setharamGrams}
            courierRs={courierRs}
            ahimsaSilkRs={ahimsaSilkRs}
            customChargeName={customChargeName}
            customChargeRs={customChargeRs}
            bankDetails={bankDetails}
            accountNo={accountNo}
            showIFSC={showIFSC}
            showBankDetails={showBankDetails}

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
              setViewMode('silks-new');
            }}
            t={t}
            language={language}
          />
        )}

        {/* VIEW: SILKS (New/Edit) */}
        {(viewMode === 'silks-new' || viewMode === 'elvan-editor' || viewMode === 'silks-editor') && (
          <SilksEditor
            onHome={() => setViewMode('silks-dashboard')}
            onPreview={() => setViewMode('silks-preview')}
            setData={setSilksData}
            initialData={silksData}
            t={t}
            language={language}
          />
        )}

        {/* VIEW: SILKS (Preview/Viewer) */}
        {(viewMode === 'silks-preview' || viewMode === 'silks-viewer' || viewMode === 'invoice-viewer') && (
          <SilksPreview
            data={silksData}
            onEdit={() => setViewMode('silks-new')}
            onBack={() => setViewMode('silks-dashboard')}
            t={t}
            language={language}
          />
        )}

        {/* VIEW: SETTINGS */}
        {viewMode === 'settings' && (
          <Settings
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            onLogout={handleLogout}
            t={t}
          />
        )}

      </Layout>
    </>
  );
}

export default App;
