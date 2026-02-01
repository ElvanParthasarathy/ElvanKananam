import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { IconSave } from '../common/Icons';
import { useToast } from '../../context/ToastContext';
import { showSubtitles } from '../../config/translations';

function SilksBusinessManager({ t, language }) {
    const showSubs = showSubtitles(language);
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([]);
    const [selectedId, setSelectedId] = useState(null); // 'new' or ID
    const [formData, setFormData] = useState({
        organization_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: 'Tamil Nadu',
        pincode: '',
        phone: '',
        email: '',
        gstin: '',
        website: '',
        marketing_title: '',
        logo: '',
        cgst_rate: 2.5,
        sgst_rate: 2.5,
        type: 'silks' // Hardcoded for Silks
    });

    useEffect(() => {
        fetchProfiles();
    }, []);

    async function fetchProfiles() {
        setLoading(true);
        // STRICT FILTER: Type = silks
        let query = supabase
            .from('organization_profile')
            .select('*')
            .eq('type', 'silks')
            .order('organization_name', { ascending: true });

        const { data, error } = await query;

        if (error) {
            console.log('Error fetching profiles:', error.message);
        } else {
            setProfiles(data || []);
            // Auto-select first if available and nothing selected
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
        setFormData({
            organization_name: profile.organization_name || '',
            address_line1: profile.address_line1 || '',
            address_line2: profile.address_line2 || '',
            city: profile.city || '',
            state: profile.state || 'Tamil Nadu',
            pincode: profile.pincode || '',
            phone: profile.phone || '',
            email: profile.email || '',
            gstin: profile.gstin || '',
            website: profile.website || '',
            marketing_title: profile.marketing_title || '',
            logo: profile.logo || '',
            cgst_rate: profile.cgst_rate || 2.5,
            sgst_rate: profile.sgst_rate || 2.5,
            type: 'silks' // Enforce type
        });
    };

    const handleAddNew = () => {
        setSelectedId('new');
        setFormData({
            organization_name: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: 'Tamil Nadu',
            pincode: '',
            phone: '',
            email: '',
            gstin: '',
            website: '',
            marketing_title: '',
            logo: '',
            cgst_rate: 2.5,
            sgst_rate: 2.5,
            type: 'silks' // Enforce type
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            showToast(showSubs ? `${t.orgNameRequired || 'நிறுவன பெயர் தேவை'} / Organization Name is required` : (t.orgNameRequired || 'நிறுவன பெயர் தேவை'), 'warning');
            return;
        }

        const payload = { ...formData, type: 'silks' }; // Double enforce type
        let error;

        if (selectedId && selectedId !== 'new') {
            const { error: updateError } = await supabase
                .from('organization_profile')
                .update(payload)
                .eq('id', selectedId);
            error = updateError;
        } else {
            const { data, error: insertError } = await supabase
                .from('organization_profile')
                .insert([payload])
                .select()
                .single();
            error = insertError;
            if (data) setSelectedId(data.id);
        }

        if (error) {
            showToast(`${t.error || 'பிழை'}: ${error.message}`, 'error');
        } else {
            showToast(showSubs ? `${t.businessSaved || 'நிறுவன விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டது'} / Organization Profile Saved Successfully` : (t.businessSaved || 'நிறுவன விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டது'), 'success');
            fetchProfiles(); // Refresh list to show new name/changes
        }
    };

    if (loading && profiles.length === 0) return <div style={{ padding: '30px' }}>{showSubs ? `${t.loading || 'ஏற்றுகிறது...'} / Loading Profiles...` : (t.loading || 'ஏற்றுகிறது...')}</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>

            {/* Sidebar List */}
            <div style={{ width: '250px', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--color-text)' }}>{t.businesses || 'நிறுவனங்கள்'}</h2>
                        {showSubs && <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Silks Businesses</span>}
                    </div>
                    <button
                        onClick={handleAddNew}
                        style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Add New Business"
                    >
                        +
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {profiles.map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => selectProfile(profile)}
                            style={{
                                textAlign: 'left',
                                padding: '10px 15px',
                                background: selectedId === profile.id ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: selectedId === profile.id ? 'white' : 'var(--color-text)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {profile.organization_name}
                        </button>
                    ))}
                    {selectedId === 'new' && (
                        <button
                            style={{
                                textAlign: 'left',
                                padding: '10px 15px',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                border: '1px dashed var(--color-primary)',
                                borderRadius: '6px',
                                cursor: 'default',
                                fontStyle: 'italic',
                                fontSize: '13px'
                            }}
                        >
                            {t.newBusiness || 'புதிய நிறுவனம்'}... {showSubs && <span style={{ fontSize: '11px', opacity: 0.8 }}>/ New Business...</span>}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Form */}
            <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--color-text)' }}>
                        {selectedId === 'new' ? (showSubs ? `${t.newBusiness || 'புதிய நிறுவனம்'} / Create New Profile` : (t.newBusiness || 'புதிய நிறுவனம்')) : (showSubs ? `${t.editBusinessProfile || 'நிறுவனத்தை திருத்த'} / Edit Profile` : (t.editBusinessProfile || 'நிறுவனத்தை திருத்த'))}
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                    {/* Logo Upload Section */}
                    <div style={{ gridColumn: 'span 2', marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.organizationLogo || 'நிறுவன லோகோ'}</div>
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
                        <p style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>Ideally a transparent PNG.</p>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.companyNameTamil || 'நிறுவனம் பெயர் (தமிழ்)'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Organization Name (Tamil)</div>}
                        </label>
                        <input
                            type="text"
                            name="organization_name"
                            value={formData.organization_name}
                            onChange={handleChange}
                            className="input-field"
                            placeholder={showSubs ? `${t.typeCompanyName || 'நிறுவனத்தின் பெயரை உள்ளிடவும்'} / Enter Organization Name in Tamil` : (t.typeCompanyName || 'நிறுவனத்தின் பெயரை உள்ளிடவும்')}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.marketingTitle || 'விளம்பர தலைப்பு'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Marketing Title (e.g. Handloom Silk Sarees & Rawsilk)</div>}
                        </label>
                        <input
                            type="text"
                            name="marketing_title"
                            value={formData.marketing_title}
                            onChange={handleChange}
                            className="input-field"
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '5px', margin: '15px 0' }}>
                            <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--color-text)' }}>{t.address || 'முகவரி'}</h3>
                            {showSubs && <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Address</span>}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.addressLine1 || 'முகவரி வரி 1'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Street 1</div>}
                        </label>
                        <input
                            type="text"
                            name="address_line1"
                            value={formData.address_line1}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.addressLine2 || 'முகவரி வரி 2'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Street 2</div>}
                        </label>
                        <input
                            type="text"
                            name="address_line2"
                            value={formData.address_line2}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.city || 'ஊர்'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>City</div>}
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.state || 'மாநிலம்'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>State</div>}
                        </label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.pincode || 'அஞ்சல் குறியீடு'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Pincode</div>}
                        </label>
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '5px', margin: '15px 0' }}>
                            <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--color-text)' }}>{t.additionalInfo || 'கூடுதல் தகவல்'}</h3>
                            {showSubs && <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Additional Info</span>}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.phone || 'தொலைபேசி எண்'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Phone</div>}
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.email || 'மின்னஞ்சல்'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Email</div>}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.gstNumber || 'ஜிஎஸ்டி எண் (GSTIN)'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>GSTIN</div>}
                        </label>
                        <input
                            type="text"
                            name="gstin"
                            value={formData.gstin}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{t.website || 'இணையதளம்'}</div>
                            {showSubs && <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Website</div>}
                        </label>
                        <input
                            type="text"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '5px', margin: '15px 0' }}>
                            <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--color-text)' }}>{t.taxSettings || 'வரி அமைப்புகள்'}</h3>
                            {showSubs && <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Tax Configuration</span>}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>CGST (%)</div>
                            <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Default CGST (%)</div>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="cgst_rate"
                            value={formData.cgst_rate}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>SGST (%)</div>
                            <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Default SGST (%)</div>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="sgst_rate"
                            value={formData.sgst_rate}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                background: 'var(--color-brand-silks)', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px'
                            }}
                        >
                            <IconSave size={18} /> {showSubs ? `${t.saveDetails || 'பதிவை சேமி'} / Save Details` : (t.saveDetails || 'பதிவை சேமி')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SilksBusinessManager;
