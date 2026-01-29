import React, { useState, useEffect } from 'react';
import { IconTrash, IconPlus, IconPrinter, IconHome, IconMenu, IconSave } from '../common/Icons';
import Autocomplete from '../common/Autocomplete';
import { supabase } from '../../config/supabaseClient';

function SilksEditor({ onHome, onPreview, setData }) {
    const [billNo, setBillNo] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [customerName, setCustomerName] = useState('');
    const [customerDetails, setCustomerDetails] = useState(null);

    const [items, setItems] = useState([{ name: '', quantity: 1, rate: 0, amount: 0 }]); // Changed from (porul, coolie, kg) to (name, quantity, rate, amount)
    const [useElvanTemplate, setUseElvanTemplate] = useState(false);

    // Autocomplete Data
    const [customerOptions, setCustomerOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);

    // Fetch Initial Data
    useEffect(() => {
        async function fetchData() {
            const { data: customers } = await supabase.from('customers').select('*');
            const { data: items } = await supabase.from('items').select('*');
            setCustomerOptions(customers || []);
            setItemOptions(items || []);

            // Generate Bill No (Simple Logic)
            const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
            setBillNo(`INV-${(count || 0) + 1}`);
        }
        fetchData();
    }, []);

    // Handlers
    const handleAddItem = () => setItems([...items, { name: '', quantity: 1, rate: 0, amount: 0 }]);

    const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        // Auto-calc amount
        if (field === 'quantity' || field === 'rate') {
            const qty = parseFloat(newItems[index].quantity) || 0;
            const rate = parseFloat(newItems[index].rate) || 0;
            newItems[index].amount = qty * rate;
        }
        setItems(newItems);
    };

    const handleItemSelect = (index, item) => {
        const newItems = [...items];
        newItems[index].name = item.name_tamil ? `${item.name} / ${item.name_tamil}` : item.name;
        newItems[index].rate = item.rate;
        newItems[index].quantity = 1;
        newItems[index].amount = item.rate * 1;
        setItems(newItems);
    };

    const handleCustomerSelect = (customer) => {
        setCustomerName(customer.name);
        setCustomerDetails(customer);
    };

    const handlePreview = () => {
        // Calculate Totals locally for preview
        const subTotal = items.reduce((acc, i) => acc + (parseFloat(i.amount) || 0), 0);
        setData({
            billNo,
            date,
            customerDetails,
            items,
            subTotal,
            template: useElvanTemplate ? 'elvan' : 'classic'
        });
        onPreview();
    };

    const handleSave = async () => {
        if (!customerDetails || !customerDetails.id) {
            alert('Please select a valid customer.');
            return;
        }

        const subTotal = items.reduce((acc, i) => acc + (parseFloat(i.amount) || 0), 0);
        const taxRate = 0.05; // 5% GST
        const totalTax = subTotal * taxRate; // Total Tax Amount
        const totalAmount = subTotal + totalTax;

        const invoiceId = await saveInvoiceToDb({
            invoice_number: billNo,
            date,
            customer_id: customerDetails.id,
            sub_total: subTotal,
            total_tax: totalTax,
            total_amount: totalAmount,
            status: 'Draft' // Default status
        }, items);

        if (invoiceId) {
            alert('Invoice Saved Successfully!');
            onHome(); // Go back to Dashboard
        }
    };

    async function saveInvoiceToDb(invoiceData, itemsData) {
        try {
            // 1. Insert Invoice
            const { data: invoice, error: invError } = await supabase
                .from('invoices')
                .insert([invoiceData])
                .select()
                .single();

            if (invError) throw invError;

            // 2. Insert Items
            const itemsToInsert = itemsData.map(item => ({
                invoice_id: invoice.id,
                description: item.name, // Mapping name to description for now or need to check schema
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount
                // We might want to link item_id if we have it, but for now text description is fine
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            return invoice.id;

        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Error saving invoice: ' + error.message);
            return null;
        }
    }

    return (
        <div className="editor-wrapper">
            {/* Top Bar - Navigation */}
            <div className="top-bar">
                <button className="lang-btn" onClick={onHome} title="Home" style={{ marginRight: 'auto' }}>
                    <IconHome size={20} />
                </button>
            </div>

            <div className="app-branding">
                <span className="app-name-english">Sri Jaipriya Silks</span>
            </div>

            <div className="editor-header-wrapper">
                <h1 className="editor-title">New Invoice</h1>
            </div>

            {/* Bill Details */}
            <div className="card">
                <div className="card-title">Invoice Details</div>
                <div className="input-row input-row-2">
                    <div className="input-group">
                        <label className="input-label">Bill No</label>
                        <input type="text" className="input-field" value={billNo} onChange={(e) => setBillNo(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Date</label>
                        <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Customer */}
            <div className="card">
                <div className="card-title">Customer</div>
                <div className="input-group">
                    <label className="input-label">Name</label>
                    <Autocomplete
                        value={customerName}
                        onChange={setCustomerName}
                        options={customerOptions}
                        displayKey="name" // Shows name in dropdown
                        onSelect={handleCustomerSelect}
                        placeholder="Search Customer..."
                    />
                </div>
                {customerDetails && (
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
                        <strong>{customerDetails.company_name}</strong><br />
                        GSTIN: {customerDetails.gstin}<br />
                        {customerDetails.place_of_supply}
                    </div>
                )}
            </div>

            {/* Items */}
            <div className="card">
                <div className="card-title">Items</div>
                {items.map((item, index) => (
                    <div key={index} className="item-row" style={{ flexDirection: 'column', gap: '8px' }}>
                        {items.length > 1 && (
                            <button className="delete-btn" onClick={() => handleRemoveItem(index)} style={{ alignSelf: 'flex-end' }}>
                                <IconTrash size={14} />
                            </button>
                        )}

                        {/* Item Name */}
                        <div className="input-group" style={{ width: '100%' }}>
                            <label className="input-label">Item / Description</label>
                            <Autocomplete
                                value={item.name}
                                onChange={(val) => handleItemChange(index, 'name', val)}
                                options={itemOptions}
                                displayKey="name"
                                onSelect={(val) => handleItemSelect(index, val)}
                                placeholder="Select Saree..."
                            />
                        </div>

                        {/* Qty, Rate, Amount */}
                        <div className="input-row input-row-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <div className="input-group">
                                <label className="input-label">Qty</label>
                                <input type="number" className="input-field" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Rate</label>
                                <input type="number" className="input-field" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Amount</label>
                                <div className="input-field" style={{ background: '#eee' }}>{item.amount}</div>
                            </div>
                        </div>
                    </div>
                ))}

                <button className="btn btn-add" onClick={handleAddItem} style={{ marginTop: '10px', width: '100%' }}>
                    <IconPlus size={18} /> Add Item
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingBottom: '30px', alignItems: 'center' }}>
                <div style={{ marginRight: 'auto' }}></div>
                <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1 }}>
                    <IconSave size={20} /> Save
                </button>
                <button className="btn btn-secondary" onClick={handlePreview} style={{ flex: 1 }}>
                    <IconPrinter size={20} /> Preview
                </button>
            </div>
        </div>
    );
}

export default SilksEditor;
