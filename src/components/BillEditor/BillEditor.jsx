import React from 'react';
import { IconTrash, IconPlus, IconPrinter, IconSun, IconMoon, IconAuto } from '../common/Icons';
import Autocomplete from '../common/Autocomplete';
import { defaultItems, defaultCustomers } from '../../config/defaults';

/**
 * BillEditor Component
 * 
 * Mobile-first form for entering bill data with language and theme support
 */
function BillEditor({
    config,
    t,
    language,
    setLanguage,
    theme,
    setTheme,
    billNo,
    setBillNo,
    date,
    setDate,
    customerName,
    setCustomerName,
    city,
    setCity,
    items,
    setItems,
    setharamGrams,
    setSetharamGrams,
    courierRs,
    setCourierRs,
    onPreview,
    onLoadTestData,
    onResetData,
    companyId,
    setCompanyId,
    companyOptions
}) {
    // Handlers
    const handleAddItem = () => {
        setItems([...items, { porul: '', coolie: '', kg: '' }]);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    // Handle customer selection from dropdown
    const handleCustomerSelect = (customer) => {
        setCustomerName(customer.name);
        setCity(customer.city);
    };

    return (
        <div className="editor-wrapper">
            {/* Top Bar - Language & Theme */}
            <div className="top-bar">
                {/* Language Selector */}
                <div className="language-selector">
                    <button
                        className={`lang-btn ${language === 'ta' ? 'active' : ''}`}
                        onClick={() => setLanguage('ta')}
                    >
                        த
                    </button>
                    <button
                        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                        onClick={() => setLanguage('en')}
                    >
                        A
                    </button>
                </div>

                {/* Theme Toggle - 3 way slider */}
                <div className="theme-toggle">
                    <button
                        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => setTheme('light')}
                        aria-label="Light mode"
                        title="Light"
                    >
                        <IconSun size={16} />
                    </button>
                    <button
                        className={`theme-btn ${theme === 'auto' ? 'active' : ''}`}
                        onClick={() => setTheme('auto')}
                        aria-label="Auto mode"
                        title="Auto"
                    >
                        <IconAuto size={16} />
                    </button>
                    <button
                        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => setTheme('dark')}
                        aria-label="Dark mode"
                        title="Dark"
                    >
                        <IconMoon size={16} />
                    </button>
                </div>
            </div>

            <div className="app-branding">
                <span className="app-name-tamil">{t.appName}</span>
                <span className="app-name-english">{t.appNameEnglish}</span>
            </div>
            {/* Header Actions */}
            <div className="editor-header-wrapper">
                <h1 className="editor-title">{t.createBill}</h1>
                <div className="editor-header-actions">
                    {/* Company Selector */}
                    <select
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        className="company-select"
                    >
                        {companyOptions && companyOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>
                                {language === 'ta' && opt.nameTamil ? opt.nameTamil : opt.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={onLoadTestData}
                        className="header-action-btn"
                    >
                        {t.test}
                    </button>
                    <button
                        type="button"
                        onClick={onResetData}
                        className="header-action-btn btn-muted"
                    >
                        {t.reset}
                    </button>
                </div>
            </div>

            {/* Invoice Details Card */}
            <div className="card">
                <div className="card-title">{t.invoiceDetails}</div>
                <div className="input-row input-row-2">
                    <div className="input-group">
                        <label className="input-label">{t.billNo}</label>
                        <input
                            type="text"
                            className="input-field"
                            value={billNo}
                            onChange={(e) => setBillNo(e.target.value)}
                            placeholder="1"
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">{t.date}</label>
                        <input
                            type="text"
                            className="input-field"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            placeholder="DD/MM/YYYY"
                        />
                    </div>
                </div>
            </div>

            {/* Customer Card */}
            <div className="card">
                <div className="card-title">{t.customer}</div>
                <div className="input-group">
                    <label className="input-label">{t.name}</label>
                    <Autocomplete
                        value={customerName}
                        onChange={setCustomerName}
                        options={defaultCustomers}
                        placeholder={t.enterName}
                        displayKey="name"
                        onSelect={handleCustomerSelect}
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">{t.placeCity}</label>
                    <input
                        type="text"
                        className="input-field"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={t.enterCity}
                    />
                </div>
            </div>

            {/* Items Card */}
            <div className="card">
                <div className="card-title">{t.itemsList}</div>

                {items.map((item, index) => (
                    <div key={index} className="item-row">
                        {items.length > 1 && (
                            <button
                                className="delete-btn"
                                onClick={() => handleRemoveItem(index)}
                                aria-label="Remove item"
                            >
                                <IconTrash size={14} />
                            </button>
                        )}

                        <div className="input-group">
                            <label className="input-label">{t.itemName}</label>
                            <Autocomplete
                                value={item.porul}
                                onChange={(value) => handleItemChange(index, 'porul', value)}
                                options={defaultItems}
                                placeholder={t.enterItem}
                                displayKey="name"
                            />
                        </div>

                        <div className="input-row input-row-2" style={{ marginTop: '8px' }}>
                            <div className="input-group">
                                <label className="input-label">{t.weight}</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    className="input-field"
                                    value={item.kg}
                                    onChange={(e) => handleItemChange(index, 'kg', e.target.value)}
                                    placeholder="0.000"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">{t.rate}</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={item.coolie}
                                    onChange={(e) => handleItemChange(index, 'coolie', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button className="btn btn-add" onClick={handleAddItem}>
                    <IconPlus size={18} />
                    {t.addAnotherItem}
                </button>
            </div>

            {/* Extras Card */}
            <div className="card">
                <div className="card-title">{t.extras}</div>
                <div className="input-row input-row-2">
                    <div className="input-group">
                        <label className="input-label">{t.setharam}</label>
                        <input
                            type="number"
                            className="input-field"
                            value={setharamGrams}
                            onChange={(e) => setSetharamGrams(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">{t.courier}</label>
                        <input
                            type="number"
                            className="input-field"
                            value={courierRs}
                            onChange={(e) => setCourierRs(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>

            {/* Fixed Preview Button */}
            <button className="btn btn-primary btn-fixed" onClick={onPreview}>
                <IconPrinter size={20} />
                {t.previewBill}
            </button>
        </div>
    );
}

export default BillEditor;
