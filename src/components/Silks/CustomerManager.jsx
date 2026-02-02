import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconTrash, IconPlus, IconEdit, IconX, IconSearch, IconRefresh } from '../common/Icons';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { showSubtitles } from '../../config/translations';

// Indian States for Place of Supply dropdown
const INDIAN_STATES = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
    'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// State code mapping for GSTIN
const STATE_CODE_MAP = {
    '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
    '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
    '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur',
    '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal',
    '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
    '26': 'Dadra and Nagar Haveli', '27': 'Maharashtra', '29': 'Karnataka', '30': 'Goa',
    '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman and Nicobar Islands',
    '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh'
};

function CustomerManager({ t, language }) {
    const showSubs = showSubtitles(language);
    const useTamilFirst = language === 'ta_mixed' || language === 'ta_only';
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [filter, setFilter] = useState('');
    const [fetchingGst, setFetchingGst] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Enhanced Form State matching Zoho Invoice structure
    const [formData, setFormData] = useState({
        // Customer Type
        customer_type: 'business', // Deprecated, using profile_type
        profile_type: 'individual', // 'individual', 'company', 'both'

        // Primary Contact - Bilingual
        salutation: '', // English Salutation (kept as general to minimize diff churn)
        salutation_tamil: '',
        first_name_tamil: '',
        first_name_english: '',
        last_name_tamil: '',
        last_name_english: '',

        // Company Details - Bilingual
        company_name_tamil: '',
        company_name_english: '',
        display_name_tamil: '',
        display_name_english: '',

        // Contact Information
        email: '',
        mobile: '',

        // GST Details
        gstin: '',
        gst_treatment: 'registered', // 'registered', 'unregistered', 'consumer', 'overseas'
        place_of_supply: 'Tamil Nadu',
        pan: '',
        tax_preference: 'taxable', // 'taxable' or 'tax_exempt'

        // Address - Tamil and English
        address_tamil: '',
        address_english: '',
        city_tamil: '',
        city_english: '',
        state: 'Tamil Nadu',
        pincode: '',

        // Legacy fields for backward compatibility
        name: '',
        name_tamil: '',
        display_name: '',
        company_name: '',
        address_line1: '',
        city: '',
        phone: '',
        type: 'silks'
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        setLoading(true);
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('type', 'silks')
            .order('name', { ascending: true });

        if (error) console.error('Error fetching customers:', error);
        else setCustomers(data || []);
        setLoading(false);
    }

    const openModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            const hasName = customer.first_name || customer.last_name || customer.name;
            const hasCompany = customer.company_name;

            setFormData({
                customer_type: customer.customer_type || 'business',
                profile_type: (hasName && hasCompany) ? 'both' : (hasCompany ? 'company' : 'individual'),
                salutation: customer.salutation || '',
                salutation_tamil: customer.salutation_tamil || '',
                first_name_tamil: customer.first_name_tamil || '',
                first_name_english: customer.first_name_english || customer.first_name || '',
                last_name_tamil: customer.last_name_tamil || '',
                last_name_english: customer.last_name_english || customer.last_name || '',
                company_name_tamil: customer.company_name_tamil || '',
                company_name_english: customer.company_name_english || customer.company_name || '',
                display_name_tamil: customer.display_name_tamil || customer.name_tamil || '',
                display_name_english: customer.display_name_english || customer.display_name || customer.name || '',
                email: customer.email || '',
                mobile: customer.mobile || customer.phone || '',
                gstin: customer.gstin || '',
                gst_treatment: customer.gst_treatment || 'registered',
                place_of_supply: customer.place_of_supply || 'Tamil Nadu',
                pan: customer.pan || '',
                tax_preference: customer.tax_preference || 'taxable',
                address_tamil: customer.address_tamil || '',
                address_english: customer.address_english || customer.address_line1 || '',
                city_tamil: customer.city_tamil || '',
                city_english: customer.city_english || customer.city || '',
                state: customer.state || 'Tamil Nadu',
                pincode: customer.pincode || '',
                name: customer.name || '',
                name_tamil: customer.name_tamil || '',
                display_name: customer.display_name || '',
                company_name: customer.company_name || '',
                address_line1: customer.address_line1 || '',
                city: customer.city || '',
                phone: customer.phone || '',
                type: 'silks'
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                customer_type: 'business',
                profile_type: 'individual',
                salutation: '',
                salutation_tamil: '',
                first_name_tamil: '',
                first_name_english: '',
                last_name_tamil: '',
                last_name_english: '',
                company_name_tamil: '',
                company_name_english: '',
                display_name_tamil: '',
                display_name_english: '',
                email: '',
                mobile: '',
                gstin: '',
                gst_treatment: 'registered',
                place_of_supply: 'Tamil Nadu',
                pan: '',
                tax_preference: 'taxable',
                address_tamil: '',
                address_english: '',
                city_tamil: '',
                city_english: '',
                state: 'Tamil Nadu',
                pincode: '',
                name: '',
                name_tamil: '',
                display_name: '',
                company_name: '',
                address_line1: '',
                city: '',
                phone: '',
                type: 'silks'
            });
        }
        setIsModalOpen(true);
    };

    // Auto-generate display name
    const generateDisplayName = (lang = 'english') => {
        if (formData.profile_type === 'company' || formData.profile_type === 'both') {
            return lang === 'tamil' ? formData.company_name_tamil : formData.company_name_english;
        }
        // Individual
        const salutation = lang === 'tamil' ? formData.salutation_tamil : formData.salutation;
        const firstName = lang === 'tamil' ? formData.first_name_tamil : formData.first_name_english;
        const lastName = lang === 'tamil' ? formData.last_name_tamil : formData.last_name_english;
        const parts = [salutation, firstName, lastName].filter(Boolean);
        return parts.join(' ') || '';
    };

    // Extract PAN from GSTIN (characters 3-12)
    const extractPanFromGstin = (gstin) => {
        if (gstin && gstin.length >= 12) {
            return gstin.substring(2, 12);
        }
        return '';
    };

    // Get state from GSTIN state code
    const getStateFromGstin = (gstin) => {
        if (gstin && gstin.length >= 2) {
            const stateCode = gstin.substring(0, 2);
            return STATE_CODE_MAP[stateCode] || 'Tamil Nadu';
        }
        return 'Tamil Nadu';
    };

    const handleSave = async () => {
        // Validate required fields
        const displayNameTamil = formData.display_name_tamil || generateDisplayName('tamil');
        const displayNameEnglish = formData.display_name_english || generateDisplayName('english');

        if (!displayNameTamil && !displayNameEnglish) {
            showToast(showSubs ? `${t.customerNameRequired || 'வாடிக்கையாளர் பெயர் தேவை'} / Customer Name is required` : (t.customerNameRequired || 'வாடிக்கையாளர் பெயர் தேவை'), 'warning');
            return;
        }

        // Prepare payload and clear irrelevant fields based on profile_type
        const payload = {
            ...formData,
            // Use Tamil name as primary name for backward compatibility, or English if Tamil missing
            name: displayNameTamil || displayNameEnglish,
            name_tamil: displayNameTamil,
            display_name: displayNameEnglish, // Keeping English name in display_name for backward compatibility
            phone: formData.mobile, // Removed work_phone support
            type: 'silks'
        };

        // Sanitize payload
        if (formData.profile_type === 'individual') {
            payload.company_name = '';
            payload.company_name_english = '';
            payload.company_name_tamil = '';
            payload.display_name_tamil = '';
            payload.display_name_english = '';
        } else if (formData.profile_type === 'company') {
            payload.salutation = '';
            payload.salutation_tamil = '';
            payload.first_name = '';
            payload.first_name_english = '';
            payload.first_name_tamil = '';
            payload.last_name = '';
            payload.last_name_english = '';
            payload.last_name_tamil = '';
        }
        // "both" keeps everything

        let error;
        if (editingCustomer) {
            const { error: updateError } = await supabase
                .from('customers')
                .update(payload)
                .eq('id', editingCustomer.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('customers')
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            showToast(`${t.error || 'பிழை'}: ${error.message}`, 'error');
        } else {
            setIsModalOpen(false);
            fetchCustomers();
            showToast(showSubs ? `${t.saved || 'சேமிக்கப்பட்டது'} / Customer saved successfully` : (t.saved || 'சேமிக்கப்பட்டது'), 'success');
        }
    };

    // Enhanced GST Details Fetch with robust auto-fill
    const fetchGstDetails = async () => {
        const gstin = formData.gstin?.toUpperCase().trim();

        if (!gstin) {
            showToast(showSubs ? 'முதலில் GSTIN-ஐ உள்ளிடவும் / Please enter a GSTIN first' : 'முதலில் GSTIN-ஐ உள்ளிடவும்', 'warning');
            return;
        }

        // Validate GSTIN format
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstinRegex.test(gstin)) {
            showToast(showSubs ? 'தவறான GSTIN வடிவம் / Invalid GSTIN format (e.g., 33AAAAA0000A1Z5)' : 'தவறான GSTIN வடிவம்', 'warning');
            return;
        }

        setFetchingGst(true);

        try {
            // NOTE: For production, you would replace this with a real API call like Appyflow or ClearTax
            // const response = await fetch(`https://api.appyflow.in/v1/gst/${gstin}?key=YOUR_API_KEY`);
            // const result = await response.json();

            // Simulation of API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Comprehensive Mock Database for demonstration
            const mockGstData = {
                '33AABCS1429B1ZT': {
                    legal_name: 'SRI SIVARAM SILKS PRIVATE LIMITED',
                    trade_name: 'Sri Sivaram Silks',
                    address: '123 GANDHI ROAD, NEAR TEMPLE',
                    city: 'Kanchipuram',
                    pincode: '631501',
                    state: 'Tamil Nadu',
                    status: 'Active'
                },
                '33AAAAA0000A1Z5': {
                    legal_name: 'ELVAN TEXTILES & SILKS',
                    trade_name: 'Elvan Silks',
                    address: '456 NEW BAZAAR STREET',
                    city: 'Arani',
                    pincode: '632317',
                    state: 'Tamil Nadu',
                    status: 'Active'
                },
                '33BCCDE1234F1Z1': {
                    legal_name: 'TAMIL NADU LOOMS CO-OP SOCIETY',
                    trade_name: 'TN Looms',
                    address: '88 WEAVERS COLONY',
                    city: 'Salem',
                    pincode: '636001',
                    state: 'Tamil Nadu',
                    status: 'Active'
                },
                '27AABCU9603R1ZM': {
                    legal_name: 'MAHARASHTRA SILK IMPORTS',
                    trade_name: 'MSI Textiles',
                    address: 'CRAWFORD MARKET, FORT',
                    city: 'Mumbai',
                    pincode: '400001',
                    state: 'Maharashtra',
                    status: 'Active'
                }
            };

            const data = mockGstData[gstin];
            const stateFromGstin = getStateFromGstin(gstin);
            const panFromGstin = extractPanFromGstin(gstin);

            if (data) {
                setFormData(prev => ({
                    ...prev,
                    company_name: data.legal_name,
                    company_name_english: data.legal_name,
                    display_name: data.trade_name || data.legal_name,
                    display_name_english: data.trade_name || data.legal_name,
                    address_line1: data.address,
                    address_english: data.address,
                    city: data.city,
                    city_english: data.city,
                    state: data.state || stateFromGstin,
                    pincode: data.pincode,
                    place_of_supply: data.state || stateFromGstin,
                    pan: panFromGstin,
                    gst_treatment: data.status === 'Active' ? 'registered' : 'unregistered',
                    profile_type: prev.profile_type === 'individual' ? 'company' : prev.profile_type // Switch to company
                }));
                showToast(showSubs ? 'விவரங்கள் பெறப்பட்டன / Details fetched successfully' : 'விவரங்கள் பெறப்பட்டன', 'success');
            } else {
                // Partial fill from GSTIN if not in mock
                setFormData(prev => ({
                    ...prev,
                    state: stateFromGstin,
                    place_of_supply: stateFromGstin,
                    pan: panFromGstin,
                    gst_treatment: 'registered',
                    profile_type: prev.profile_type === 'individual' ? 'company' : prev.profile_type // Switch to company even for basic fill
                }));
                showToast(showSubs ? 'GSTIN செல்லுபடியாகும் (Mock: பகுதி விவரங்கள் மட்டும்) / GSTIN Valid (Mock: Basic details filled)' : 'GSTIN Valid', 'info');
            }
        } catch (err) {
            showToast(`${t.error || 'பிழை'}: ${err.message}`, 'error');
        } finally {
            setFetchingGst(false);
        }
    };

    async function handleDelete(id) {
        const shouldDelete = await confirm({
            title: showSubs ? `${t.deleteCustomer || 'வாடிக்கையாளரை நீக்க'} / Delete Customer` : (t.deleteCustomer || 'வாடிக்கையாளரை நீக்க'),
            message: showSubs
                ? `${t.deleteCustomerConfirm || 'நீங்கள் இந்த வாடிக்கையாளரை கண்டிப்பாக நீக்க விரும்புகிறீர்களா?'} \n(Are you sure? This action cannot be undone.)`
                : (t.deleteCustomerConfirm || 'நீங்கள் இந்த வாடிக்கையாளரை கண்டிப்பாக நீக்க விரும்புகிறீர்களா?'),
            confirmText: showSubs ? `${t.delete || 'நீக்க'} / Delete` : (t.delete || 'நீக்க'),
            type: 'danger'
        });

        if (shouldDelete) {
            const { error } = await supabase.from('customers').delete().eq('id', id);
            if (error) showToast(`${t.error || 'பிழை'}: ${error.message}`, 'error');
            else {
                showToast(showSubs ? `${t.customerDeleted || 'வாடிக்கையாளர் நீக்கப்பட்டார்'} / Customer deleted` : (t.customerDeleted || 'வாடிக்கையாளர் நீக்கப்பட்டார்'), 'success');
                fetchCustomers();
            }
        }
    }

    const filteredCustomers = customers.filter(c =>
        (c.name && c.name.toLowerCase().includes(filter.toLowerCase())) ||
        (c.company_name && c.company_name.toLowerCase().includes(filter.toLowerCase())) ||
        (c.display_name && c.display_name.toLowerCase().includes(filter.toLowerCase())) ||
        (c.gstin && c.gstin.toLowerCase().includes(filter.toLowerCase()))
    );

    // Get display name for customer
    const getCustomerDisplayName = (customer) => {
        return customer.display_name || customer.company_name || customer.name || '-';
    };

    // Render input field helper with optional double box support
    const renderInput = (label, labelEn, name, value, onChange, options = {}) => (
        <div style={{ flex: options.flex || 1 }}>
            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text)' }}>{label}</div>
                {showSubs && <div style={{ fontSize: '10px', fontWeight: 'normal' }}>{labelEn}</div>}
            </label>
            {options.type === 'select' ? (
                <select
                    value={value}
                    onChange={onChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'var(--color-input-bg)', color: 'var(--color-text)', fontSize: '14px' }}
                >
                    {options.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : options.type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={options.placeholder}
                    rows={options.rows || 2}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'var(--color-input-bg)', color: 'var(--color-text)', fontSize: '14px', resize: 'vertical' }}
                />
            ) : (
                <input
                    type={options.type || 'text'}
                    value={value}
                    onChange={onChange}
                    placeholder={options.placeholder}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'var(--color-input-bg)', color: 'var(--color-text)', fontSize: '14px' }}
                />
            )}
        </div>
    );

    // Bilingual Input Row (Double Box)
    const renderBilingualInput = (label, labelEn, nameTamil, valTamil, setTamil, nameEnglish, valEnglish, setEnglish, options = {}) => (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            {renderInput(`${label} (தமிழ்)`, `${labelEn} (Tamil)`, nameTamil, valTamil, setTamil, options)}
            {renderInput(`${label} (English)`, `${labelEn} (English)`, nameEnglish, valEnglish, setEnglish, options)}
        </div>
    );

    return (
        <div style={{ padding: isMobile ? '15px' : '30px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* ... Header and List Views remain same ... */}
            <div style={{ padding: isMobile ? '15px' : '30px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    gap: isMobile ? '15px' : '20px',
                    marginBottom: isMobile ? '20px' : '30px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h1 style={{ fontSize: isMobile ? '1.2rem' : '22px', fontWeight: '600', margin: 0, color: 'var(--color-text)' }}>{t.customers || 'வாடிக்கையாளர்கள்'}</h1>
                        {showSubs && <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Silks Customers</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px', height: '44px', flex: isMobile ? 1 : 'none' }}>
                            <IconSearch size={16} color="var(--color-text-muted)" />
                            <input
                                type="text"
                                placeholder={showSubs ? `${t.searchPlaceholder || 'தேடுக…'} Search...` : (t.searchPlaceholder || 'தேடுக…')}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', outline: 'none', fontSize: '14px', width: isMobile ? '100%' : '180px' }}
                            />
                        </div>
                        <button
                            onClick={() => openModal()}
                            style={{
                                background: 'var(--color-brand-silks)', color: 'white', border: 'none', borderRadius: '8px',
                                padding: isMobile ? '12px 20px' : '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '8px', fontWeight: '600', height: '44px', width: isMobile ? '100%' : 'auto'
                            }}
                        >
                            <IconPlus size={18} />
                            <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                                <div style={{ fontSize: '13px' }}>{t.newCustomer || 'புதிய வாடிக்கையாளர்'}</div>
                                {showSubs && <div style={{ fontSize: '10px', fontWeight: '400', opacity: 0.9 }}>New Customer</div>}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Desktop Table View */}
                {!isMobile && (
                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                                <tr>
                                    <th style={{ padding: '12px 20px', textAlign: 'left' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.name || 'பெயர்'}</div>
                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>Name</div>}
                                    </th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.companyName || 'நிறுவனம்'}</div>
                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>Company</div>}
                                    </th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>GSTIN</div>
                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>GSTIN</div>}
                                    </th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.city || 'ஊர்'}</div>
                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>City</div>}
                                    </th>
                                    <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.actions || 'செயல்கள்'}</div>
                                        {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>Actions</div>}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>{t.loading || 'ஏற்றுகிறது...'}</td></tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>{t.noCustomers || 'வாடிக்கையாளர்கள் இல்லை'}</td></tr>
                                ) : (
                                    filteredCustomers.map(customer => (
                                        <tr key={customer.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '12px 20px', color: 'var(--color-text)', fontWeight: '500' }}>{getCustomerDisplayName(customer)}</td>
                                            <td style={{ padding: '12px 20px', color: 'var(--color-text-muted)' }}>{customer.company_name || '-'}</td>
                                            <td style={{ padding: '12px 20px' }}>
                                                {customer.gstin ? (
                                                    <span style={{ background: 'rgba(123, 31, 162, 0.1)', color: 'var(--color-brand-silks)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                        {customer.gstin}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '12px 20px', color: 'var(--color-text-muted)' }}>{customer.city || '-'}</td>
                                            <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button onClick={() => openModal(customer)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--color-text)' }}><IconEdit size={14} /></button>
                                                    <button onClick={() => handleDelete(customer.id)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--color-danger)' }}><IconTrash size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Mobile Card View */}
                {isMobile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>{t.loading || 'ஏற்றுகிறது...'}</div>
                        ) : filteredCustomers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>{t.noCustomers || 'வாடிக்கையாளர்கள் இல்லை'}</div>
                                {showSubs && <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>No customers found</div>}
                            </div>
                        ) : (
                            filteredCustomers.map(customer => (
                                <div key={customer.id} style={{ background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-brand-silks)' }}>{getCustomerDisplayName(customer)}</div>
                                            {customer.company_name && customer.company_name !== customer.name && (
                                                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{customer.company_name}</div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openModal(customer)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--color-text)' }}><IconEdit size={16} /></button>
                                            <button onClick={() => handleDelete(customer.id)} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--color-danger)' }}><IconTrash size={16} /></button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{customer.city || '-'}</span>
                                        {customer.gstin && (
                                            <span style={{ background: 'rgba(123, 31, 162, 0.1)', color: 'var(--color-brand-silks)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                                                {customer.gstin}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Enhanced Modal Form */}
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'var(--color-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
                        <div style={{
                            background: 'var(--color-surface)',
                            borderRadius: '16px',
                            width: isMobile ? '100%' : '850px',
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            border: '1px solid var(--color-border)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}>
                            {/* Modal Header */}
                            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 10 }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--color-text)' }}>
                                        {editingCustomer ? (t.editCustomer || 'வாடிக்கையாளரை திருத்து') : (t.newCustomer || 'புதிய வாடிக்கையாளர்')}
                                    </h2>
                                    {showSubs && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{editingCustomer ? 'Edit Customer' : 'New Customer'}</div>}
                                </div>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '8px' }}><IconX size={20} /></button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '25px' }}>
                                {/* GSTIN Prefill Section - MOVED TO TOP */}
                                <div style={{ background: 'linear-gradient(135deg, rgba(123, 31, 162, 0.05), rgba(123, 31, 162, 0.1))', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid rgba(123, 31, 162, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-brand-silks)' }}>🔍 {t.prefillFromGst || 'GST போர்டலில் இருந்து தானாக நிரப்பு'}</span>
                                    </div>
                                    {showSubs && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Prefill Customer details from the GST portal using GSTIN</div>}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder="33AABCS1429B1ZT"
                                            value={formData.gstin}
                                            onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                                            style={{ flex: 1, padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-input-bg)', color: 'var(--color-text)', fontSize: '14px', fontWeight: '600', letterSpacing: '0.5px' }}
                                        />
                                        <button
                                            onClick={fetchGstDetails}
                                            disabled={fetchingGst}
                                            style={{
                                                padding: '12px 20px', background: 'var(--color-brand-silks)', color: 'white', border: 'none',
                                                borderRadius: '8px', cursor: fetchingGst ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                                fontWeight: '600', opacity: fetchingGst ? 0.7 : 1
                                            }}
                                        >
                                            <IconRefresh size={16} className={fetchingGst ? 'spin' : ''} />
                                            {fetchingGst ? 'Fetching...' : 'Fetch'}
                                        </button>
                                    </div>
                                </div>

                                {/* Profile Type Selector */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text)' }}>{t.customerType || 'வாடிக்கையாளர் வகை'}</div>
                                        {showSubs && <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Customer Type</div>}
                                    </label>
                                    <div style={{
                                        display: 'flex',
                                        gap: isMobile ? '5px' : '10px',
                                        maxWidth: '100%',
                                        flexDirection: isMobile ? 'column' : 'row'
                                    }}>
                                        {[
                                            { type: 'individual', icon: '👤', label: t.individual || 'தனிநபர்', sub: 'Individual' },
                                            { type: 'company', icon: '🏢', label: t.business || 'வணிகம்', sub: 'Company' },
                                            { type: 'both', icon: '🏢+👤', label: t.both || 'வணிகம் + தனிநபர்', sub: 'Both' }
                                        ].map(option => (
                                            <button
                                                key={option.type}
                                                onClick={() => setFormData({ ...formData, profile_type: option.type, customer_type: option.type === 'individual' ? 'individual' : 'business' })}
                                                style={{
                                                    flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                                                    background: formData.profile_type === option.type ? 'var(--color-brand-silks)' : 'var(--color-bg)',
                                                    color: formData.profile_type === option.type ? 'white' : 'var(--color-text)',
                                                    border: formData.profile_type === option.type ? 'none' : '1px solid var(--color-border)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                }}
                                            >
                                                <span>{option.icon} {option.label}</span>
                                                {showSubs && <span style={{ fontSize: '10px', opacity: 0.8 }}>/ {option.sub}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Primary Contact (Shown for Individual or Both) */}
                                {(formData.profile_type === 'individual' || formData.profile_type === 'both') && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                                            {t.primaryContact || 'முதன்மை தொடர்பு'} {showSubs && <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ Primary Contact</span>}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px', alignItems: 'start', marginBottom: '15px' }}>
                                            {renderInput(`${t.salutation || 'முன்னொட்டு'} (தமிழ்)`, 'Salutation (Tamil)', 'salutation_tamil', formData.salutation_tamil, e => setFormData({ ...formData, salutation_tamil: e.target.value }), {
                                                type: 'select',
                                                options: [
                                                    { value: '', label: '-' },
                                                    { value: 'திரு.', label: 'திரு. (Male)' },
                                                    { value: 'திருமதி.', label: 'திருமதி. (Female)' }
                                                ]
                                            })}
                                            {renderInput(`${t.salutation || 'Salutation'} (English)`, 'Salutation (English)', 'salutation', formData.salutation, e => setFormData({ ...formData, salutation: e.target.value }), {
                                                type: 'select',
                                                options: [
                                                    { value: '', label: '-' },
                                                    { value: 'Mr.', label: 'Mr. (Male)' },
                                                    { value: 'Mrs.', label: 'Mrs. (Female)' }
                                                ]
                                            })}
                                        </div>
                                        {/* Bilingual First Name & Last Name */}
                                        {renderBilingualInput(t.firstName || 'பெயர்', 'First Name', 'first_name_tamil', formData.first_name_tamil, e => setFormData({ ...formData, first_name_tamil: e.target.value }), 'first_name_english', formData.first_name_english, e => setFormData({ ...formData, first_name_english: e.target.value }))}
                                        {renderBilingualInput(t.lastName || 'குடும்பப் பெயர்', 'Last Name', 'last_name_tamil', formData.last_name_tamil, e => setFormData({ ...formData, last_name_tamil: e.target.value }), 'last_name_english', formData.last_name_english, e => setFormData({ ...formData, last_name_english: e.target.value }))}
                                    </div>
                                )}

                                {/* Company Details (Shown for Company or Both) */}
                                {(formData.profile_type === 'company' || formData.profile_type === 'both') && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                                            {t.companyDetails || 'நிறுவன விவரங்கள்'} {showSubs && <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ Company Details</span>}
                                        </div>
                                        {renderBilingualInput(t.companyName || 'நிறுவன பெயர்', 'Company Name', 'company_name_tamil', formData.company_name_tamil, e => setFormData({ ...formData, company_name_tamil: e.target.value }), 'company_name_english', formData.company_name_english, e => setFormData({ ...formData, company_name_english: e.target.value }))}
                                        {renderBilingualInput(t.displayName || 'காட்சி பெயர்', 'Display Name', 'display_name_tamil', formData.display_name_tamil, e => setFormData({ ...formData, display_name_tamil: e.target.value }), 'display_name_english', formData.display_name_english, e => setFormData({ ...formData, display_name_english: e.target.value }), { placeholder: 'Auto-generated if empty' })}
                                    </div>
                                )}

                                {/* Contact Information */}
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                                        {t.contactInfo || 'தொடர்பு தகவல்'} {showSubs && <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ Contact Information</span>}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                                        {renderInput(t.email || 'மின்னஞ்சல்', 'Email', 'email', formData.email, e => setFormData({ ...formData, email: e.target.value }), { type: 'email' })}
                                        {renderInput(t.mobile || 'கைபேசி', 'Mobile', 'mobile', formData.mobile, e => setFormData({ ...formData, mobile: e.target.value }), { type: 'tel' })}
                                    </div>
                                </div>

                                {/* Address */}
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                                        {t.address || 'முகவரி'} {showSubs && <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ Address</span>}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {/* Bilingual Address Lines */}
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                                            {renderInput(`${t.address || 'முகவரி'} (தமிழ்)`, 'Address (Tamil)', 'address_tamil', formData.address_tamil, e => setFormData({ ...formData, address_tamil: e.target.value }), { type: 'textarea', rows: 3 })}
                                            {renderInput(`${t.address || 'Address'} (English)`, 'Address (English)', 'address_english', formData.address_english, e => setFormData({ ...formData, address_english: e.target.value }), { type: 'textarea', rows: 3 })}
                                        </div>

                                        {/* Bilingual City */}
                                        {renderBilingualInput(t.city || 'ஊர்', 'City', 'city_tamil', formData.city_tamil, e => setFormData({ ...formData, city_tamil: e.target.value }), 'city_english', formData.city_english, e => setFormData({ ...formData, city_english: e.target.value }))}

                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                                            {renderInput(t.state || 'மாநிலம்', 'State', 'state', formData.state, e => setFormData({ ...formData, state: e.target.value }), {
                                                type: 'select',
                                                options: INDIAN_STATES.map(s => ({ value: s, label: s }))
                                            })}
                                            {renderInput(t.pincode || 'அஞ்சல் குறியீடு', 'Pincode', 'pincode', formData.pincode, e => setFormData({ ...formData, pincode: e.target.value }), { placeholder: '600001' })}
                                        </div>
                                    </div>
                                </div>

                                {/* GST Details (Moved to bottom as per typical flow) */}
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                                        {t.gstDetails || 'GST விவரங்கள்'} {showSubs && <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ GST Details</span>}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                                        {renderInput(t.gstTreatment || 'GST நிலை', 'GST Treatment', 'gst_treatment', formData.gst_treatment, e => setFormData({ ...formData, gst_treatment: e.target.value }), {
                                            type: 'select',
                                            options: [
                                                { value: 'registered', label: 'Registered Business - Regular' },
                                                { value: 'unregistered', label: 'Unregistered Business' },
                                                { value: 'consumer', label: 'Consumer' },
                                                { value: 'overseas', label: 'Overseas' }
                                            ]
                                        })}
                                        {renderInput(t.placeOfSupply || 'வழங்கும் இடம்', 'Place of Supply', 'place_of_supply', formData.place_of_supply, e => setFormData({ ...formData, place_of_supply: e.target.value }), {
                                            type: 'select',
                                            options: INDIAN_STATES.map(s => ({ value: s, label: s }))
                                        })}
                                        {renderInput('PAN', 'PAN', 'pan', formData.pan, e => setFormData({ ...formData, pan: e.target.value.toUpperCase() }), { placeholder: 'ABCDE1234F' })}
                                        {renderInput(t.taxPreference || 'வரி விருப்பம்', 'Tax Preference', 'tax_preference', formData.tax_preference, e => setFormData({ ...formData, tax_preference: e.target.value }), {
                                            type: 'select',
                                            options: [
                                                { value: 'taxable', label: 'Taxable' },
                                                { value: 'tax_exempt', label: 'Tax Exempt' }
                                            ]
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{ padding: '20px 25px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', position: 'sticky', bottom: 0, background: 'var(--color-surface)' }}>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: '12px 24px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-text)', fontWeight: '600' }}
                                >
                                    {t.cancel || 'ரத்து'} {showSubs && <span style={{ fontSize: '11px', opacity: 0.7 }}>/ Cancel</span>}
                                </button>
                                <button
                                    onClick={handleSave}
                                    style={{ padding: '12px 24px', background: 'var(--color-brand-silks)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    {t.save || 'சேமி'} {showSubs && <span style={{ fontSize: '11px', opacity: 0.9 }}>/ Save</span>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerManager;
