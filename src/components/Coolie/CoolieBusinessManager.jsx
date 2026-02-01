import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconSave, IconPlus } from '../common/Icons';
import { useToast } from '../../context/ToastContext';
import { showSubtitles } from '../../config/translations';

function CoolieBusinessManager({ t, language, onSaveSuccess }) {
    const showSubs = showSubtitles(language);
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([]);
    const [selectedId, setSelectedId] = useState(null); // 'new' or ID
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showThemeDropdown, setShowThemeDropdown] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Structured State
    const [phones, setPhones] = useState(['']);
    const [bankData, setBankData] = useState({
        bankName: '',
        bankNameTamil: '',
        accountNo: '',
        ifsc: '',
        place: '',
        placeTamil: '',
        cityTamil: ''
    });

    const [formData, setFormData] = useState({
        organization_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: 'Tamil Nadu',
        district: '',
        district_tamil: '',
        pincode: '',
        email: '',
        marketing_title: '', // Tamil Name
        logo: '',
        theme_color: '#388e3c',
    });

    useEffect(() => {
        fetchProfiles();
    }, []);

    async function fetchProfiles() {
        setLoading(true);
        const { data, error } = await supabase
            .from('coolie_settings')
            .select('*')
            .eq('type', 'coolie')
            .order('organization_name', { ascending: true });

        if (error) {
            console.log('Error fetching profiles:', error.message);
        } else {
            setProfiles(data || []);
            if (data && data.length > 0 && !selectedId) {
                selectProfile(data[0]);
            } else if (data && data.length === 0) {
                handleAddNew();
            }
        }
        setLoading(false);
    }

    const selectProfile = (profile) => {
        setSelectedId(profile.id);

        // Parse Phones
        const profilePhones = profile.phone ? profile.phone.split(',') : [''];
        setPhones(profilePhones);

        // Parse Bank Data from New Columns (Fallback to website JSON if needed, but prefer columns)
        // Note: We check if new columns exist, else fall back to parsing legacy 'website' JSON
        let parsedBank = {
            bankName: profile.bank_name || '',
            bankNameTamil: profile.bank_name_tamil || '',
            accountNo: profile.account_no || '',
            ifsc: profile.ifsc_code || '',
            place: profile.branch || '',
            placeTamil: profile.branch_tamil || '',
            cityTamil: profile.city_tamil || ''
        };

        // Legacy Fallback if columns are empty but website has data
        if (!parsedBank.bankName && profile.website) {
            try {
                const json = JSON.parse(profile.website);
                if (typeof json === 'object') {
                    parsedBank = { ...parsedBank, ...json };
                }
            } catch (e) { /* ignore */ }
        }

        setBankData(parsedBank);

        setFormData({
            organization_name: profile.organization_name || '',
            address_line1: profile.address_line1 || '',
            address_line2: profile.address_line2 || '',
            city: profile.city || '',
            state: profile.state || '',
            district: profile.district || '',
            district_tamil: profile.district_tamil || '',
            pincode: profile.pincode || '',
            email: profile.email || '',
            marketing_title: profile.marketing_title || '',
            logo: profile.logo || '',
            theme_color: profile.theme_color || '#388e3c',
        });
    };

    const handleAddNew = () => {
        setSelectedId('new');
        setPhones(['']);
        setBankData({ bankName: '', bankNameTamil: '', accountNo: '', ifsc: '', place: '', placeTamil: '', cityTamil: '' });
        setFormData({
            organization_name: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: 'Tamil Nadu',
            district: '',
            district_tamil: '',
            pincode: '',
            email: '',
            marketing_title: '',
            logo: '',
            theme_color: '#388e3c',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Phone Handlers
    const handlePhoneChange = (index, value) => {
        const newPhones = [...phones];
        newPhones[index] = value;
        setPhones(newPhones);
    };
    const addPhone = () => setPhones([...phones, '']);
    const removePhone = (index) => {
        const newPhones = phones.filter((_, i) => i !== index);
        setPhones(newPhones.length ? newPhones : ['']);
    };

    // Bank Handlers
    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setBankData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!formData.organization_name) {
            showToast(showSubs ? `${t.orgNameRequired} / Organization Name is required` : t.orgNameRequired, 'warning');
            return;
        }

        // Exclude state from payload to avoid schema errors if column is missing
        // It defaults to 'Tamil Nadu' in DB anyway
        const { state, ...restData } = formData;

        const payload = {
            ...restData,
            type: 'coolie',

            // Explicit Column Mapping
            city_tamil: bankData.cityTamil,
            bank_name: bankData.bankName,
            bank_name_tamil: bankData.bankNameTamil,
            account_no: bankData.accountNo,
            ifsc_code: bankData.ifsc,
            branch: bankData.place,
            branch_tamil: bankData.placeTamil,

            phone: phones.filter(p => p.trim()).join(',')
        };

        const { error } = (selectedId === 'new')
            ? await supabase.from('coolie_settings').insert([payload])
            : await supabase.from('coolie_settings').update(payload).eq('id', selectedId);

        if (error) {
            showToast(`${t.error}: ${error.message}`, 'error');
        } else {
            showToast(t.profileSaved || 'Profile Saved!', 'success');
            if (onSaveSuccess) onSaveSuccess();
            fetchProfiles();
        }
    };

    if (loading && profiles.length === 0) return (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '500' }}>{t.loading}</span>
                {showSubs && <span style={{ fontSize: '14px', opacity: 0.8 }}>Loading Profiles...</span>}
            </div>
        </div>
    );

    return (
        <div style={{ padding: isMobile ? '15px' : '30px' }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: '20px',
                gap: '15px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: isMobile ? '1.2rem' : '22px', fontWeight: '600', margin: 0, color: 'var(--color-text)' }}>{t.businessProfile}</h2>
                    {showSubs && <span style={{ fontSize: '13px', color: '#6b7280' }}>Coolie Business Settings</span>}
                </div>

                <div style={{
                    display: 'flex',
                    gap: isMobile ? '10px' : '15px',
                    width: isMobile ? '100%' : 'auto',
                    flexDirection: isMobile ? 'column' : 'row'
                }}>
                    {/* Custom Dual-Language Dropdown */}
                    <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{
                                width: '100%',
                                padding: '8px 15px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                height: '44px',
                                textAlign: 'left',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                {selectedId === 'new' ? (
                                    <>
                                        <span style={{ fontWeight: '600', fontSize: '13px' }}>{t.addNew}</span>
                                        {showSubs && <span style={{ fontSize: '10px', opacity: 0.8 }}>Add New Profile</span>}
                                    </>
                                ) : (
                                    (() => {
                                        const p = profiles.find(x => x.id === selectedId);
                                        const title = p?.marketing_title || p?.organization_name || t.selectProfile;
                                        const subTitle = p?.organization_name;
                                        return (
                                            <>
                                                <span style={{ fontWeight: '600', fontSize: '13px' }}>{title}</span>
                                                {showSubs && subTitle && subTitle !== title && <span style={{ fontSize: '10px', opacity: 0.8 }}>{subTitle}</span>}
                                                {showSubs && !subTitle && <span style={{ fontSize: '10px', opacity: 0.8 }}>Select Profile</span>}
                                            </>
                                        );
                                    })()
                                )}
                            </div>
                            <span style={{ fontSize: '12px', opacity: 0.5 }}>▼</span>
                        </button>

                        {showDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1000,
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                marginTop: '4px',
                                boxShadow: 'var(--shadow-lg)',
                                maxHeight: '250px',
                                overflowY: 'auto'
                            }}>
                                {profiles.map(p => {
                                    const title = p.marketing_title || p.organization_name;
                                    const subTitle = p.organization_name;
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                selectProfile(p);
                                                setShowDropdown(false);
                                            }}
                                            style={{
                                                padding: '10px 15px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid var(--color-border)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                lineHeight: '1.2',
                                                background: selectedId === p.id ? 'var(--color-input-bg)' : 'transparent'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-input-bg)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = selectedId === p.id ? 'var(--color-input-bg)' : 'transparent'}
                                        >
                                            <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text)' }}>{title}</span>
                                            {showSubs && subTitle && subTitle !== title && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{subTitle}</span>}
                                        </div>
                                    );
                                })}
                                <div
                                    onClick={() => {
                                        handleAddNew();
                                        setShowDropdown(false);
                                    }}
                                    style={{
                                        padding: '10px 15px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        lineHeight: '1.2',
                                        background: selectedId === 'new' ? 'var(--color-input-bg)' : 'transparent',
                                        color: 'var(--color-primary)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-input-bg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = selectedId === 'new' ? 'var(--color-input-bg)' : 'transparent'}
                                >
                                    <span style={{ fontWeight: '700', fontSize: '13px' }}>+ {t.addNew}</span>
                                    {showSubs && <span style={{ fontSize: '11px', opacity: 0.8 }}>Add New Profile</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: '600',
                            height: '44px',
                            justifyContent: 'center'
                        }}
                    >
                        <IconSave size={20} />
                        <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                            <div style={{ fontSize: '13px' }}>{t.save}</div>
                            {showSubs && <div style={{ fontSize: '10px', fontWeight: '400', opacity: 0.9 }}>Save Profile</div>}
                        </div>
                    </button>
                </div>
            </div>

            {/* Main Form */}
            <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: isMobile ? '20px 15px' : '30px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h2 style={{ fontSize: '24px', margin: '0 0 20px 0', color: 'var(--color-text)', display: 'flex', flexDirection: 'column' }}>
                    {selectedId === 'new' ? (
                        <>
                            <span>{t.newCoolieProfile}</span>
                            {showSubs && <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--color-text-muted)', marginTop: '4px' }}>New Coolie Profile</span>}
                        </>
                    ) : (
                        <>
                            <span>{t.editCoolieProfile}</span>
                            {showSubs && <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--color-text-muted)', marginTop: '4px' }}>Edit Coolie Profile</span>}
                        </>
                    )}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '15px' : '20px' }}>

                    {/* Logo Upload Section */}
                    <div style={{ gridColumn: 'span 2', marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.organizationLogo}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Organization Logo</div>}
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            {formData.logo && (
                                <img
                                    src={formData.logo}
                                    alt="Logo Preview"
                                    style={{ height: '80px', maxWidth: '200px', objectFit: 'contain', border: '1px solid #eee', padding: '5px' }}
                                />
                            )}
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml"
                                onChange={handleLogoChange}
                                style={{
                                    padding: '10px',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '4px',
                                    background: 'var(--color-input-bg)',
                                    color: 'var(--color-text)'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2', marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.billTheme || 'பில் தீம்'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>{t.billThemeDesc || 'Select theme for preview and print'}</div>}
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ position: 'relative', minWidth: '220px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 15px',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        background: 'var(--color-surface)',
                                        color: 'var(--color-text)',
                                        height: '54px', // Taller for subtitles
                                        textAlign: 'left',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                        <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                            {formData.theme_color === '#388e3c' ? t.green : t.violet}
                                        </span>
                                        {showSubs && (
                                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '400' }}>
                                                {formData.theme_color === '#388e3c' ? 'Green' : 'Violet'}
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '12px', opacity: 0.5 }}>▼</span>
                                </button>

                                {showThemeDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 1000,
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        marginTop: '4px',
                                        boxShadow: 'var(--shadow-lg)',
                                        overflow: 'hidden'
                                    }}>
                                        {[
                                            { name: t.green, sub: 'Green', val: '#388e3c' },
                                            { name: t.violet, sub: 'Violet', val: '#6a1b9a' }
                                        ].map(theme => (
                                            <div
                                                key={theme.val}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, theme_color: theme.val }));
                                                    setShowThemeDropdown(false);
                                                }}
                                                style={{
                                                    padding: '10px 15px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid var(--color-border)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    lineHeight: '1.2',
                                                    background: formData.theme_color === theme.val ? 'var(--color-input-bg)' : 'transparent'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-input-bg)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = formData.theme_color === theme.val ? 'var(--color-input-bg)' : 'transparent'}
                                            >
                                                <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text)' }}>{theme.name}</span>
                                                {showSubs && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{theme.sub}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: formData.theme_color,
                                border: '3px solid white',
                                boxShadow: '0 0 0 1px #ddd',
                                transition: 'all 0.3s ease'
                            }}></div>
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.companyNameTamil}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Organization Name (Tamil)</div>}
                        </label>
                        <div className="autocomplete-wrapper">
                            <input
                                type="text"
                                name="marketing_title"
                                value={formData.marketing_title}
                                onChange={handleChange}
                                className="input-field"
                                placeholder={!showSubs ? t.enterOrgName : ''}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                            />
                            {showSubs && !formData.marketing_title && (
                                <div className="dual-placeholder-overlay">
                                    <span className="dual-placeholder-primary">{t.enterOrgName}</span>
                                    <span className="dual-placeholder-sub">Enter Organization Name</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.companyNameEnglish}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Organization Name (English)</div>}
                        </label>
                        <div className="autocomplete-wrapper">
                            <input
                                type="text"
                                name="organization_name"
                                value={formData.organization_name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder={!showSubs ? t.enterOrgName : ''}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                            />
                            {showSubs && !formData.organization_name && (
                                <div className="dual-placeholder-overlay">
                                    <span className="dual-placeholder-primary">{t.enterOrgName}</span>
                                    <span className="dual-placeholder-sub">Enter Organization Name</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <h3 style={{ fontSize: '16px', margin: '15px 0 10px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '5px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{t.addressDetails}</span>
                            {showSubs && <span style={{ fontSize: '11px', fontWeight: 'normal' }}>Address Details</span>}
                        </h3>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.address}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Address (Tamil)</div>}
                        </label>
                        <div className="autocomplete-wrapper">
                            <textarea
                                name="address_line2"
                                value={formData.address_line2}
                                onChange={handleChange}
                                rows={2}
                                placeholder={!showSubs ? t.enterAddress : ''}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)', resize: 'vertical' }}
                            />
                            {showSubs && !formData.address_line2 && (
                                <div className="dual-placeholder-overlay textarea-placeholder">
                                    <span className="dual-placeholder-primary">{t.enterAddress}</span>
                                    <span className="dual-placeholder-sub">Address in Tamil</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.address}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Address (English)</div>}
                        </label>
                        <div className="autocomplete-wrapper">
                            <textarea
                                name="address_line1"
                                value={formData.address_line1}
                                onChange={handleChange}
                                rows={2}
                                placeholder={!showSubs ? t.enterAddress : ''}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)', resize: 'vertical' }}
                            />
                            {showSubs && !formData.address_line1 && (
                                <div className="dual-placeholder-overlay textarea-placeholder">
                                    <span className="dual-placeholder-primary">{t.addressEnglish}</span>
                                    <span className="dual-placeholder-sub">Address in English</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.cityTamil}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>City (Tamil)</div>}
                            </label>
                            <div className="autocomplete-wrapper">
                                <input
                                    type="text"
                                    name="cityTamil"
                                    value={bankData.cityTamil}
                                    onChange={handleBankChange}
                                    placeholder={!showSubs ? t.cityShort : ""}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                                {showSubs && !bankData.cityTamil && (
                                    <div className="dual-placeholder-overlay">
                                        <span className="dual-placeholder-primary">{t.cityShort}</span>
                                        <span className="dual-placeholder-sub">City in Tamil</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.cityEnglish}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>City (English)</div>}
                            </label>
                            <div className="autocomplete-wrapper">
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder={!showSubs ? t.cityEnglish : ""}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                                {showSubs && !formData.city && (
                                    <div className="dual-placeholder-overlay">
                                        <span className="dual-placeholder-primary">{t.cityEnglish}</span>
                                        <span className="dual-placeholder-sub">Enter City</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.pincode}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Pincode</div>}
                            </label>
                            <div className="autocomplete-wrapper">
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder={!showSubs ? t.pincode : ""}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                                {showSubs && !formData.pincode && (
                                    <div className="dual-placeholder-overlay">
                                        <span className="dual-placeholder-primary">{t.pincode}</span>
                                        <span className="dual-placeholder-sub">Pincode</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* District Row - Responsive */}
                    <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>மாவட்டம் (Tamil)</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>District (Tamil)</div>}
                            </label>
                            <div className="autocomplete-wrapper">
                                <input
                                    type="text"
                                    name="district_tamil"
                                    value={formData.district_tamil}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>District (English)</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>District (English)</div>}
                            </label>
                            <div className="autocomplete-wrapper">
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <h3 style={{ fontSize: '16px', margin: '15px 0 10px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '5px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{t.bankAndContact}</span>
                            {showSubs && <span style={{ fontSize: '11px', fontWeight: 'normal' }}>Bank & Contact</span>}
                        </h3>
                    </div>

                    {/* Bank Details Structured */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.bankNameTamil}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Bank Name (Tamil)</div>}
                        </label>
                        <div className="autocomplete-wrapper">
                            <input
                                type="text"
                                name="bankNameTamil"
                                value={bankData.bankNameTamil}
                                onChange={handleBankChange}
                                placeholder={!showSubs ? t.bankNameTamil : ''}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                            />
                            {showSubs && !bankData.bankNameTamil && (
                                <div className="dual-placeholder-overlay">
                                    <span className="dual-placeholder-primary">{t.bankNameTamil}</span>
                                    <span className="dual-placeholder-sub">Bank Name in Tamil</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.bankNameEnglish}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Bank Name (English)</div>}
                        </label>
                        <div className="autocomplete-wrapper">
                            <input
                                type="text"
                                name="bankName"
                                value={bankData.bankName}
                                onChange={handleBankChange}
                                placeholder={!showSubs ? t.bankNameEnglish : ""}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                            />
                            {showSubs && !bankData.bankName && (
                                <div className="dual-placeholder-overlay">
                                    <span className="dual-placeholder-primary">{t.bankNameEnglish}</span>
                                    <span className="dual-placeholder-sub">e.g. HDFC Bank</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.accountNo}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Account Number</div>}
                        </label>
                        <div className="autocomplete-wrapper">
                            <input
                                type="text"
                                name="accountNo"
                                value={bankData.accountNo}
                                onChange={handleBankChange}
                                placeholder={!showSubs ? t.accountNo : ""}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                            />
                            {showSubs && !bankData.accountNo && (
                                <div className="dual-placeholder-overlay">
                                    <span className="dual-placeholder-primary">{t.accountNo}</span>
                                    <span className="dual-placeholder-sub">Account Number</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.ifscCode}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>IFSC Code</div>}
                        </label>
                        <div className="autocomplete-wrapper">
                            <input
                                type="text"
                                name="ifsc"
                                value={bankData.ifsc}
                                onChange={handleBankChange}
                                placeholder={!showSubs ? t.ifscCode : ''}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                            />
                            {showSubs && !bankData.ifsc && (
                                <div className="dual-placeholder-overlay">
                                    <span className="dual-placeholder-primary">{t.ifscCode}</span>
                                    <span className="dual-placeholder-sub">IFSC Code</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.bankBranchTamil}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Bank Place/Branch (Tamil)</div>}
                        </label>
                        <div className="autocomplete-wrapper">
                            <input
                                type="text"
                                name="placeTamil"
                                value={bankData.placeTamil}
                                onChange={handleBankChange}
                                placeholder={!showSubs ? t.bankBranchTamil : ""}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                            />
                            {showSubs && !bankData.placeTamil && (
                                <div className="dual-placeholder-overlay">
                                    <span className="dual-placeholder-primary">{t.bankBranchTamil}</span>
                                    <span className="dual-placeholder-sub">Branch in Tamil</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.bankBranchEnglish}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Bank Place/Branch (English)</div>}
                        </label>
                        <div className="autocomplete-wrapper">
                            <input
                                type="text"
                                name="place"
                                value={bankData.place}
                                onChange={handleBankChange}
                                placeholder={!showSubs ? t.bankBranchEnglish : ""}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                            />
                            {showSubs && !bankData.place && (
                                <div className="dual-placeholder-overlay">
                                    <span className="dual-placeholder-primary">{t.bankBranchEnglish}</span>
                                    <span className="dual-placeholder-sub">Enter Bank Branch</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Multiple Phone Numbers */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.phoneNumbers}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Phone Numbers</div>}
                        </label>
                        {phones.map((phone, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <div className="autocomplete-wrapper" style={{ flex: 1 }}>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => handlePhoneChange(idx, e.target.value)}
                                        placeholder={!showSubs ? t.phoneNumbers : ""}
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                                    />
                                    {showSubs && !phone && (
                                        <div className="dual-placeholder-overlay">
                                            <span className="dual-placeholder-primary">{t.phoneNumbers}</span>
                                            <span className="dual-placeholder-sub">e.g. 9876543210</span>
                                        </div>
                                    )}
                                </div>
                                {phones.length > 1 && (
                                    <button
                                        onClick={() => removePhone(idx)}
                                        style={{ padding: '0 15px', color: 'white', background: '#dc3545', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={addPhone}
                            style={{ padding: '8px 20px', fontSize: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2', textAlign: 'center' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <IconPlus size={14} />
                                <span style={{ fontWeight: '700', fontSize: '13px' }}>{t.addNumber}</span>
                            </div>
                            {showSubs && <span style={{ fontSize: '11px', opacity: 0.8 }}>Add Phone Number</span>}
                        </button>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.email}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Email</div>}
                        </label>
                        <div className="autocomplete-wrapper">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={!showSubs ? t.email : ""}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                            />
                            {showSubs && !formData.email && (
                                <div className="dual-placeholder-overlay">
                                    <span className="dual-placeholder-primary">{t.email}</span>
                                    <span className="dual-placeholder-sub">Email Address</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hidden fields for valid HTML form logic if needed, or just omitted visually */}
                    <div style={{ display: 'none' }}>
                        <input name="gstin" value="" readOnly />
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                background: 'var(--color-primary)', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            <IconSave size={20} />
                            <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                                <div style={{ fontWeight: '700' }}>{t.save}</div>
                                {showSubs && <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.9 }}>Save Settings</div>}
                            </div>
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
}

export default CoolieBusinessManager;
