import './BillEditor.css';
// import { IconTrash, IconPlus, IconPrinter, IconFloppy } from '../common/Icons'; // FIX: IconFloppy does not exist and these are unused
import Autocomplete from '../common/Autocomplete';
import { defaultItems, defaultCustomers } from '../../config/defaults';
import React, { useState, useEffect } from 'react';

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
    companyOptions = []
}) {

    // Defensively ensure items is an array
    const safeItems = Array.isArray(items) ? items : [];

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

    const handleCustomerSelect = (customer) => {
        if (setCustomerName) setCustomerName(customer.name);
        if (setCity) setCity(customer.city);
    };

    return (
        <div className="bill-editor-container">

            {/* Top Header */}
            <div className="page-header">
                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="page-title">{t?.createBill || "New Invoice"}</div>
                </div>
            </div>


            {/* 1. Customer Name Row (Full Width) */}
            <div className="customer-row">
                <div className="customer-field-col">
                    <label className="zoho-label">{t?.customer || "Customer Name"}*</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <Autocomplete
                                value={customerName}
                                onChange={setCustomerName}
                                options={defaultCustomers || []}
                                placeholder={t?.enterName || "Select or add a customer"}
                                displayKey="name"
                                onSelect={handleCustomerSelect}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ width: '250px' }}>
                    <label className="zoho-label-normal">{t?.placeCity || "City"}</label>
                    <input
                        type="text"
                        className="zoho-input"
                        value={city}
                        onChange={(e) => setCity?.(e.target.value)}
                        placeholder="City"
                    />
                </div>
            </div>

            {/* 2. Invoice Details Row */}
            <div className="invoice-details-row">
                <div className="detail-field-group">
                    <label className="zoho-label">{t?.billNo || "Invoice#"}*</label>
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
                    <label className="zoho-label">{t?.date || "Invoice Date"}*</label>
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
                                const d = e.target.value; // YYYY-MM-DD
                                if (d) {
                                    const [y, m, day] = d.split('-');
                                    setDate?.(`${day}/${m}/${y}`);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Company Selection */}
                <div className="detail-field-group">
                    <label className="zoho-label-normal">{t?.company || "Company"}</label>
                    <select
                        value={companyId}
                        onChange={(e) => setCompanyId?.(e.target.value)}
                        className="zoho-select"
                    >
                        {Array.isArray(companyOptions) && companyOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>
                                {language === 'ta' && opt.nameTamil ? opt.nameTamil : opt.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>


            {/* 3. Item Table / Mobile Cards */}
            <div className="bill-table-wrapper">

                {/* Desktop Table View */}
                <div className="desktop-only-view">
                    <table className="bill-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>ITEM DETAILS</th>
                                <th style={{ textAlign: 'right', width: '15%' }}>QUANTITY</th>
                                <th style={{ textAlign: 'right', width: '15%' }}>RATE</th>
                                <th style={{ textAlign: 'right', width: '20%' }}>AMOUNT</th>
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
                                            options={defaultItems || []}
                                            placeholder="Type or click to select an item."
                                            displayKey="name"
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
                </div>

                {/* Mobile Card View */}
                <div className="mobile-only-view">
                    <div className="mobile-items-list">
                        {safeItems.map((item, index) => (
                            <div key={index} className="mobile-item-card">
                                <div className="card-header">
                                    <span className="item-number">Item #{index + 1}</span>
                                    <button
                                        className="btn-remove-card"
                                        onClick={() => handleRemoveItem(index)}
                                    >
                                        Delete
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="card-field">
                                        <label>Item Name</label>
                                        <Autocomplete
                                            value={item.porul}
                                            onChange={(value) => handleItemChange(index, 'porul', value)}
                                            options={defaultItems || []}
                                            placeholder="Search items..."
                                            displayKey="name"
                                        />
                                    </div>
                                    <div className="card-row">
                                        <div className="card-field flex-1">
                                            <label>Quantity</label>
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
                                            <label>Rate</label>
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
                                        <span>Amount:</span>
                                        <span className="amount-val">₹ {calculateRowTotal(item)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="btn-add-new-row" onClick={handleAddItem}>
                    <span>+</span> Add New Row
                </button>
            </div>

            {/* 4. Footer Section */}
            <div className="bill-footer">

                {/* Left: Bank Details */}
                <div className="footer-left">
                    <div>
                        <div className="notes-label">வங்கி விவரம் :</div>
                        <textarea
                            className="notes-area"
                            value={bankDetails}
                            onChange={(e) => setBankDetails?.(e.target.value)}
                            placeholder="வங்கி பெயர், ஊர்..."
                        />
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <div className="notes-label">கணக்கு எண் :</div>
                        <input
                            type="text"
                            className="zoho-input"
                            style={{ width: '100%' }}
                            value={accountNo}
                            onChange={(e) => setAccountNo?.(e.target.value)}
                            placeholder="Account Number"
                        />
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <div className="notes-label">Terms & Conditions</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            1. Goods once sold will not be taken back.
                        </div>
                    </div>
                </div>

                {/* Right: Totals */}
                <div className="footer-right">
                    <div className="summary-row">
                        <span>Sub Total</span>
                        <span className="summary-value">{calculateSubtotal().toFixed(2)}</span>
                    </div>

                    {/* Extras */}
                    <div className="summary-row" style={{ marginTop: '16px' }}>
                        <span>{t?.setharam || "Setharam"} (g)</span>
                        <input
                            type="number"
                            className="table-input"
                            style={{ textAlign: 'right', width: '80px', borderBottom: '1px solid var(--color-border)' }}
                            value={setharamGrams}
                            onChange={(e) => setSetharamGrams?.(e.target.value)}
                            placeholder="0"
                            inputMode="decimal"
                        />
                    </div>

                    <div className="summary-row">
                        <span>{t?.courier || "Courier"} (+)</span>
                        <input
                            type="number"
                            className="table-input"
                            style={{ textAlign: 'right', width: '80px', borderBottom: '1px solid var(--color-border)' }}
                            value={courierRs}
                            onChange={(e) => setCourierRs?.(e.target.value)}
                            placeholder="0.00"
                            inputMode="decimal"
                        />
                    </div>

                    <div className="summary-row">
                        <span>{t?.ahimsaSilk || "Ahimsa Silk"} (+)</span>
                        <input
                            type="number"
                            className="table-input"
                            style={{ textAlign: 'right', width: '80px', borderBottom: '1px solid var(--color-border)' }}
                            value={ahimsaSilkRs}
                            onChange={(e) => setAhimsaSilkRs?.(e.target.value)}
                            placeholder="0.00"
                            inputMode="decimal"
                        />
                    </div>

                    {/* Other Charges Dynamic */}
                    <div className="summary-row">
                        <input
                            type="text"
                            className="table-input"
                            value={customChargeName}
                            onChange={(e) => setCustomChargeName?.(e.target.value)}
                            placeholder="Adjustment"
                            style={{ textAlign: 'left', width: '100px', fontSize: '0.85rem' }}
                        />
                        <input
                            type="number"
                            className="table-input"
                            style={{ textAlign: 'right', width: '80px', borderBottom: '1px solid var(--color-border)' }}
                            value={customChargeRs}
                            onChange={(e) => setCustomChargeRs?.(e.target.value)}
                            placeholder="0.00"
                            inputMode="decimal"
                        />
                    </div>

                    <div className="summary-total">
                        <span>Total ( ₹ )</span>
                        <span>{calculateGrandTotal()}</span>
                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="sticky-footer-bar">
                <button className="btn-save" onClick={onPreview}>
                    Preview Bill
                </button>
                <button className="btn-cancel" onClick={onHome}>
                    Cancel
                </button>

                <div className="footer-helper-btns">
                    <button onClick={onLoadTestData} className="btn-helper">Test</button>
                    <button onClick={onResetData} className="btn-helper">Reset</button>
                </div>
            </div>

        </div>
    );
}

export default BillEditor;
