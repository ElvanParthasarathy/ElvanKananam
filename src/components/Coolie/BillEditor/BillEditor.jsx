import { IconSave, IconTrash, IconDatabase, IconPrinter, IconX, IconPlus, IconRefresh, IconFiles } from '../../common/Icons';
import Autocomplete from '../../common/Autocomplete';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { showSubtitles } from '../../../config/translations';
import '../../Coolie/Coolie.css';
import './BillEditor.css';

/**
 * BillEditor Component - Zoho Invoice Clone (Restored & Safe)
 * 
 * Pixel-perfect form with defensive checks to prevent white-screen crashes.
 */
function BillEditor({
    config = {},
    t = {},
    language = 'en',
    setLanguage,
    previewLanguage = 'ta_mixed',
    setPreviewLanguage,
    theme,
    setTheme,
    billNo = '',
    setBillNo,
    date = '',
    setDate,
    customerName = '',
    setCustomerName,
    contactPerson = '',
    setContactPerson,
    nameDisplayMode = 'both',
    setNameDisplayMode,
    selectedCustomer,
    setSelectedCustomer,
    address = '',
    setAddress,
    city = '',
    setCity,
    items = [],
    setItems,
    setharamGrams = '',
    setSetharamGrams,
    courierRs = '',
    setCourierRs,
    ahimsaSilkRs = '',
    setAhimsaSilkRs,
    customChargeName = '',
    setCustomChargeName,
    customChargeRs = '',
    setCustomChargeRs,
    bankDetails = '',
    setBankDetails,
    accountNo = '',
    setAccountNo,
    onPreview,
    onHome,
    onLoadTestData,
    onResetData,
    companyId,
    setCompanyId,

    companyOptions = [],
    onSave,
    showIFSC,
    setShowIFSC,
    showBankDetails,
    setShowBankDetails
}) {
    const showSubs = showSubtitles(language);

    // Defensively ensure items is an array
    const safeItems = Array.isArray(items) ? items : [];

    // State for Options
    const [customerOptions, setCustomerOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);

    // Fetch Coolie Data
    useEffect(() => {
        async function fetchData() {
            // Fetch Customers (Type = Coolie)
            const { data: customers, error: customersError } = await supabase
                .from('coolie_customers')
                .select('*')
                .eq('type', 'coolie'); // Strict Filter

            if (customersError) {
                console.warn('Failed to fetch coolie customers', customersError);
            }

            // Fetch Items (Type = Coolie)
            const { data: itemsData, error: itemsError } = await supabase
                .from('coolie_items')
                .select('*')
                .eq('type', 'coolie'); // Strict Filter

            if (itemsError) {
                console.warn('Failed to fetch coolie items', itemsError);
            }

            // Process Customers for Bilingual Display
            const processedCustomers = (customers || []).map(c => {
                const tamilName = c.name_tamil || '';
                const cityDisplay = c.city_tamil || c.city;

                return {
                    ...c,
                    searchText: [
                        c.company_name_tamil,
                        c.company_name,
                        c.name_tamil,
                        c.name,
                        c.city_tamil,
                        c.city
                    ].filter(Boolean).join(' '),
                    primaryName: tamilName || c.name, // Preferred Name for Input
                    displayName: (
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2', padding: '4px 0', gap: '2px' }}>
                            {/* Company Name Section */}
                            {(c.company_name_tamil || c.company_name) && (
                                <div style={{ marginBottom: '2px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-primary)' }}>
                                        {c.company_name_tamil || c.company_name}
                                    </span>
                                    {c.company_name_tamil && c.company_name && (
                                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                                            {c.company_name}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Customer Name Section */}
                            <div>
                                <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text)' }}>
                                    {tamilName || c.name}
                                </span>
                                {tamilName && c.name && (
                                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                                        {c.name}
                                    </span>
                                )}
                            </div>

                            {/* City Section - to differentiate same business, different location */}
                            {cityDisplay && (
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                    <span style={{ fontWeight: '500' }}>{cityDisplay}</span>
                                    {c.city_tamil && c.city && (
                                        <span style={{ opacity: 0.7, marginLeft: '4px' }}>({c.city})</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                };
            });


            // Process Items for Bilingual Display
            const processedItems = (itemsData || []).map(item => {
                return {
                    ...item,
                    searchText: `${item.name_tamil || ''} ${item.name_english || ''}`.trim(),
                    displayName: (
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2', padding: '2px 0' }}>
                            <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text)' }}>
                                {item.name_tamil || item.name_english}
                            </span>
                            {item.name_tamil && item.name_english && (
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                    {item.name_english}
                                </span>
                            )}
                        </div>
                    )
                };
            });

            setCustomerOptions(processedCustomers);
            setItemOptions(processedItems);
        }
        fetchData();
    }, []);

    // Calculation Helpers
    const calculateRowTotal = (item) => {
        if (!item) return '0';
        const qty = parseFloat(item.kg) || 0;
        const rate = parseFloat(item.coolie) || 0;
        return Math.floor(qty * rate);
    };

    const calculateSubtotal = () => {
        return safeItems.reduce((sum, item) => sum + (parseFloat(calculateRowTotal(item)) || 0), 0);
    };

    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        const courier = Math.floor(parseFloat(courierRs) || 0);
        const ahimsa = Math.floor(parseFloat(ahimsaSilkRs) || 0);
        const other = Math.floor(parseFloat(customChargeRs) || 0);
        return Math.floor(subtotal + courier + ahimsa + other);
    };

    // Handlers
    const handleAddItem = () => {
        if (setItems) setItems([...safeItems, { porul: '', coolie: '', kg: '' }]);
    };

    const handleRemoveItem = (index) => {
        if (setItems) setItems(safeItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        if (setItems) {
            const newItems = [...safeItems];
            if (newItems[index]) {
                newItems[index][field] = value;
                setItems(newItems);
            }
        }
    };

    // Auto-fill Item Rate when Name Selected
    const handleItemSelect = (index, itemData) => {
        if (setItems) {
            const newItems = [...safeItems];
            if (newItems[index]) {
                // Only use Tamil name for the bill record (as requested for preview)
                // Fallback to English if Tamil is missing
                const displayName = itemData.name_tamil || itemData.name_english || '';

                newItems[index].porul = displayName;
                // Store English and Tamil names for multilingual preview
                newItems[index].name_english = itemData.name_english || '';
                newItems[index].name_tamil = itemData.name_tamil || '';

                if (itemData.rate) newItems[index].coolie = itemData.rate;
                setItems(newItems);
            }
        }
    }

    // Name Display Mode moved to App.jsx props


    const updateCustomerName = (customer, mode) => {
        if (!customer || !setCustomerName) return;

        const tamilName = customer.name_tamil || customer.name || '';
        const companyName = customer.company_name_tamil || customer.company_name || '';

        // Avoid duplicating company name as person name
        // Check against all variations to catch Tamil vs English duplicates
        const tName = (tamilName || '').trim().toLowerCase();
        const cName = (companyName || '').trim().toLowerCase();
        const rawName = (customer.name || '').trim().toLowerCase();
        const rawComp = (customer.company_name || '').trim().toLowerCase();

        let personName = tamilName;
        if (tName && (tName === cName || tName === rawComp || tName === rawName)) {
            personName = '';
        }
        // Also check if the raw tamil name (if used as person name) matches the english company name
        const rawTamilParams = (customer.name_tamil || '').trim().toLowerCase();
        if (rawTamilParams && (rawTamilParams === cName || rawTamilParams === rawComp)) {
            personName = '';
        }

        if (mode === 'company') {
            setCustomerName(companyName);
            if (setContactPerson) setContactPerson('');
        } else if (mode === 'individual') {
            // Use personName (cleared if duplicate) to ensure we don't show Company Name in the Person Name field
            setCustomerName(personName);
            if (setContactPerson) setContactPerson('');
        } else {
            // Both - Split into two fields
            setCustomerName(companyName);
            if (setContactPerson) setContactPerson(personName);
        }
    };

    const handleCustomerSelect = (customer) => {
        if (setSelectedCustomer) setSelectedCustomer(customer);

        // Auto-detect best mode
        let mode = 'individual';
        const hasCompany = !!(customer.company_name_tamil || customer.company_name);
        // Check if person name exists and is distinct from company name
        const hasPerson = !!(customer.name_tamil || (customer.name && customer.name !== customer.company_name));

        if (hasCompany) {
            if (hasPerson) {
                mode = 'both';
            } else {
                mode = 'company';
            }
        }

        setNameDisplayMode(mode);
        updateCustomerName(customer, mode);

        // Prefer Tamil Address and City
        const displayAddress = customer.address_tamil || customer.address_line1 || '';
        if (setAddress) setAddress(displayAddress);

        const displayCity = customer.city_tamil || customer.city || '';
        if (setCity) setCity(displayCity);

    };

    return (
        <div className="coolie-dashboard bill-editor-container">
            {/* Top Header */}
            <div className="coolie-header-wrapper">
                <div className="coolie-title-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 className="coolie-title">{t.newBill}</h1>
                    </div>
                    {showSubs && <span className="coolie-subtitle">Create New Bill</span>}
                </div>
                <div className="coolie-actions-group">
                    <button onClick={onHome} className="coolie-text-btn" style={{ minWidth: 'auto', padding: '0 12px' }}>
                        <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>←</span> {t.back || 'Back'}
                    </button>
                    <div className="merchant-type-toggles">
                        <button
                            onClick={() => setPreviewLanguage && setPreviewLanguage('ta_only')}
                            className={`type-toggle-btn ${previewLanguage === 'ta_only' ? 'active' : ''}`}
                        >
                            <span className="type-main-label">{t.tamil}</span>
                        </button>
                        <button
                            onClick={() => setPreviewLanguage && setPreviewLanguage('en_only')}
                            className={`type-toggle-btn ${previewLanguage === 'en_only' ? 'active' : ''}`}
                        >
                            <span className="type-main-label">{t.english}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* CARD 1: Customer & Invoice Details */}
                <div className="coolie-card" style={{ padding: '24px' }}>

                    {/* Customer Selection Row */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                            <div className="coolie-input-group" style={{ flex: '1', minWidth: '300px' }}>
                                <label className="coolie-label">
                                    {nameDisplayMode === 'individual' ? t.name : (nameDisplayMode === 'both' ? t.both : t.company)} <span style={{ color: 'var(--md-sys-color-error)' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <Autocomplete
                                        value={customerName}
                                        onChange={setCustomerName}
                                        options={customerOptions}
                                        placeholder={t.selectCustomer || 'வணிகரை தேர்ந்தெடுக்க'}
                                        placeholderSub="Select Merchant"
                                        displayKey="primaryName"
                                        onSelect={handleCustomerSelect}
                                        showSubs={showSubs}
                                    />
                                    {nameDisplayMode === 'both' && (
                                        <input
                                            type="text"
                                            className="coolie-input-field"
                                            value={contactPerson}
                                            onChange={(e) => setContactPerson && setContactPerson(e.target.value)}
                                            placeholder={t.name || 'Name'}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Type Toggles */}
                            <div className="merchant-type-toggles">
                                <button
                                    onClick={() => {
                                        if (setNameDisplayMode) setNameDisplayMode('company');
                                        if (selectedCustomer) updateCustomerName(selectedCustomer, 'company');
                                    }}
                                    className={`type-toggle-btn ${nameDisplayMode === 'company' ? 'active' : ''}`}
                                >
                                    <span className="type-main-label">{t.company}</span>
                                    {showSubs && <span className="type-sub-label">Business</span>}
                                </button>
                                <button
                                    onClick={() => {
                                        if (setNameDisplayMode) setNameDisplayMode('both');
                                        if (selectedCustomer) updateCustomerName(selectedCustomer, 'both');
                                    }}
                                    className={`type-toggle-btn ${nameDisplayMode === 'both' ? 'active' : ''}`}
                                >
                                    <span className="type-main-label">{t.both}</span>
                                    {showSubs && <span className="type-sub-label">Both</span>}
                                </button>
                                <button
                                    onClick={() => {
                                        if (setNameDisplayMode) setNameDisplayMode('individual');
                                        if (selectedCustomer) updateCustomerName(selectedCustomer, 'individual');
                                    }}
                                    className={`type-toggle-btn ${nameDisplayMode === 'individual' ? 'active' : ''}`}
                                >
                                    <span className="type-main-label">{t.name}</span>
                                    {showSubs && <span className="type-sub-label">Name</span>}
                                </button>
                            </div>
                        </div>

                        {/* Address Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div className="coolie-input-group">
                                <label className="coolie-label">{t.address || 'முகவரி'}</label>
                                <div className="autocomplete-wrapper" style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="coolie-input-field"
                                        value={address}
                                        onChange={(e) => setAddress?.(e.target.value)}
                                        placeholder={!showSubs ? "Address" : ""}
                                    />
                                    {showSubs && !address && (
                                        <div className="dual-placeholder-overlay">
                                            <span className="dual-placeholder-primary">{t.address || 'முகவரி'}</span>
                                            <span className="dual-placeholder-sub">Address</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="coolie-input-group">
                                <label className="coolie-label">{t.city || 'ஊர்'}</label>
                                <div className="autocomplete-wrapper" style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="coolie-input-field"
                                        value={city}
                                        onChange={(e) => setCity?.(e.target.value)}
                                        placeholder={!showSubs ? "City" : ""}
                                    />
                                    {showSubs && !city && (
                                        <div className="dual-placeholder-overlay">
                                            <span className="dual-placeholder-primary">{t.city || 'ஊர்'}</span>
                                            <span className="dual-placeholder-sub">City</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Meta Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', borderTop: '1px dashed var(--md-sys-color-outline-variant)', paddingTop: '24px' }}>
                        <div className="coolie-input-group">
                            <label className="coolie-label">{t.billNo} <span style={{ color: 'var(--md-sys-color-error)' }}>*</span></label>
                            <input
                                type="text"
                                className="coolie-input-field"
                                value={billNo}
                                onChange={(e) => setBillNo?.(e.target.value)}
                                placeholder="INV-001"
                                inputMode="numeric"
                            />
                        </div>
                        <div className="coolie-input-group">
                            <label className="coolie-label">{t.date} <span style={{ color: 'var(--md-sys-color-error)' }}>*</span></label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="coolie-input-field"
                                    value={date}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, ''); // numbers only
                                        if (val.length > 8) val = val.slice(0, 8);
                                        let formatted = val;
                                        if (val.length > 4) {
                                            formatted = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                                        } else if (val.length > 2) {
                                            formatted = `${val.slice(0, 2)}/${val.slice(2)}`;
                                        }
                                        setDate?.(formatted);
                                    }}
                                    placeholder="DD/MM/YYYY"
                                    inputMode="numeric"
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('hidden-date-picker').showPicker()}
                                    className="coolie-icon-btn"
                                    style={{ position: 'absolute', right: '4px', background: 'transparent', width: '32px', height: '32px' }}
                                >
                                    📅
                                </button>
                                <input id="hidden-date-picker" type="date" style={{ position: 'absolute', visibility: 'hidden', width: 0, height: 0 }} onChange={(e) => { const d = e.target.value; if (d) { const [y, m, day] = d.split('-'); setDate?.(`${day}/${m}/${y}`); } }} />
                            </div>
                        </div>
                        <div className="coolie-input-group">
                            <label className="coolie-label">{t.company}</label>
                            <select
                                className="coolie-input-field"
                                value={companyId || config?.id || ''}
                                onChange={(e) => setCompanyId?.(e.target.value)}
                            >
                                {(companyOptions.length > 0 ? companyOptions : [{ id: config?.id, name: config?.name?.english, nameTamil: config?.name?.tamil }]).map((org) => (
                                    <option key={org.id || 'default'} value={org.id}>
                                        {org.nameTamil ? `${org.nameTamil} - ` : ''}{org.name || org.organization_name || 'Organization'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* CARD 2: Items Table */}
                <div className="coolie-card" style={{ padding: '0', overflow: 'hidden' }}>
                    {/* Desktop Table View */}
                    <div className="desktop-only-view">
                        <table className="coolie-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>
                                        <div>{t.itemDetails}</div>
                                        {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Item Details</div>}
                                    </th>
                                    <th style={{ textAlign: 'right', width: '15%' }}>
                                        <div>{t.quantity}</div>
                                        {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Weight</div>}
                                    </th>
                                    <th style={{ textAlign: 'right', width: '15%' }}>
                                        <div>{t.rate}</div>
                                        {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Coolie</div>}
                                    </th>
                                    <th style={{ textAlign: 'right', width: '20%' }}>
                                        <div>{t.amount}</div>
                                        {showSubs && <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>Amount</div>}
                                    </th>
                                    <th style={{ width: '5%' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {safeItems.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Autocomplete
                                                value={item.porul}
                                                onChange={(value) => handleItemChange(index, 'porul', value)}
                                                options={itemOptions}
                                                placeholder={t.typeItemName || 'பொருளின் பெயரை உள்ளிடவும்'}
                                                placeholderSub="Type Item Name"
                                                displayKey="name_english"
                                                onSelect={(val) => handleItemSelect(index, val)}
                                                showSubs={showSubs}
                                            />
                                        </td>
                                        <td>
                                            <input type="number" step="0.001" className="coolie-input-field" style={{ textAlign: 'right', border: '1px solid transparent', background: 'transparent' }} value={item.kg} onChange={(e) => handleItemChange(index, 'kg', e.target.value)} placeholder="0.00" inputMode="decimal"
                                                onFocus={(e) => { e.target.style.background = 'var(--md-sys-color-surface)'; e.target.style.borderColor = 'var(--md-sys-color-primary)'; }}
                                                onBlur={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'transparent'; }}
                                            />
                                        </td>
                                        <td>
                                            <input type="number" className="coolie-input-field" style={{ textAlign: 'right', border: '1px solid transparent', background: 'transparent' }} value={item.coolie} onChange={(e) => handleItemChange(index, 'coolie', e.target.value)} placeholder="0.00" inputMode="decimal"
                                                onFocus={(e) => { e.target.style.background = 'var(--md-sys-color-surface)'; e.target.style.borderColor = 'var(--md-sys-color-primary)'; }}
                                                onBlur={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'transparent'; }}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '16px', fontWeight: '600' }}>{calculateRowTotal(item)}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button onClick={() => handleRemoveItem(index)} className="coolie-icon-btn danger" style={{ width: '32px', height: '32px' }}><IconX size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="mobile-only-view" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {safeItems.map((item, index) => (
                            <div key={index} className="coolie-card" style={{ padding: '16px', background: 'var(--md-sys-color-surface-container-high)', boxShadow: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px dashed var(--md-sys-color-outline-variant)' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--md-sys-color-primary)' }}>item #{index + 1}</span>
                                    <button onClick={() => handleRemoveItem(index)} className="coolie-icon-btn danger" style={{ width: '28px', height: '28px' }}><IconX size={16} /></button>
                                </div>
                                <div className="coolie-input-group" style={{ marginBottom: '12px' }}>
                                    <label className="coolie-label">{t.itemName}</label>
                                    <Autocomplete value={item.porul} onChange={(value) => handleItemChange(index, 'porul', value)} options={itemOptions} placeholder={t.searchPlaceholder} displayKey="name_tamil" onSelect={(val) => handleItemSelect(index, val)} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="coolie-input-group" style={{ flex: 1 }}>
                                        <label className="coolie-label">{t.quantity}</label>
                                        <input type="number" step="0.001" className="coolie-input-field" value={item.kg} onChange={(e) => handleItemChange(index, 'kg', e.target.value)} placeholder="0.00" inputMode="decimal" />
                                    </div>
                                    <div className="coolie-input-group" style={{ flex: 1 }}>
                                        <label className="coolie-label">{t.rate}</label>
                                        <input type="number" className="coolie-input-field" value={item.coolie} onChange={(e) => handleItemChange(index, 'coolie', e.target.value)} placeholder="0.00" inputMode="decimal" />
                                    </div>
                                </div>
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t.amount}</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--md-sys-color-primary)' }}>₹ {calculateRowTotal(item)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '16px', background: 'var(--md-sys-color-surface-container-low)', display: 'flex', justifyContent: 'center' }}>
                        <button className="coolie-text-btn" onClick={handleAddItem} style={{ width: '100%' }}>
                            <IconPlus size={18} style={{ marginRight: '8px' }} /> {t.addAnotherItem}
                        </button>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="bill-footer">
                    {/* Bank Details */}
                    <div className="footer-left">
                        <div className="footer-card">
                            <div className="footer-card-header">{t.bankDetails}</div>
                            <div className="read-only-row">
                                <span className="read-only-label">{t.bankNamePlace}</span>
                                <span className="read-only-value">{bankDetails || '-'}</span>
                            </div>
                            <div className="read-only-row">
                                <span className="read-only-label">{t.accountNo}</span>
                                <span className="read-only-value">{accountNo || '-'}</span>
                            </div>

                            {/* Toggles */}
                            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px dashed var(--md-sys-color-outline-variant)' }}>
                                {setShowIFSC && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <input type="checkbox" id="toggle-ifsc" checked={showIFSC} onChange={(e) => setShowIFSC(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                        <label htmlFor="toggle-ifsc" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                                            Show IFSC in Bill
                                        </label>
                                    </div>
                                )}
                                {setShowBankDetails && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" id="toggle-bank" checked={showBankDetails} onChange={(e) => setShowBankDetails(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                        <label htmlFor="toggle-bank" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                                            Show Bank Details in Bill
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Calculation Grid */}
                    <div className="footer-right">
                        <div className="calc-grid">
                            <div className="calc-row">
                                <div className="calc-label">
                                    <span className="calc-label-main">{t.subTotal}</span>
                                    {showSubs && <span className="calc-label-sub">Sub Total</span>}
                                </div>
                                <span style={{ fontWeight: '600' }}>₹ {calculateSubtotal().toLocaleString('en-IN')}</span>
                            </div>
                            <div className="calc-row">
                                <div className="calc-label">
                                    <span className="calc-label-main">{t.setharam} ({t.grams})</span>
                                    {showSubs && <span className="calc-label-sub">Setharam (Grams)</span>}
                                </div>
                                <div className="calc-input-wrapper">
                                    <input type="number" step="0.001" className="calc-input" value={setharamGrams} onChange={(e) => setSetharamGrams(e.target.value)} placeholder="0.000" />
                                </div>
                            </div>
                            <div className="calc-row">
                                <div className="calc-label">
                                    <span className="calc-label-main">{t.ahimsaSilk}</span>
                                    {showSubs && <span className="calc-label-sub">Ahimsa Silk (Rs)</span>}
                                </div>
                                <div className="calc-input-wrapper">
                                    <input type="number" className="calc-input" value={ahimsaSilkRs} onChange={(e) => setAhimsaSilkRs(e.target.value)} placeholder="0.00" />
                                </div>
                            </div>
                            <div className="calc-row">
                                <div className="calc-label">
                                    <span className="calc-label-main">{t.courier}</span>
                                    {showSubs && <span className="calc-label-sub">Courier Charge</span>}
                                </div>
                                <div className="calc-input-wrapper">
                                    <input type="number" className="calc-input" value={courierRs} onChange={(e) => setCourierRs(e.target.value)} placeholder="0.00" />
                                </div>
                            </div>
                            <div className="calc-row">
                                <div className="calc-label" style={{ flex: 1, marginRight: '16px' }}>
                                    <input type="text" className="input-adjustment-name" value={customChargeName} onChange={(e) => setCustomChargeName(e.target.value)} placeholder={t.otherCharges || 'Other Charges'} />
                                </div>
                                <div className="calc-input-wrapper">
                                    <input type="number" className="calc-input" value={customChargeRs} onChange={(e) => setCustomChargeRs(e.target.value)} placeholder="0.00" />
                                </div>
                            </div>
                            <div className="total-row">
                                <div className="total-label">
                                    <div>{t.total}</div>
                                    {showSubs && <div style={{ fontSize: '0.8rem', fontWeight: '400' }}>Total Amount</div>}
                                </div>
                                <div className="total-value">₹ {calculateGrandTotal().toLocaleString('en-IN')}</div>
                            </div>
                        </div>

                        {/* Action Strip (Embedded in Footer Right on Desktop) */}
                        <div className="editor-actions-strip">
                            <button className="coolie-text-btn" onClick={onResetData}>
                                <IconRefresh size={18} style={{ marginRight: '8px' }} /> {t.reset || 'Reset'}
                            </button>
                            <button className="coolie-primary-btn" style={{ background: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)' }} onClick={onPreview}>
                                <IconFiles size={20} style={{ marginRight: '8px' }} /> {t.preview || 'Preview'}
                            </button>
                            <button className="coolie-primary-btn" onClick={onSave}>
                                <IconSave size={20} style={{ marginRight: '8px' }} /> {t.save || 'Save Bill'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BillEditor;
