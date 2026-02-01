import { IconSave, IconTrash, IconDatabase, IconPrinter, IconX, IconPlus, IconRefresh } from '../common/Icons';
import Autocomplete from '../common/Autocomplete';
// import { defaultItems, defaultCustomers } from '../../config/defaults'; // REMOVED
import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient'; // ADDED
import { showSubtitles } from '../../config/translations';
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
            // Fetch Customer Options (Type = Coolie)
            const { data: customers } = await supabase
                .from('coolie_customers')
                .select('*')
                .eq('type', 'coolie'); // Strict Filter

            // Fetch Items (Type = Coolie)
            const { data: itemsData } = await supabase
                .from('coolie_items')
                .select('*')
                .eq('type', 'coolie'); // Strict Filter

            // Process Customers for Bilingual Display
            const processedCustomers = (customers || []).map(c => {
                const tamilName = c.name_tamil || '';

                return {
                    ...c,
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
                                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                            {c.company_name}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Customer Name Section */}
                            <div>
                                <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text)' }}>
                                    {tamilName || c.name}
                                </span>
                                {tamilName && c.name && (
                                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                        {c.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                };
            });


            // Process Items for Bilingual Display
            const processedItems = (itemsData || []).map(item => {
                return {
                    ...item,
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
        if (!item) return '0.00';
        const qty = parseFloat(item.kg) || 0;
        const rate = parseFloat(item.coolie) || 0;
        return (qty * rate).toFixed(2);
    };

    const calculateSubtotal = () => {
        return safeItems.reduce((sum, item) => sum + (parseFloat(calculateRowTotal(item)) || 0), 0);
    };

    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        const courier = parseFloat(courierRs) || 0;
        const ahimsa = parseFloat(ahimsaSilkRs) || 0;
        const other = parseFloat(customChargeRs) || 0;
        return (subtotal + courier + ahimsa + other).toFixed(2);
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

    // useEffect removed to prevent automatic overwriting of manual edits on remount
    // updateCustomerName is now called explicitly by user actions (toggles/selection)


    return (
        <div className="bill-editor-container">

            {/* Top Header */}
            <div className="page-header">
                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="page-title">
                        <div style={{ lineHeight: '1.2' }}>{t.newBill}</div>
                        {showSubs && <div style={{ fontSize: '0.8rem', fontWeight: '400', color: 'var(--color-text-muted)' }}>New Bill</div>}
                    </div>
                </div>
            </div>


            {/* 1. Customer Name Row (Full Width) */}
            <div className="customer-row">
                <div className="customer-field-col">
                    <div className="merchant-type-header">
                        <label className="zoho-label" style={{ marginBottom: 0 }}>
                            <div>
                                {nameDisplayMode === 'individual' ? t.name : (nameDisplayMode === 'both' ? t.both : t.company)} <span style={{ color: 'red' }}>*</span>
                            </div>
                            {showSubs && (
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                                    {nameDisplayMode === 'individual' ? 'Name' : (nameDisplayMode === 'both' ? 'Both (Business + Person)' : 'Business')}
                                </div>
                            )}
                        </label>

                        {/* Name Format Toggles */}
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
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
                            {/* Secondary Input for 'Both' mode */}
                            {nameDisplayMode === 'both' && (
                                <input
                                    type="text"
                                    className="zoho-input"
                                    value={contactPerson}
                                    onChange={(e) => setContactPerson && setContactPerson(e.target.value)}
                                    placeholder={t.name || 'Name'}
                                    style={{ marginTop: '8px' }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ width: '250px', marginRight: '16px' }}>
                    <label className="zoho-label-normal">
                        <div>{t.address || 'முகவரி'}</div>
                        {showSubs && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>Address</div>}
                    </label>
                    <div className="autocomplete-wrapper">
                        <input
                            type="text"
                            className="zoho-input"
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

                <div style={{ width: '200px' }}>
                    <label className="zoho-label-normal">
                        <div>{t.city}</div>
                        {showSubs && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>City</div>}
                    </label>
                    <div className="autocomplete-wrapper">
                        <input
                            type="text"
                            className="zoho-input"
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

            {/* 2. Invoice Details Row */}
            <div className="invoice-details-row">
                <div className="detail-field-group">
                    <label className="zoho-label">
                        <div>{t.billNo} <span style={{ color: 'red' }}>*</span></div>
                        {showSubs && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>Bill No</div>}
                    </label>
                    <input
                        type="text"
                        className="zoho-input"
                        value={billNo}
                        onChange={(e) => setBillNo?.(e.target.value)}
                        placeholder="INV-001"
                        inputMode="numeric"
                    />
                </div>

                <div className="detail-field-group">
                    <label className="zoho-label">
                        <div>{t.date} <span style={{ color: 'red' }}>*</span></div>
                        {showSubs && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>Date</div>}
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            className="zoho-input"
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
                            style={{
                                position: 'absolute',
                                right: '8px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--color-primary)',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            📅
                        </button>
                        <input
                            id="hidden-date-picker"
                            type="date"
                            style={{
                                position: 'absolute',
                                visibility: 'hidden',
                                width: 0,
                                height: 0
                            }}
                            onChange={(e) => {
                                const d = e.target.value;
                                if (d) {
                                    const [y, m, day] = d.split('-');
                                    setDate?.(`${day}/${m}/${y}`);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Organization/Company Selector */}
                {/* Organization/Company Selector - Always Show */}
                <div className="detail-field-group">
                    <label className="zoho-label">
                        <div>{t.company}</div>
                        {showSubs && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>Company</div>}
                    </label>
                    <select
                        className="zoho-input"
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


            {/* 3. Item Table / Mobile Cards */}
            < div className="bill-table-wrapper" >

                {/* Desktop Table View */}
                < div className="desktop-only-view" >
                    <table className="bill-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>
                                    <div>{t.itemDetails}</div>
                                    {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal' }}>Item Details</div>}
                                </th>
                                <th style={{ textAlign: 'right', width: '15%' }}>
                                    <div>{t.quantity}</div>
                                    {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal' }}>Weight</div>}
                                </th>
                                <th style={{ textAlign: 'right', width: '15%' }}>
                                    <div>{t.rate}</div>
                                    {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal' }}>Coolie</div>}
                                </th>
                                <th style={{ textAlign: 'right', width: '20%' }}>
                                    <div>{t.amount}</div>
                                    {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal' }}>Amount</div>}
                                </th>
                                <th style={{ width: '5%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {safeItems.map((item, index) => (
                                <tr key={index}>
                                    <td>
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
                                        <input
                                            type="number"
                                            step="0.001"
                                            className="table-input"
                                            style={{ textAlign: 'right' }}
                                            value={item.kg}
                                            onChange={(e) => handleItemChange(index, 'kg', e.target.value)}
                                            placeholder="0.00"
                                            inputMode="decimal"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="table-input"
                                            style={{ textAlign: 'right' }}
                                            value={item.coolie}
                                            onChange={(e) => handleItemChange(index, 'coolie', e.target.value)}
                                            placeholder="0.00"
                                            inputMode="decimal"
                                        />
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '8px', color: 'var(--color-text)' }}>
                                        {calculateRowTotal(item)}
                                    </td>
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '1.2rem' }}
                                            title="Remove"
                                        >
                                            &times;
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div >

                {/* Mobile Card View */}
                < div className="mobile-only-view" >
                    <div className="mobile-items-list">
                        {safeItems.map((item, index) => (
                            <div key={index} className="mobile-item-card">
                                <div className="card-header">
                                    <span className="item-number">
                                        <span style={{ fontSize: '1.2em' }}>{t.itemsList}</span> #{index + 1}
                                        {showSubs && <span style={{ fontSize: '0.8em', fontWeight: 'normal', opacity: 0.7, marginLeft: '5px' }}>Item</span>}
                                    </span>
                                    <button
                                        className="btn-remove-circle"
                                        onClick={() => handleRemoveItem(index)}
                                        title="Remove"
                                    >
                                        <IconX size={18} />
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="card-field">
                                        <label>
                                            <div>{t.itemName}</div>
                                            {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal', color: '#6b7280' }}>Item Name</div>}
                                        </label>
                                        <Autocomplete
                                            value={item.porul}
                                            onChange={(value) => handleItemChange(index, 'porul', value)}
                                            options={itemOptions}
                                            placeholder={t.searchPlaceholder || 'தேடுக...'}
                                            placeholderSub="Search Item"
                                            displayKey="name"
                                            onSelect={(val) => handleItemSelect(index, val)}
                                            showSubs={showSubs}
                                        />
                                    </div>
                                    <div className="card-row">
                                        <div className="card-field flex-1">
                                            <label>
                                                <div>{t.quantity}</div>
                                                {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal', color: '#6b7280' }}>Weight</div>}
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                className="zoho-input"
                                                value={item.kg}
                                                onChange={(e) => handleItemChange(index, 'kg', e.target.value)}
                                                placeholder="0.00"
                                                inputMode="decimal"
                                            />
                                        </div>
                                        <div className="card-field flex-1">
                                            <label>
                                                <div>{t.rate}</div>
                                                {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal', color: '#6b7280' }}>Coolie</div>}
                                            </label>
                                            <input
                                                type="number"
                                                className="zoho-input"
                                                value={item.coolie}
                                                onChange={(e) => handleItemChange(index, 'coolie', e.target.value)}
                                                placeholder="0.00"
                                                inputMode="decimal"
                                            />
                                        </div>
                                    </div>
                                    <div className="card-amount">
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.amount}</span>
                                            {showSubs && <span style={{ fontSize: '10px', opacity: 0.7 }}>Amount</span>}
                                        </div>
                                        <span className="amount-val">₹ {calculateRowTotal(item)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div >

                <button className="btn-add-new-row" onClick={handleAddItem}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1' }}>
                        <span>+ {t.addAnotherItem}</span>
                        {showSubs && <span style={{ fontSize: '10px', fontWeight: 'normal', opacity: 0.8 }}>Add New Row</span>}
                    </div>
                </button>
            </div >

            {/* 4. Footer Section */}
            < div className="bill-footer" >

                {/* Left: Bank Details (Read Only Card) */}
                <div className="footer-left">
                    <div className="footer-card">
                        <div className="footer-card-header">
                            <div>{t.bankDetails}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal', opacity: 0.8, marginTop: '2px' }}>Bank Details</div>}
                        </div>
                        <div className="read-only-row">
                            <div className="flex-column">
                                <span className="read-only-label">{t.bankNamePlace}</span>
                                {showSubs && <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '-2px' }}>Bank Name & Place</span>}
                            </div>
                            <span className="read-only-value">{bankDetails || '-'}</span>
                        </div>
                        <div className="read-only-row" style={{ marginTop: '12px' }}>
                            <div className="flex-column">
                                <span className="read-only-label">{t.accountNo}</span>
                                {showSubs && <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '-2px' }}>Account Number</span>}
                            </div>
                            <span className="read-only-value">{accountNo || '-'}</span>
                        </div>
                        <div style={{ marginTop: '12px', color: 'var(--color-primary)', fontStyle: 'italic' }}>
                            <div style={{ fontSize: '0.75rem' }}>{t.toEditGoToBusinessManager}</div>
                            {showSubs && <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>* To edit, go to Business Settings</div>}
                        </div>

                        {/* Toggle IFSC Visibility */}
                        {setShowIFSC && (
                            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="toggle-ifsc"
                                    checked={showIFSC}
                                    onChange={(e) => setShowIFSC(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <label htmlFor="toggle-ifsc" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                                    Show IFSC in Bill
                                </label>
                            </div>
                        )}

                        {/* Toggle Bank Details Visibility */}
                        {setShowBankDetails && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="toggle-bank"
                                    checked={showBankDetails}
                                    onChange={(e) => setShowBankDetails(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <label htmlFor="toggle-bank" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                                    Show Bank Details in Bill
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Totals (Calculation Grid) */}
                <div className="footer-right">
                    <div className="footer-card-header" style={{ marginBottom: '16px' }}>
                        <div>{t.billCalculation || 'கட்டண விவரம்'}</div>
                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal', opacity: 0.8, marginTop: '2px' }}>Bill Calculation</div>}
                    </div>
                    <div className="calc-grid">

                        {/* Sub Total */}
                        <div className="calc-row">
                            <div className="calc-label">
                                <span className="calc-label-main">{t.subTotal}</span>
                                {showSubs && <span className="calc-label-sub">Sub Total</span>}
                            </div>
                            <div className="calc-input-wrapper">
                                <div style={{ textAlign: 'right', fontWeight: 'bold', padding: '6px 8px' }}>
                                    {calculateSubtotal().toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Ahimsa Silk */}
                        <div className="calc-row">
                            <div className="calc-label">
                                <span className="calc-label-main">{t.ahimsaSilk} (+)</span>
                                {showSubs && <span className="calc-label-sub">Ahimsa Silk</span>}
                            </div>
                            <div className="calc-input-wrapper">
                                <input
                                    type="number"
                                    className="calc-input"
                                    value={ahimsaSilkRs}
                                    onChange={(e) => setAhimsaSilkRs?.(e.target.value)}
                                    placeholder="0.00"
                                    inputMode="decimal"
                                />
                            </div>
                        </div>

                        {/* Adjustment / Custom */}
                        <div className="calc-row">
                            <div className="calc-label" style={{ flex: 1, paddingRight: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <input
                                        type="text"
                                        className="input-adjustment-name"
                                        value={customChargeName}
                                        onChange={(e) => setCustomChargeName?.(e.target.value)}
                                        placeholder={t.adjustment || 'சரிசெய்தல்'}
                                    />
                                    {showSubs && <span className="calc-label-sub">Adjustment Name</span>}
                                </div>
                            </div>
                            <div className="calc-input-wrapper">
                                <input
                                    type="number"
                                    className="calc-input"
                                    value={customChargeRs}
                                    onChange={(e) => setCustomChargeRs?.(e.target.value)}
                                    placeholder="0.00"
                                    inputMode="decimal"
                                />
                            </div>
                        </div>

                        {/* Setharam */}
                        <div className="calc-row">
                            <div className="calc-label">
                                <span className="calc-label-main">{t.setharam}</span>
                                {showSubs && <span className="calc-label-sub">Wastage</span>}
                            </div>
                            <div className="calc-input-wrapper">
                                <input
                                    type="number"
                                    className="calc-input"
                                    value={setharamGrams}
                                    onChange={(e) => setSetharamGrams?.(e.target.value)}
                                    placeholder="0"
                                    inputMode="decimal"
                                />
                            </div>
                        </div>

                        {/* Courier */}
                        <div className="calc-row">
                            <div className="calc-label">
                                <span className="calc-label-main">{t.courier} (+)</span>
                                {showSubs && <span className="calc-label-sub">Courier Charges</span>}
                            </div>
                            <div className="calc-input-wrapper">
                                <input
                                    type="number"
                                    className="calc-input"
                                    value={courierRs}
                                    onChange={(e) => setCourierRs?.(e.target.value)}
                                    placeholder="0.00"
                                    inputMode="decimal"
                                />
                            </div>
                        </div>

                        {/* Total */}
                        <div className="total-row">
                            <div className="calc-label">
                                <span className="total-label">{t.total}</span>
                                {showSubs && <span className="calc-label-sub" style={{ opacity: 0.7 }}>Total</span>}
                            </div>
                            <span className="total-value">₹ {calculateGrandTotal()}</span>
                        </div>

                    </div>
                </div>
            </div >

            {/* Action Buttons Strip - Non-Sticky at the bottom of content */}
            <div className="editor-actions-strip">
                {/* Secondary Actions (Mini Buttons) */}
                <div className="footer-secondary-row mobile-only-flex">
                    <button className="btn-mini-secondary" onClick={onHome}>
                        <IconX size={18} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span>{t.cancel}</span>
                            {showSubs && <span style={{ fontSize: '9px', opacity: 0.8 }}>Cancel</span>}
                        </div>
                    </button>
                    <button className="btn-mini-secondary" onClick={onResetData}>
                        <IconTrash size={18} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span>{t.reset}</span>
                            {showSubs && <span style={{ fontSize: '9px', opacity: 0.8 }}>Reset</span>}
                        </div>
                    </button>
                    <button className="btn-mini-secondary" onClick={onLoadTestData}>
                        <IconDatabase size={18} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span>{t.test}</span>
                            {showSubs && <span style={{ fontSize: '9px', opacity: 0.8 }}>Test</span>}
                        </div>
                    </button>
                </div>

                {/* Primary Actions */}
                <div className="footer-primary-row">
                    <button className="btn-preview-new" onClick={onPreview}>
                        <IconPrinter size={20} />
                        <div className="btn-text-group">
                            <span>{t.preview || 'முன்னோட்டம்'}</span>
                            {showSubs && <span className="btn-sub">Preview</span>}
                        </div>
                    </button>

                    <button className="btn-save-new" onClick={onSave}>
                        <IconSave size={20} />
                        <div className="btn-text-group">
                            <span>{t.save || 'சேமி'}</span>
                            {showSubs && <span className="btn-sub">Save</span>}
                        </div>
                    </button>

                    {/* Desktop Helpers (Stay in line) */}
                    <div className="footer-helper-btns desktop-only-flex">
                        <button className="btn-secondary-desktop" onClick={onHome}>
                            <IconX size={16} />
                            <div className="btn-text-group">
                                <span>{t.cancel}</span>
                                {showSubs && <span className="btn-sub">Cancel</span>}
                            </div>
                        </button>
                        <button className="btn-secondary-desktop" onClick={onLoadTestData}>
                            <IconDatabase size={16} />
                            <div className="btn-text-group">
                                <span>{t.test}</span>
                                {showSubs && <span className="btn-sub">Test</span>}
                            </div>
                        </button>
                        <button className="btn-secondary-desktop" onClick={onResetData}>
                            <IconTrash size={16} />
                            <div className="btn-text-group">
                                <span>{t.reset}</span>
                                {showSubs && <span className="btn-sub">Reset</span>}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

        </div >
    );
}

export default BillEditor;
