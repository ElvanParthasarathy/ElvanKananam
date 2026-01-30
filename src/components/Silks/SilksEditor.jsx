import React, { useState, useEffect } from 'react';
import { IconTrash, IconPlus, IconPrinter, IconHome, IconMenu, IconSave } from '../common/Icons';
import Autocomplete from '../common/Autocomplete';
import { supabase } from '../../config/supabaseClient';
import './SilksEditor.css';

/**
 * SilksEditor Component
 * 
 * Re-designed to match the premium Zoho-style layout of BillEditor.
 * Supports HSN codes, custom tax rates, and notes.
 */
function SilksEditor({ onHome, onPreview, setData, initialData }) {
    const [invoiceId, setInvoiceId] = useState(null);
    const [billNo, setBillNo] = useState('');
    const [date, setDate] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerDetails, setCustomerDetails] = useState(null);
    const [items, setItems] = useState([{ name: '', quantity: 1, rate: 0, amount: 0, hsn: '5007' }]);
    const [notes, setNotes] = useState('Thanks for your business.');
    const [terms, setTerms] = useState('');
    const [taxRates, setTaxRates] = useState({ cgst: 2.5, sgst: 2.5 });

    // Autocomplete Data
    const [customerOptions, setCustomerOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);

    // Fetch Initial Data
    useEffect(() => {
        async function fetchData() {
            const { data: customers } = await supabase.from('customers').select('*');
            const { data: itemsData } = await supabase.from('items').select('*');
            setCustomerOptions(customers || []);
            setItemOptions(itemsData || []);

            // Set initial date if not editing
            if (!initialData) {
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const year = today.getFullYear();
                setDate(`${day}/${month}/${year}`);

                // Generate Bill No
                const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
                setBillNo(`INV-${(count || 0) + 1}`);
            }

            // Fetch Tax Rates
            const { data: org } = await supabase.from('organization_profile').select('cgst_rate, sgst_rate').limit(1).single();
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

            if (data.customer_id) {
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
            taxRates
        });
        onPreview();
    };

    const handleSave = async () => {
        if (!customerDetails || !customerDetails.id) {
            alert('Please select a valid customer.');
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
            }

            if (savedId) {
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
                alert('Invoice Saved Successfully!');
                onHome();
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Failed to save invoice: ' + error.message);
        }
    };

    return (
        <div className="bill-editor-container">
            <div className="page-header">
                <div className="page-title">
                    {invoiceId ? 'Edit Invoice' : 'New Silks Invoice'}
                </div>
            </div>

            <div className="customer-row">
                <div className="customer-field-col">
                    <label className="zoho-label">Customer Name*</label>
                    <Autocomplete
                        value={customerName}
                        onChange={setCustomerName}
                        options={customerOptions}
                        placeholder="Search customer..."
                        displayKey="name"
                        onSelect={handleCustomerSelect}
                    />
                </div>
                {customerDetails && (
                    <div style={{ width: '250px' }}>
                        <label className="zoho-label-normal">Place of Supply</label>
                        <div className="zoho-input" style={{ background: 'var(--color-bg)', opacity: 0.8 }}>
                            {customerDetails.city || 'Tamil Nadu'}
                        </div>
                    </div>
                )}
            </div>

            <div className="invoice-details-row">
                <div className="detail-field-group">
                    <label className="zoho-label">Invoice#*</label>
                    <input type="text" className="zoho-input" value={billNo} onChange={(e) => setBillNo(e.target.value)} inputMode="numeric" />
                </div>
                <div className="detail-field-group">
                    <label className="zoho-label">Invoice Date*</label>
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
                                <th style={{ width: '35%' }}>ITEM DETAILS</th>
                                <th style={{ width: '15%' }}>HSN/SAC</th>
                                <th style={{ textAlign: 'right', width: '10%' }}>QTY</th>
                                <th style={{ textAlign: 'right', width: '15%' }}>RATE</th>
                                <th style={{ textAlign: 'right', width: '20%' }}>AMOUNT</th>
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
                                            placeholder="Select item..."
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
                                    <button className="btn-remove-card" onClick={() => handleRemoveItem(index)}>Delete</button>
                                </div>
                                <div className="card-body">
                                    <div className="card-field">
                                        <label>Description</label>
                                        <Autocomplete value={item.name} onChange={(val) => handleItemChange(index, 'name', val)} options={itemOptions} displayKey="name" onSelect={(val) => handleItemSelect(index, val)} />
                                    </div>
                                    <div className="card-row">
                                        <div className="card-field flex-1"><label>HSN</label><input type="text" className="zoho-input" value={item.hsn} onChange={(e) => handleItemChange(index, 'hsn', e.target.value)} /></div>
                                        <div className="card-field flex-1"><label>Qty</label><input type="number" className="zoho-input" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} inputMode="numeric" /></div>
                                        <div className="card-field flex-1"><label>Rate</label><input type="number" className="zoho-input" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} inputMode="decimal" /></div>
                                    </div>
                                    <div className="card-amount"><span>Amount:</span><span className="amount-val">₹ {item.amount}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="btn-add-new-row" onClick={handleAddItem}><span>+</span> Add Item</button>
            </div>

            <div className="bill-footer">
                <div className="footer-left">
                    <div className="notes-label">Notes</div>
                    <textarea className="notes-area" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." />
                    <div className="notes-label" style={{ marginTop: '10px' }}>Terms & Conditions</div>
                    <textarea className="notes-area" value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Terms..." style={{ height: '60px' }} />
                </div>
                <div className="footer-right">
                    <div className="summary-row"><span>Sub Total</span><span>{calculateSubtotal().toFixed(2)}</span></div>
                    <div className="summary-row"><span>CGST ({taxRates.cgst}%)</span><span>{calculateGST(calculateSubtotal(), taxRates.cgst)}</span></div>
                    <div className="summary-row"><span>SGST ({taxRates.sgst}%)</span><span>{calculateGST(calculateSubtotal(), taxRates.sgst)}</span></div>
                    <div className="summary-total"><span>Total (₹)</span><span>{calculateGrandTotal()}</span></div>
                </div>
            </div>

            <div className="sticky-footer-bar">
                <button className="btn-save" onClick={handlePreview}>Preview Invoice</button>
                <button className="btn-cancel" onClick={onHome}>Cancel</button>
                <button className="btn-helper" style={{ marginLeft: 'auto' }} onClick={handleSave}><IconSave size={16} /> Save</button>
            </div>
        </div>
    );
}

export default SilksEditor;
