import { IconTrash, IconPlus, IconPrinter, IconSun, IconMoon, IconAuto, IconHome, IconMenu } from '../common/Icons'; // Added IconMenu
import Autocomplete from '../common/Autocomplete';
import { defaultItems, defaultCustomers } from '../../config/defaults';
import Sidebar from '../common/Sidebar'; // Import Sidebar
import { useState } from 'react'; // Import useState for sidebar

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
    ahimsaSilkRs,
    setAhimsaSilkRs,
    customChargeName,
    setCustomChargeName,
    customChargeRs,
    setCustomChargeRs,
    onPreview,
    onHome,
    onLoadTestData,
    onResetData,
    companyId,
    setCompanyId,
    companyOptions
}) {
    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    // Generate CSS variables for dynamic editor theming based on company config
    const editorStyles = {
        '--color-primary': config.colors.primary,
        '--color-accent': config.colors.accent,
        // Make "Add Item" button look like the Primary button (Solid Accent + White Text)
        '--color-success': '#ffffff',
        '--color-success-bg': config.colors.accent,
    };

    return (
        <div className="editor-wrapper" style={editorStyles}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                t={t}
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                setTheme={setTheme}
            />

            {/* Top Bar - Navigation & Menu */}
            <div className="top-bar">
                {/* Home Button */}
                <button
                    className="lang-btn"
                    onClick={onHome}
                    title="Home"
                    style={{ marginRight: 'auto' }}
                >
                    <IconHome size={20} />
                </button>

                {/* Sidebar Trigger (Menu) */}
                <button
                    className="lang-btn"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Settings"
                >
                    <IconMenu size={24} />
                </button>
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

                {/* Company Selector Moved Here */}
                <div className="input-group" style={{ marginBottom: '16px' }}>
                    <label className="input-label">{t.company}</label>
                    <select
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', appearance: 'none' }}
                    >
                        {companyOptions && companyOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>
                                {language === 'ta' && opt.nameTamil ? opt.nameTamil : opt.name}
                            </option>
                        ))}
                    </select>
                </div>
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
                <div className="input-row input-row-2">
                    <div className="input-group">
                        <label className="input-label">{t.ahimsaSilk}</label>
                        <input
                            type="number"
                            className="input-field"
                            value={ahimsaSilkRs}
                            onChange={(e) => setAhimsaSilkRs(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    {/* Empty placeholder to keep alignment if needed, or remove if single row is fine */}
                    <div className="input-group">
                    </div>
                </div>
                <div className="input-row input-row-2">
                    <div className="input-group">
                        <label className="input-label">{t.otherName}</label>
                        <input
                            type="text"
                            className="input-field"
                            value={customChargeName}
                            onChange={(e) => setCustomChargeName(e.target.value)}
                            placeholder={t.otherName}
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">{t.otherAmount}</label>
                        <input
                            type="number"
                            className="input-field"
                            value={customChargeRs}
                            onChange={(e) => setCustomChargeRs(e.target.value)}
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
        </div >
    );
}

export default BillEditor;
