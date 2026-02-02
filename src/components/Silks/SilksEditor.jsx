import React, { useState, useEffect } from 'react';
import { IconTrash, IconPlus, IconPrinter, IconHome, IconMenu, IconSave } from '../common/Icons';
import Autocomplete from '../common/Autocomplete';
import { supabase, SILKS_DB_ENABLED } from '../../config/supabaseClient';
import { useToast } from '../../context/ToastContext';
import './SilksEditor.css';

import { showSubtitles } from '../../config/translations';

/**
 * SilksEditor Component
 * 
 * Re-designed to match the premium Zoho-style layout of BillEditor.
 * Supports HSN codes, custom tax rates, and notes.
 */
function SilksEditor({ onHome, onPreview, setData, initialData, t, language }) {
    const showSubs = showSubtitles(language);
    const { showToast } = useToast();
    const [invoiceId, setInvoiceId] = useState(null);
    const [billNo, setBillNo] = useState('');
    const [date, setDate] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerDetails, setCustomerDetails] = useState(null);
    const [items, setItems] = useState([{ name: '', quantity: 1, rate: 0, amount: 0, hsn: '5007' }]);
    const [notes, setNotes] = useState('Thanks for your business.');
    const [terms, setTerms] = useState('');
    const [taxRates, setTaxRates] = useState({ cgst: 2.5, sgst: 2.5 });
    // Preview Language State (Default Tamil Only)
    const [previewLanguage, setPreviewLanguage] = useState('ta_only');

    // Autocomplete Data
    const [customerOptions, setCustomerOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);

    // Fetch Initial Data
    useEffect(() => {
        async function fetchData() {
            // Database disabled warning
            if (!SILKS_DB_ENABLED) {
                console.log('⚠️ Silks DB is DISABLED - working in offline mode');
            }

            const { data: customers } = await supabase.from('customers').select('*').eq('type', 'silks'); // STICT FILTER
            const { data: itemsData } = await supabase.from('items').select('*').eq('type', 'silks'); // STRICT FILTER

            const processedCustomers = (customers || []).map(c => {
                const primaryName = c.name_tamil || c.name || '';
                const secondaryName = c.name_tamil && c.name ? c.name : c.name_tamil || '';
                const companyPrimary = c.company_name_tamil || c.company_name || '';
                const companySecondary = c.company_name_tamil && c.company_name ? c.company_name : '';
                const placePrimary = c.city_tamil || c.city || c.place_of_supply || '';
                const placeSecondary = c.city_tamil && c.city ? c.city : '';

                return {
                    ...c,
                    searchText: [
                        c.name_tamil,
                        c.name,
                        c.company_name_tamil,
                        c.company_name,
                        c.city_tamil,
                        c.city,
                        c.place_of_supply,
                        c.gstin
                    ].filter(Boolean).join(' '),
                    displayName: (
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2', padding: '4px 0', gap: '2px' }}>
                            {companyPrimary && (
                                <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--color-primary)' }}>
                                    {companyPrimary}
                                    {companySecondary && <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginLeft: '6px' }}>{companySecondary}</span>}
                                </div>
                            )}
                            <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--color-text)' }}>
                                {primaryName}
                                {secondaryName && secondaryName !== primaryName && (
                                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginLeft: '6px' }}>{secondaryName}</span>
                                )}
                            </div>
                            {placePrimary && (
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                    {placePrimary}
                                    {placeSecondary && placeSecondary !== placePrimary && <span style={{ opacity: 0.7, marginLeft: '4px' }}>({placeSecondary})</span>}
                                </div>
                            )}
                        </div>
                    )
                };
            });

            const processedItems = (itemsData || []).map(item => ({
                ...item,
                searchText: [
                    item.name_tamil,
                    item.name,
                    item.hsn_or_sac
                ].filter(Boolean).join(' '),
                displayName: (
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2', padding: '2px 0' }}>
                        <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text)' }}>
                            {item.name_tamil || item.name}
                        </span>
                        {item.name_tamil && item.name && (
                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                {item.name}
                            </span>
                        )}
                    </div>
                )
            }));

            setCustomerOptions(processedCustomers);
            setItemOptions(processedItems);

            // Set initial date if not editing
            if (!initialData) {
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const year = today.getFullYear();
                setDate(`${day}/${month}/${year}`);

                // Generate Bill No (use timestamp if DB disabled)
                if (SILKS_DB_ENABLED) {
                    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
                    setBillNo(`INV-${(count || 0) + 1}`);
                } else {
                    setBillNo(`INV-${Date.now().toString().slice(-6)}`);
                }
            }

            // Fetch Tax Rates
            const { data: org } = await supabase.from('organization_profile').select('cgst_rate, sgst_rate').eq('type', 'silks').limit(1).maybeSingle();
            if (org) {
                setTaxRates({
                    cgst: parseFloat(org.cgst_rate) || 2.5,
                    sgst: parseFloat(org.sgst_rate) || 2.5
                });
            }
        }
        fetchData();
    }, [initialData]);

    // Load initial data (Editing Logic)
    useEffect(() => {
        if (initialData) {
            loadFromInitialData(initialData);
        }
    }, [initialData]);

    // Auto-Save Effect - DISABLED when DB is off
    useEffect(() => {
        if (!SILKS_DB_ENABLED) return; // Skip auto-save when DB disabled

        const timer = setTimeout(() => {
            if (invoiceId && customerDetails && billNo) {
                // Auto-save only if we have an ID (edit mode) or enough data to create one?
                // User wants "start typing -> auto save".
                // If we don't have ID, we need to handle "Create" carefully to avoid duplicates.
                // Best approach: Only auto-save if we have at least Customer and BillNo.
                // handleSave checks this.
                handleSave(true); // Pass true to silent mode
            } else if (customerDetails && billNo && items.length > 0) {
                // Try to save new draft
                handleSave(true);
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timer);
    }, [items, customerDetails, billNo, notes, terms, date, taxRates]);

    async function loadFromInitialData(data) {
        // Handle both simple objects (state) and DB rows
        if (data.billNo) {
            setBillNo(data.billNo);
            setDate(data.date);
            setCustomerName(data.customerDetails?.name || '');
            setCustomerDetails(data.customerDetails);
            setItems(data.items);
            setNotes(data.notes || '');
            setTerms(data.terms || '');
            if (data.id) setInvoiceId(data.id);
        } else if (data.invoice_number) {
            setInvoiceId(data.id);
            setBillNo(data.invoice_number);
            setDate(data.date);
            setNotes(data.notes || '');

            if (data.customer_id && SILKS_DB_ENABLED) {
                const { data: cust } = await supabase.from('customers').select('*').eq('id', data.customer_id).single();
                if (cust) {
                    setCustomerDetails(cust);
                    setCustomerName(cust.name);
                }
            }

            // Convert YYYY-MM-DD to DD/MM/YYYY if needed
            let displayDate = data.date || '';
            if (displayDate.includes('-')) {
                const [y, m, d] = displayDate.split('-');
                displayDate = `${d}/${m}/${y}`;
            }
            setDate(displayDate);

            if (SILKS_DB_ENABLED) {
                const { data: invItems } = await supabase.from('invoice_items').select('*').eq('invoice_id', data.id);
                if (invItems) {
                    setItems(invItems.map(item => ({
                        name: item.description,
                        quantity: item.quantity,
                        rate: item.rate,
                        amount: item.amount,
                        hsn: item.hsn_code || '5007'
                    })));
                }
            }
        }
    }

    // Handlers
    const handleAddItem = () => setItems([...items, { name: '', quantity: 1, rate: 0, amount: 0, hsn: '5007' }]);
    const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        const qty = parseFloat(newItems[index].quantity) || 0;
        const rate = parseFloat(newItems[index].rate) || 0;
        newItems[index].amount = (qty * rate).toFixed(2);
        setItems(newItems);
    };

    const handleItemSelect = (index, item) => {
        const newItems = [...items];
        newItems[index].name = item.name + (item.name_tamil ? ` / ${item.name_tamil}` : '');
        newItems[index].rate = item.rate || 0;
        newItems[index].quantity = 1;
        newItems[index].hsn = item.hsn_or_sac || '5007';
        newItems[index].amount = (item.rate || 0).toFixed(2);
        setItems(newItems);
    };

    const handleCustomerSelect = (customer) => {
        setCustomerName(customer.name);
        setCustomerDetails(customer);
    };

    const calculateSubtotal = () => items.reduce((acc, i) => acc + (parseFloat(i.amount) || 0), 0);
    const calculateGST = (sub, rate) => (sub * (rate / 100)).toFixed(2);

    const calculateGrandTotal = () => {
        const sub = calculateSubtotal();
        const cgst = parseFloat(calculateGST(sub, taxRates.cgst));
        const sgst = parseFloat(calculateGST(sub, taxRates.sgst));
        return (sub + cgst + sgst).toFixed(2);
    };

    const handlePreview = () => {
        setData({
            id: invoiceId,
            billNo,
            date,
            customerDetails,
            items,
            subTotal: calculateSubtotal(),
            notes,
            terms,
            taxRates,
            previewLanguage // Pass language to preview
        });
        onPreview();
    };

    const handleSave = async (silent = false) => {
        // ========== DATABASE DISABLED CHECK ==========
        if (!SILKS_DB_ENABLED) {
            if (!silent) {
                showToast('⚠️ Database disabled for Silks - Preview only mode', 'warning');
            }
            console.log('Silks DB disabled - save skipped');
            return;
        }
        // =============================================

        if (!customerDetails || !customerDetails.id) {
            if (!silent) showToast(t.error_customer || 'Please select a valid customer.', 'warning');
            return;
        }

        const subTotal = calculateSubtotal();
        const cgst = parseFloat(calculateGST(subTotal, taxRates.cgst));
        const sgst = parseFloat(calculateGST(subTotal, taxRates.sgst));

        const dbInvoiceData = {
            invoice_number: billNo,
            date,
            customer_id: customerDetails.id,
            sub_total: subTotal,
            total_tax: cgst + sgst,
            total_amount: subTotal + cgst + sgst,
            status: 'Draft',
            notes,
            terms
        };

        try {
            let savedId = invoiceId;
            if (invoiceId) {
                await supabase.from('invoices').update(dbInvoiceData).eq('id', invoiceId);
            } else {
                const { data, error } = await supabase.from('invoices').insert([dbInvoiceData]).select().single();
                if (error) throw error;
                savedId = data.id;
                setInvoiceId(savedId); // Update state to prevent duplicate inserts
            }

            if (savedId) {
                // Optimization: Maybe don't delete/insert items on every keystroke if unchanged?
                // For now, simple approach is safe but heavy.
                await supabase.from('invoice_items').delete().eq('invoice_id', savedId);
                const itemsToInsert = items.map(item => ({
                    invoice_id: savedId,
                    description: item.name,
                    quantity: item.quantity,
                    rate: item.rate,
                    amount: item.amount,
                    hsn_code: item.hsn
                }));
                await supabase.from('invoice_items').insert(itemsToInsert);

                if (!silent) {
                    showToast(t.success_invoice_saved || 'Invoice Saved Successfully!', 'success');
                    onHome();
                }
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
            if (!silent) showToast((t.error_save_failed || 'Failed to save invoice: ') + error.message, 'error');
        }
    };

    return (
        <div className="bill-editor-container">
            <div className="page-header">
                <div className="page-title">
                    <div style={{ lineHeight: '1.2' }}>{invoiceId ? (t.editInvoice || 'விலைப்பட்டியலை திருத்து') : (t.newSilksInvoice || 'புதிய பட்டு விலைப்பட்டியல்')}</div>
                    {showSubs && <div style={{ fontSize: '0.8rem', fontWeight: '400', color: 'var(--color-text-muted)' }}>{invoiceId ? 'Edit Invoice' : 'New Silks Invoice'}</div>}
                </div>
            </div>

            {/* Bill Language Selector */}
            <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group" style={{ flex: '0 0 auto' }}>
                    <label className="zoho-label">
                        <div>{t.billLanguage || 'பில் மொழி'}</div>
                        {showSubs && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>Bill Language</div>}
                    </label>
                    <div className="merchant-type-toggles" style={{ marginTop: '8px' }}>
                        <button
                            onClick={() => setPreviewLanguage('ta_only')}
                            className={`type-toggle-btn ${previewLanguage === 'ta_only' ? 'active' : ''}`}
                        >
                            <span className="type-main-label">{t.tamil || 'தமிழ்'}</span>
                            {showSubs && <span className="type-sub-label">Tamil</span>}
                        </button>
                        <button
                            onClick={() => setPreviewLanguage('en_only')}
                            className={`type-toggle-btn ${previewLanguage === 'en_only' ? 'active' : ''}`}
                        >
                            <span className="type-main-label">{t.english || 'English'}</span>
                            {showSubs && <span className="type-sub-label">English</span>}
                        </button>
                    </div>
                </div>
            </div>


            <div className="customer-row">
                <div className="customer-field-col">
                    <label className="zoho-label">{t.customerName}{showSubs ? ' / Merchant Name' : ''}*</label>
                    <Autocomplete
                        value={customerName}
                        onChange={setCustomerName}
                        options={customerOptions}
                        placeholder={showSubs ? (t.searchCustomer || 'Search merchant...') : (t.searchCustomer || 'தேடுக...')}
                        displayKey="name"
                        onSelect={handleCustomerSelect}
                    />
                </div>
                {customerDetails && (
                    <div style={{ width: '250px' }}>
                        <label className="zoho-label-normal">{t.placeOfSupply || 'Place of Supply'}</label>
                        <div className="zoho-input" style={{ background: 'var(--color-bg)', opacity: 0.8 }}>
                            {customerDetails.city || 'Tamil Nadu'}
                        </div>
                    </div>
                )}
            </div>

            <div className="invoice-details-row">
                <div className="detail-field-group">
                    <label className="zoho-label">{t.invoiceNo}{showSubs ? ' / Invoice#' : ''}*</label>
                    <input type="text" className="zoho-input" value={billNo} onChange={(e) => setBillNo(e.target.value)} inputMode="numeric" />
                </div>
                <div className="detail-field-group">
                    <label className="zoho-label">{t.invoiceDate}{showSubs ? ' / Invoice Date' : ''}*</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            className="zoho-input"
                            value={date}
                            onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 8) val = val.slice(0, 8);
                                let formatted = val;
                                if (val.length > 4) {
                                    formatted = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                                } else if (val.length > 2) {
                                    formatted = `${val.slice(0, 2)}/${val.slice(2)}`;
                                }
                                setDate(formatted);
                            }}
                            placeholder="DD/MM/YYYY"
                            inputMode="numeric"
                        />
                        <button type="button" onClick={() => document.getElementById('silks-date-picker').showPicker()} style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', color: 'var(--color-primary)' }}>📅</button>
                        <input id="silks-date-picker" type="date" style={{ position: 'absolute', visibility: 'hidden', width: 0 }} onChange={(e) => {
                            const d = e.target.value;
                            if (d) {
                                const [y, m, day] = d.split('-');
                                setDate(`${day}/${m}/${y}`);
                            }
                        }} />
                    </div>
                </div>
            </div>

            <div className="bill-table-wrapper">
                <div className="desktop-only-view">
                    <table className="bill-table">
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>{t.itemDetails}{showSubs ? ' / ITEM DETAILS' : ''}</th>
                                <th style={{ width: '15%' }}>HSN Code</th>
                                <th style={{ textAlign: 'right', width: '10%' }}>{t.qty}{showSubs ? ' / QTY' : ''}</th>
                                <th style={{ textAlign: 'right', width: '15%' }}>{t.rate}{showSubs ? ' / RATE' : ''}</th>
                                <th style={{ textAlign: 'right', width: '20%' }}>{t.amount}{showSubs ? ' / AMOUNT' : ''}</th>
                                <th style={{ width: '5%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <Autocomplete
                                            value={item.name}
                                            onChange={(val) => handleItemChange(index, 'name', val)}
                                            options={itemOptions}
                                            displayKey="name"
                                            onSelect={(val) => handleItemSelect(index, val)}
                                            placeholder={showSubs ? (t.selectItem || 'Select item...') : (t.selectItem || 'தேர்ந்தெடுக்கவும்...')}
                                        />
                                    </td>
                                    <td>
                                        <input type="text" className="table-input" value={item.hsn} onChange={(e) => handleItemChange(index, 'hsn', e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" className="table-input" style={{ textAlign: 'right' }} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} inputMode="numeric" />
                                    </td>
                                    <td>
                                        <input type="number" className="table-input" style={{ textAlign: 'right' }} value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} inputMode="decimal" />
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '8px' }}>{item.amount}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleRemoveItem(index)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '1.2rem' }}>×</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mobile-only-view">
                    <div className="mobile-items-list">
                        {items.map((item, index) => (
                            <div key={index} className="mobile-item-card">
                                <div className="card-header">
                                    <span className="item-number">Item #{index + 1}</span>
                                    <button className="btn-remove-card" onClick={() => handleRemoveItem(index)}>{showSubs ? `${t.delete || 'நீக்க'} / Delete` : (t.delete || 'நீக்க')}</button>
                                </div>
                                <div className="card-body">
                                    <div className="card-field">
                                        <label>{t.description}{showSubs ? ' / Description' : ''}</label>
                                        <Autocomplete value={item.name} onChange={(val) => handleItemChange(index, 'name', val)} options={itemOptions} displayKey="name" onSelect={(val) => handleItemSelect(index, val)} />
                                    </div>
                                    <div className="card-row">
                                        <div className="card-field flex-1"><label>HSN</label><input type="text" className="zoho-input" value={item.hsn} onChange={(e) => handleItemChange(index, 'hsn', e.target.value)} /></div>
                                        <div className="card-field flex-1"><label>{t.qty}{showSubs ? ' / Qty' : ''}</label><input type="number" className="zoho-input" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} inputMode="numeric" /></div>
                                        <div className="card-field flex-1"><label>{t.rate}{showSubs ? ' / Rate' : ''}</label><input type="number" className="zoho-input" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} inputMode="decimal" /></div>
                                    </div>
                                    <div className="card-amount"><span>{t.amount}{showSubs ? ' / Amount' : ''}:</span><span className="amount-val">₹ {item.amount}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="btn-add-new-row" onClick={handleAddItem}><span>+</span> {t.addItem}{showSubs ? ' / Add Item' : ''}</button>
            </div>

            <div className="bill-footer">
                <div className="footer-left">
                    <div className="notes-label">{t.notes}{showSubs ? ' / Notes' : ''}</div>
                    <textarea className="notes-area" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={showSubs ? `${t.notes || 'Notes'}...` : `${t.notes || 'குறிப்புகள்'}...`} />
                    <div className="notes-label" style={{ marginTop: '10px' }}>{t.terms}{showSubs ? ' / Terms & Conditions' : ''}</div>
                    <textarea className="notes-area" value={terms} onChange={(e) => setTerms(e.target.value)} placeholder={showSubs ? `${t.terms || 'Terms'}...` : `${t.terms || 'நிபந்தனைகள்'}...`} style={{ height: '60px' }} />
                </div>
                <div className="footer-right">
                    <div className="summary-row"><span>{t.subTotal}{showSubs ? ' / Sub Total' : ''}</span><span>{calculateSubtotal().toFixed(2)}</span></div>
                    <div className="summary-row"><span>CGST ({taxRates.cgst}%)</span><span>{calculateGST(calculateSubtotal(), taxRates.cgst)}</span></div>
                    <div className="summary-row"><span>SGST ({taxRates.sgst}%)</span><span>{calculateGST(calculateSubtotal(), taxRates.sgst)}</span></div>
                    <div className="summary-total"><span>{t.total}{showSubs ? ' / Total' : ''} (₹)</span><span>{calculateGrandTotal()}</span></div>
                </div>
            </div>

            <div className="sticky-footer-bar">
                <button className="btn-save" onClick={handlePreview}>{t.previewInvoice}{showSubs ? ' / Preview' : ''}</button>
                <button className="btn-cancel" onClick={onHome}>{t.cancel}{showSubs ? ' / Cancel' : ''}</button>
                <button className="btn-save" style={{ marginLeft: 'auto' }} onClick={() => handleSave(false)}><IconSave size={16} /> {t.save}{showSubs ? ' / Save' : ''}</button>
            </div>
        </div >
    );
}

export default SilksEditor;
