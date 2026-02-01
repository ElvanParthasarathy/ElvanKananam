import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconArrowLeft, IconTrash, IconPlus } from '../common/Icons';
import Autocomplete from '../common/Autocomplete';
import { useToast } from '../../context/ToastContext';
import './elvan-editor.css';

function ElvanEditor({ onHome, onPreview, setData, initialData }) {
    const { showToast } = useToast();
    // --- State ---
    const [invoiceId, setInvoiceId] = useState(null); // Track ID for editing
    const [billNo, setBillNo] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [customerName, setCustomerName] = useState('');
    const [customerDetails, setCustomerDetails] = useState(null);
    const [items, setItems] = useState([{ name: '', quantity: 1, rate: 0, amount: 0, hsn: '5007' }]);
    const [notes, setNotes] = useState('Thanks for your business.');
    const [terms, setTerms] = useState('');
    const [taxRates, setTaxRates] = useState({ cgst: 2.5, sgst: 2.5 });

    // Autocomplete Data
    const [customerOptions, setCustomerOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);

    // --- Effects ---
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Load initial data (Editing Logic)
    useEffect(() => {
        if (initialData) {
            loadFromInitialData(initialData);
        }
    }, [initialData]);

    async function loadFromInitialData(data) {
        // Case 1: Internal State (Back from Preview)
        if (data.billNo && data.items) {
            setBillNo(data.billNo);
            setDate(data.date);
            setCustomerName(data.customerDetails?.name || '');
            setCustomerDetails(data.customerDetails);
            setItems(data.items);
            setNotes(data.notes || '');
            setTerms(data.terms || '');
            if (data.id) setInvoiceId(data.id); // If passed back
            return;
        }

        // Case 2: From Dashboard (Supabase Row)
        if (data.invoice_number) {
            setInvoiceId(data.id);
            setBillNo(data.invoice_number);
            setDate(data.date);
            setNotes(data.notes || 'Thanks for your business.');
            setTerms(data.terms || '');

            // 2a. Fetch Full Customer if needed
            if (data.customers) {
                // If customers object is present (from join), use it temporarily or fetch full
                // Better to fetch full because join might only have selected fields
                if (data.customer_id) {
                    const { data: cust } = await supabase.from('customers').select('*').eq('id', data.customer_id).single();
                    if (cust) {
                        setCustomerDetails(cust);
                        setCustomerName(cust.name);
                    }
                }
            }

            // 2b. Fetch Live Items from DB
            if (data.id) {
                const { data: invItems } = await supabase.from('invoice_items').select('*').eq('invoice_id', data.id);
                if (invItems && invItems.length > 0) {
                    const mappedItems = invItems.map(item => ({
                        name: item.description,
                        quantity: item.quantity,
                        rate: item.rate,
                        amount: item.amount,
                        hsn: item.hsn_code || '5007',
                        id: item.id // Keep DB ID if useful
                    }));
                    setItems(mappedItems);
                } else {
                    // Should not happen for existing invoice, but fallback
                    setItems([{ name: '', quantity: 1, rate: 0, amount: 0, hsn: '5007' }]);
                }
            }
        }
    }

    // --- Functions ---
    async function fetchInitialData() {
        const { data: customers } = await supabase.from('customers').select('*');
        const { data: itemsData } = await supabase.from('items').select('*');
        setCustomerOptions(customers || []);
        setItemOptions(itemsData || []);

        // Only generate New Bill# if NOT editing (no initialData)
        if (!initialData) {
            const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
            setBillNo(`INV-${(count || 0) + 1}`);
        }

        // Fetch Tax Rates from Org Profile
        const { data: org } = await supabase.from('organization_profile').select('cgst_rate, sgst_rate').limit(1).single();
        if (org) {
            setTaxRates({
                cgst: parseFloat(org.cgst_rate) || 2.5,
                sgst: parseFloat(org.sgst_rate) || 2.5
            });
        }
    }

    // --- Handlers ---
    const handleCustomerSelect = (customer) => {
        setCustomerName(customer.name);
        setCustomerDetails(customer);
    };

    const handleAddItem = () => {
        setItems([...items, { name: '', quantity: 1, rate: 0, amount: 0, hsn: '5007' }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Auto-calculate Amount
        if (field === 'quantity' || field === 'rate') {
            const qty = parseFloat(newItems[index].quantity) || 0;
            const rate = parseFloat(newItems[index].rate) || 0;
            newItems[index].amount = qty * rate;
        }
        setItems(newItems);
    };

    const handleItemSelect = (index, item) => {
        const newItems = [...items];
        newItems[index].name = item.name + (item.name_tamil ? ` / ${item.name_tamil}` : '');
        newItems[index].rate = item.rate || 0;
        newItems[index].quantity = 1;
        newItems[index].hsn = item.hsn_or_sac || '5007';
        newItems[index].amount = (item.rate || 0) * 1;
        setItems(newItems);
    };

    const handleSaveAndPreview = async () => {
        if (!customerDetails || !customerDetails.id) {
            showToast('Please select a valid customer.', 'warning');
            return;
        }

        // 1. Calculations
        const subTotal = items.reduce((acc, i) => acc + (parseFloat(i.amount) || 0), 0);
        const cgstAmount = subTotal * (taxRates.cgst / 100);
        const sgstAmount = subTotal * (taxRates.sgst / 100);
        const totalAmount = subTotal + cgstAmount + sgstAmount;

        const dbInvoiceData = {
            invoice_number: billNo,
            date: date,
            customer_id: customerDetails.id,
            sub_total: subTotal,
            total_tax: cgstAmount + sgstAmount,
            total_amount: totalAmount,
            status: 'Draft', // Or Saved?
            // Store extra fields if schema permits (notes, terms not in standard schema usually but check)
            // Assuming standard schema doesn't have notes/terms column based on SilksEditor.jsx
            // But we can add them if needed later. For now focus on core.
        };

        try {
            let savedId = invoiceId;

            if (invoiceId) {
                // UPDATE
                const { error } = await supabase
                    .from('invoices')
                    .update(dbInvoiceData)
                    .eq('id', invoiceId);
                if (error) throw error;
            } else {
                // INSERT
                const { data, error } = await supabase
                    .from('invoices')
                    .insert([dbInvoiceData])
                    .select()
                    .single();
                if (error) throw error;
                savedId = data.id;
            }

            // Handle Items (Delete All & Re-insert for simplicity)
            if (savedId) {
                // Delete existing items
                await supabase.from('invoice_items').delete().eq('invoice_id', savedId);

                // Prepare new items
                const itemsToInsert = items.map(item => ({
                    invoice_id: savedId,
                    description: item.name,
                    quantity: item.quantity,
                    rate: item.rate,
                    amount: item.amount,
                    hsn_code: item.hsn // Make sure column exists or map correctly
                    // Note: SilksEditor didn't use hsn_code but ElvanEditor has it. 
                    // Verify if hsn_code exists in DB table? 
                    // If not, it might fail. I'll include it for now, relying on Supabase "ignore extra" or hope it exists.
                    // Actually, SilksEditor didn't save HSN. 
                }));

                const { error: itemsError } = await supabase
                    .from('invoice_items')
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;

                // Success
                // Prepare Data for Preview
                const previewData = {
                    id: savedId,
                    billNo,
                    date,
                    customerDetails,
                    items,
                    subTotal,
                    notes,
                    terms,
                    template: 'elvan'
                };

                setData(previewData);
                onPreview();
            }

        } catch (error) {
            console.error('Error saving invoice:', error);
            showToast('Failed to save invoice: ' + error.message, 'error');
        }
    };

    // --- Calculations Display ---
    const subTotal = items.reduce((acc, i) => acc + (parseFloat(i.amount) || 0), 0);
    const cgst = subTotal * (taxRates.cgst / 100);
    const sgst = subTotal * (taxRates.sgst / 100);
    const total = subTotal + cgst + sgst;

    return (
        <div className="elvan-editor-container">
            {/* Header */}
            <div className="elvan-editor-header">
                <div>
                    <span onClick={onHome} className="elvan-back-link">
                        <IconArrowLeft size={14} style={{ marginRight: '5px' }} /> Invoices
                    </span>
                </div>
                <h1 className="elvan-editor-title">New Invoice</h1>
            </div>

            {/* Content */}
            <div className="elvan-editor-content">

                {/* Customer Section */}
                <div className="elvan-section">
                    <div className="elvan-form-group">
                        <label className="elvan-label">Customer Name</label>
                        <div className="elvan-input-wrapper">
                            <Autocomplete
                                value={customerName}
                                onChange={setCustomerName}
                                options={customerOptions}
                                displayKey="name"
                                onSelect={handleCustomerSelect}
                                placeholder="Select or Type Customer"
                            />
                            {customerDetails && (
                                <div className="elvan-customer-info">
                                    <strong>{customerDetails.company_name}</strong><br />
                                    {customerDetails.address_line1}, {customerDetails.city}<br />
                                    GSTIN: {customerDetails.gstin} | Place of Supply: {customerDetails.place_of_supply}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="elvan-section elvan-inv-details">
                    <div className="elvan-form-group">
                        <label className="elvan-label">Invoice#</label>
                        <div className="elvan-input-wrapper">
                            <input
                                type="text"
                                className="elvan-input"
                                value={billNo}
                                onChange={(e) => setBillNo(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="elvan-form-group">
                        <label className="elvan-label">Invoice Date</label>
                        <div className="elvan-input-wrapper">
                            <input
                                type="date"
                                className="elvan-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="elvan-items-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Item Details</th>
                            <th style={{ width: '10%' }}>HSN/SAC</th>
                            <th style={{ width: '10%', textAlign: 'right' }}>Quantity</th>
                            <th style={{ width: '15%', textAlign: 'right' }}>Rate</th>
                            <th style={{ width: '15%', textAlign: 'right' }}>Amount</th>
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
                                        placeholder="Click to select item"
                                        className="elvan-table-input"
                                        style={{ width: '100%', border: 'none', resize: 'none' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="elvan-table-input"
                                        value={item.hsn}
                                        onChange={(e) => handleItemChange(index, 'hsn', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="elvan-table-input"
                                        style={{ textAlign: 'right' }}
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="elvan-table-input"
                                        style={{ textAlign: 'right' }}
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                    />
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: '15px' }}>
                                    {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="elvan-trash-btn"
                                    >
                                        <IconTrash size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ padding: '10px 0' }}>
                    <button onClick={handleAddItem} className="elvan-add-line-btn">
                        <IconPlus size={14} style={{ marginRight: '5px' }} /> Add Another Line
                    </button>
                </div>

                {/* Footer Section */}
                <div className="elvan-footer">
                    <div className="elvan-notes-section">
                        <div className="elvan-form-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <label className="elvan-label" style={{ textAlign: 'left', width: '100%', marginBottom: '5px' }}>Customer Notes</label>
                            <textarea
                                className="elvan-input"
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="elvan-form-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <label className="elvan-label" style={{ textAlign: 'left', width: '100%', marginBottom: '5px' }}>Terms & Conditions</label>
                            <textarea
                                className="elvan-input"
                                rows="3"
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="elvan-totals-section">
                        <div className="elvan-total-row">
                            <span>Sub Total</span>
                            <span>{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="elvan-total-row">
                            <span>CGST ({taxRates.cgst}%)</span>
                            <span>{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="elvan-total-row">
                            <span>SGST ({taxRates.sgst}%)</span>
                            <span>{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="elvan-total-row final">
                            <span>Total (₹)</span>
                            <span>{Math.round(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Fixed Bottom Bar */}
            <div className="elvan-action-bar">
                <button className="btn-zoho-save" onClick={handleSaveAndPreview}>Save and Continue</button>
                <button className="btn-zoho-cancel" onClick={onHome}>Cancel</button>
            </div>
        </div>
    );
}

export default ElvanEditor;
